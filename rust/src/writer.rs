use core::{arch::wasm32, mem::size_of, ptr, slice};

use crate::abi::{self, CommandSlice};

extern "C" { static __heap_base: u8; }

/// Reserve aligned bytes in the module's unshared linear memory.
#[derive(Default)]
pub struct Arena { next: usize }

impl Arena {
    pub const fn new() -> Self { Self { next: 0 } }

    /// Return zero when a request cannot be represented or the runtime denies growth.
    pub fn allocate(&mut self, size: u32, align: u32) -> u32 {
        if size == 0 || !align.is_power_of_two() { return 0; }
        let start = if self.next == 0 { unsafe { ptr::addr_of!(__heap_base) as usize } } else { self.next };
        let mask = align as usize - 1;
        let Some(offset) = start.checked_add(mask).map(|at| at & !mask) else { return 0; };
        let Some(end) = offset.checked_add(size as usize) else { return 0; };
        let required = (end >> 16) + ((end & 65535 != 0) as usize);
        let pages = wasm32::memory_size::<0>();
        if pages < required && wasm32::memory_grow::<0>(required - pages) == usize::MAX { return 0; }
        self.next = end;
        offset as u32
    }
}

/// Values whose initialized bytes can be written directly to a TLV payload.
pub unsafe trait Wire: Copy {}

macro_rules! wire {
    ($($item:ty),+ $(,)?) => { $(unsafe impl Wire for $item {})+ };
}

wire!(u16, u32, abi::MatrixCommand, abi::ColorCommand, abi::CameraCommand, abi::UniformF4,
    abi::UniformMat4, abi::ShaderBinding, abi::Vertex, abi::Instance, abi::Particle, abi::MeshUpload,
    abi::MeshInstances, abi::ParticleBatch, abi::NoteOverride, abi::GroupPolicy, abi::TextUpdate,
    abi::PostPass, abi::PlaySound, abi::NoteMeshBind, abi::NodeOrder, abi::TextLayout, abi::NodeUniformF4,
    abi::NotePalette, abi::GroupNoteTransform);

/// Own a reusable command buffer, growing it in the guest only when necessary.
#[derive(Default)]
pub struct CommandWriter { offset: u32, length: u32, capacity: u32 }

impl CommandWriter {
    pub const fn new() -> Self { Self { offset: 0, length: 0, capacity: 0 } }

    /// Begin a frame using the current allocation.
    pub fn begin(&mut self) { self.length = 0; }

    /// Append an aligned header followed by zero-initialized writable payload.
    pub fn reserve(&mut self, arena: &mut Arena, opcode: u16, payload: usize) -> Option<&mut [u8]> {
        let aligned = payload.checked_add(3)? & !3;
        let previous = self.length as usize;
        let required = previous.checked_add(8)?.checked_add(aligned)?;
        if required > self.capacity as usize {
            let capacity = self.capacity.saturating_mul(2).max(required as u32).max(256);
            let offset = arena.allocate(capacity, 4);
            if offset == 0 { return None; }
            if previous > 0 {
                // A growing arena never overlaps an earlier command allocation.
                unsafe { ptr::copy_nonoverlapping(self.offset as *const u8, offset as *mut u8, previous) };
            }
            self.offset = offset;
            self.capacity = capacity;
        }
        let bytes = unsafe { slice::from_raw_parts_mut((self.offset as usize + previous) as *mut u8, aligned + 8) };
        bytes[..2].copy_from_slice(&opcode.to_le_bytes());
        bytes[2..4].fill(0);
        bytes[4..8].copy_from_slice(&(aligned as u32).to_le_bytes());
        bytes[8..].fill(0);
        self.length = required as u32;
        Some(&mut bytes[8..8 + payload])
    }

    /// Append fixed-size ABI records such as a matrix or color batch.
    pub fn append<T: Wire>(&mut self, arena: &mut Arena, opcode: u16, values: &[T]) -> bool {
        let Some(size) = values.len().checked_mul(size_of::<T>()) else { return false; };
        let Some(payload) = self.reserve(arena, opcode, size) else { return false; };
        // Wire records use explicit padding and have no uninitialized bytes.
        let data = unsafe { slice::from_raw_parts(values.as_ptr().cast::<u8>(), size) };
        payload.copy_from_slice(data);
        true
    }

    /// Append a UTF-8 text update and retain the ABI's zero padding.
    pub fn text(&mut self, arena: &mut Arena, handle: i32, value: &str) -> bool {
        let Some(length) = value.len().checked_add(8) else { return false; };
        let Some(payload) = self.reserve(arena, abi::opcode::TEXT_UPDATE, length) else { return false; };
        payload[..4].copy_from_slice(&handle.to_le_bytes());
        payload[4..8].copy_from_slice(&(value.len() as u32).to_le_bytes());
        payload[8..].copy_from_slice(value.as_bytes());
        true
    }

    /// Return the span consumed by the main-thread command decoder.
    pub fn finish(&self, output: &mut CommandSlice) {
        *output = CommandSlice { ptr: self.offset, bytes: self.length };
    }
}
