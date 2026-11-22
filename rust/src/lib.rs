#![no_std]

pub use glam::{Mat4, Vec3, Vec4};

pub mod abi;
#[cfg(target_arch = "wasm32")]
mod writer;
#[cfg(target_arch = "wasm32")]
pub use writer::{Arena, CommandWriter, Wire};

/// Normalize a time on a finite timeline interval.
pub fn phase(time: f32, start: f32, end: f32) -> f32 {
    if start >= end {
        return (time >= end) as u32 as f32;
    }
    ((time - start) / (end - start)).clamp(0.0, 1.0)
}

/// Apply a cubic smoothstep to a normalized timeline value.
pub fn smoothstep(value: f32) -> f32 {
    let value = value.clamp(0.0, 1.0);
    value * value * (3.0 - 2.0 * value)
}

/// Pack RGBA channels in the ABI's little-endian order.
pub const fn rgba(red: u8, green: u8, blue: u8, alpha: u8) -> u32 {
    u32::from_le_bytes([red, green, blue, alpha])
}
