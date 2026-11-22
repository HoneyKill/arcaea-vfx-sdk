export const ABI_VERSION: u32 = 1;
export const INIT_CONFIG_BYTES: u32 = 32;
export const NODE_CONFIG_BYTES: u32 = 48;
export const FRAME_INPUT_BYTES: u32 = 2976;
export const SCENE_INPUT_OFFSET: usize = 1344;
export const SHADER_ASSET_PATHS: u32 = 1;

export enum Scene {
  None = 0, Start, MainMenu, PackSelect, SongSelect, Gameplay, Results, Downloads
}
export enum ScenePhase { Enter = 0, Exit }
export enum Scope { Global = 0, Chart }
export enum NodeKind { Canvas = 0, Sprite, Image, Text, Mesh, Clone, Native, LiveText }
export enum Layer { Background = 0, Playfield, Foreground, Hud }
export enum Blend { Alpha = 0, Add, Multiply, Replace, Screen, Composite }
export enum FrameFlag { Seeking = 1, Mirror = 2, Paused = 4, ReducedMotion = 8, Autoplay = 16, Practice = 32, FixedBpm = 64 }
export enum Feature {
  UintIndices = 1, Instancing = 2, HudPost = 4, DepthStencil = 8,
  NoteMesh = 16, DepthTexture = 32, ScenePresentation = 64, JudgmentCounts = 128,
  ArcProjectionMesh = 256, AssetReadErrors = 512
}
export enum TextureFlag { StraightAlpha = 1, Repeat = 2, Mipmap = 4, Nearest = 8 }
export enum TargetFlag { PingPong = 1, Depth = 2, Linear = 4 }
export enum PostFlag { Clear = 1, Depth = 2 }
export enum IndexFormat { U16 = 16, U32 = 32 }
export enum CameraMode { Relative = 0, Absolute, WorldOffset }
export enum NotePart { TapBody = 0, HoldBody, ArcBody, ArcProjection, ArcTap, ArcTapProjection, FlickBody }
export enum NoteMeshFit { Local = 0, Width, Quad }
export enum NoteMeshVariant { CustomSound = 1, Light = 2, Dark = 4 }
export const NOTE_MESH_VARIANT_COUNT: u32 = 6;
export enum NoteFlag { Trace = 1, Input = 2 }
export enum PaletteFlag { High = 1, Low = 2, Projection = 4 }
export enum GroupFlag {
  Hidden = 1, HideProjection = 2, HideArcHead = 4, HideArcCap = 8, HideGuides = 16,
  KeepBody = 32, ReflectX = 64, LightStyle = 128, DarkStyle = 256
}
export enum AssetReadError { NotFound = -1, BufferTooSmall = -2, ReadFailed = -3, TooLarge = -4 }
export enum ImportSource { Archive = 0, Package }
export enum Opcode {
  Mat4 = 1, Color, Camera, UniformF4, UniformMat4, BindShader, MeshUpload, Instances,
  Particles, NoteOverride, GroupPolicy, Text, RenderGraph, PlaySfx,
  NoteMeshBind, NodeOrder, TextLayout, NodeUniformF4, NotePalette, GroupNoteTransform, Mat4Adjust
}

@external("arcaea", "host_find_object") export declare function findObject(name: u32, length: u32): i32;
@external("arcaea", "host_describe_object") export declare function describeObject(handle: i32, out: u32): i32;
@external("arcaea", "host_create_node") export declare function createNode(kind: u32, config: u32, bytes: u32): i32;
@external("arcaea", "host_set_parent") export declare function setParent(child: i32, parent: i32, keepWorld: u32): i32;
@external("arcaea", "host_load_texture") export declare function loadTexture(path: u32, length: u32, flags: u32): i32;
@external("arcaea", "host_create_shader") export declare function createShader(vertex: u32, vertexBytes: u32, fragment: u32, fragmentBytes: u32, flags: u32): i32;
@external("arcaea", "host_uniform_slot") export declare function uniformSlot(shader: i32, name: u32, bytes: u32): i32;
@external("arcaea", "host_create_rt") export declare function createTarget(scale: u32, flags: u32): i32;
@external("arcaea", "host_bind_note_shader") export declare function bindNoteShader(part: u32, shader: i32, flags: u32): i32;
@external("arcaea", "host_read_notes") export declare function readNotes(first: u32, count: u32, out: u32): i32;
@external("arcaea", "host_read_note_ordinals") export declare function readNoteOrdinals(first: u32, count: u32, out: u32): i32;
@external("arcaea", "host_read_timings") export declare function readTimings(group: u32, first: u32, count: u32, out: u32): i32;
@external("arcaea", "host_override_paths") export declare function overridePaths(paths: u32, count: u32): i32;
@external("arcaea", "host_load_sfx") export declare function loadSfx(path: u32, length: u32): i32;
@external("arcaea", "host_read_param") export declare function readParam(key: u32, length: u32, out: u32): i32;
@external("arcaea", "host_log") export declare function logMessage(severity: u32, message: u32, bytes: u32): void;
@external("arcaea", "host_read_asset") export declare function readAsset(path: u32, length: u32, out: u32, capacity: u32): i32;
@external("arcaea", "host_import_write") export declare function importWrite(path: u32, pathBytes: u32, data: u32, bytes: u32): i32;
@external("arcaea", "host_import_copy") export declare function importCopy(source: u32, sourceBytes: u32, output: u32, outputBytes: u32, sourceKind: u32): i32;

/** Surface compiler aborts as a WebAssembly trap. */
@global
export function arcaeaAbort(message: string | null = null, file: string | null = null, line: u32 = 0, column: u32 = 0): void {
  unreachable();
}

/** Reserve host-writable guest memory aligned to an ABI power of two. */
export function allocate(bytes: u32, align: u32): u32 {
  if (!bytes || !align || (align & (align - 1)) || bytes > u32.MAX_VALUE - (align - 1)) return 0;
  const block = <u32>heap.alloc(bytes + align - 1);
  return (block + align - 1) & ~(align - 1);
}

/** Resolve a public node while its scene is entering. */
export function find(name: string): i32 {
  const utf8 = String.UTF8.encode(name);
  return findObject(changetype<u32>(utf8), <u32>utf8.byteLength);
}

/** Compile or reload a shader using the assets declared in the author's package. */
export function shaderFiles(vertex: string, fragment: string): i32 {
  const first = String.UTF8.encode(vertex);
  const second = String.UTF8.encode(fragment);
  return createShader(changetype<u32>(first), <u32>first.byteLength,
    changetype<u32>(second), <u32>second.byteLength, SHADER_ASSET_PATHS);
}

/** Resolve one numeric uniform slot while entering a scene. */
export function slot(shader: i32, name: string): i32 {
  const bytes = String.UTF8.encode(name);
  return uniformSlot(shader, changetype<u32>(bytes), <u32>bytes.byteLength);
}

/** Pack RGBA into the ABI's little-endian channel order. */
export function rgba(red: u8, green: u8, blue: u8, alpha: u8): u32 {
  return <u32>red | (<u32>green << 8) | (<u32>blue << 16) | (<u32>alpha << 24);
}

/** Read the initialization record supplied to mod_init. */
export namespace Init {
  /** Read the ABI revision. */
  export function version(ptr: usize): u32 { return load<u32>(ptr); }
  /** Read the record's size in bytes. */
  export function bytes(ptr: usize): u32 { return load<u32>(ptr + 4); }
  /** Read the module scope. */
  export function scope(ptr: usize): u32 { return load<u32>(ptr + 8); }
  /** Read the scene ID. */
  export function scene(ptr: usize): u32 { return load<u32>(ptr + 12); }
  /** Read the chart difficulty slot, or -1 outside gameplay. */
  export function difficulty(ptr: usize): i32 { return load<i32>(ptr + 16); }
  /** Read the count for host_read_notes. */
  export function noteCount(ptr: usize): u32 { return load<u32>(ptr + 20); }
  /** Read the count of timing groups. */
  export function timingGroupCount(ptr: usize): u32 { return load<u32>(ptr + 24); }
  /** Read the Feature flags advertised on initialization. */
  export function features(ptr: usize): u32 { return load<u32>(ptr + 28); }
}

/** Borrow the shared frame without allocating a per-frame typed object. */
export namespace Frame {
  export function scene(ptr: usize): u32 { return load<u32>(ptr); }
  export function flags(ptr: usize): u32 { return load<u32>(ptr + 4); }
  export function appSeconds(ptr: usize): f64 { return load<f64>(ptr + 8); }
  export function delta(ptr: usize): f32 { return load<f32>(ptr + 16); }
  export function rms(ptr: usize): f32 { return load<f32>(ptr + 20); }
  export function onset(ptr: usize): f32 { return load<f32>(ptr + 24); }
  /** Read the number of published touch records. */
  export function touchCount(ptr: usize): u32 { return load<u32>(ptr + 28); }
  /** Borrow a ModTouchPoint_t record, or return zero for an absent contact. */
  export function touch(ptr: usize, index: u32): usize {
    return index < min<u32>(touchCount(ptr), 10) ? ptr + 1104 + index * 24 : 0;
  }
  /** Read a component of the pixel viewport in x, y, width, height order. */
  export function viewport(ptr: usize, index: u32): f32 { return index < 4 ? load<f32>(ptr + 32 + index * 4) : 0; }
  export function designWidth(ptr: usize): f32 { return load<f32>(ptr + 48); }
  export function designHeight(ptr: usize): f32 { return load<f32>(ptr + 52); }
  export function band(ptr: usize, index: u32): f32 { return index < 4 ? load<f32>(ptr + 64 + index * 4) : 0; }
  export function spectrum(ptr: usize, index: u32): f32 { return index < 256 ? load<f32>(ptr + 80 + index * 4) : 0; }
  export function chartTime(ptr: usize): i32 { return load<i32>(ptr + SCENE_INPUT_OFFSET); }
  export function beat(ptr: usize): f32 { return load<f32>(ptr + SCENE_INPUT_OFFSET + 8); }
  export function hitCount(ptr: usize): u32 { return load<u32>(ptr + SCENE_INPUT_OFFSET + 36); }
  export function hit(ptr: usize, index: u32): usize {
    return index < min<u32>(hitCount(ptr), 64) ? ptr + SCENE_INPUT_OFFSET + 64 + index * 24 : 0;
  }
  export function histogram(ptr: usize, bin: u32): u32 {
    return bin < 64 ? load<u32>(ptr + SCENE_INPUT_OFFSET + 48 + bin * 4) : 0;
  }
  /** Borrow the scene union using the corresponding C layout. */
  export function sceneInput(ptr: usize): usize { return ptr + SCENE_INPUT_OFFSET; }
  /** Borrow ModJudgmentCounts_t when the gameplay initialization advertised JudgmentCounts. */
  export function judgmentCounts(ptr: usize): usize { return sceneInput(ptr) + 1600; }
}

/** Own one guest command buffer and recycle it across frames. */
export class CommandWriter {
  private buffer: usize = 0;
  private capacity: u32 = 0;
  private used: u32 = 0;

  /** Discard the previous frame's commands while retaining their storage. */
  begin(): void { this.used = 0; }

  /** Append an aligned TLV and return its zeroed payload pointer. */
  command(opcode: Opcode, bytes: u32): usize {
    if (bytes > u32.MAX_VALUE - 3) return 0;
    const padded = (bytes + 3) & 0xfffffffc;
    if (padded > u32.MAX_VALUE - 8 || this.used > u32.MAX_VALUE - 8 - padded) return 0;
    const end = this.used + 8 + padded;
    if (end > this.capacity) {
      const growth = this.capacity <= (u32.MAX_VALUE >> 1) ? this.capacity << 1 : end;
      const capacity = max<u32>(256, max<u32>(growth, end));
      this.buffer = this.buffer ? heap.realloc(this.buffer, capacity) : heap.alloc(capacity);
      this.capacity = capacity;
    }
    const at = this.buffer + this.used;
    store<u16>(at, <u16>opcode);
    store<u16>(at + 2, 0);
    store<u32>(at + 4, padded);
    memory.fill(at + 8, 0, padded);
    this.used = end;
    return at + 8;
  }

  /** Append a native node transform from a sixteen-float matrix. */
  matrix(handle: i32, matrix: usize): bool {
    const at = this.command(Opcode.Mat4, 68);
    if (!at) return false;
    store<i32>(at, handle);
    memory.copy(at + 4, matrix, 64);
    return true;
  }

  /** Append a color and visibility record. */
  color(handle: i32, packed: u32, visible: bool = true, blend: Blend = Blend.Alpha, sort: i16 = 0): bool {
    const at = this.command(Opcode.Color, 12);
    if (!at) return false;
    store<i32>(at, handle);
    store<u32>(at + 4, packed);
    store<u8>(at + 8, <u8>visible);
    store<u8>(at + 9, <u8>blend);
    store<i16>(at + 10, sort);
    return true;
  }

  /** Write an already-resolved shader uniform. */
  uniform(shader: i32, slotId: i32, x: f32, y: f32 = 0, z: f32 = 0, w: f32 = 0): bool {
    const at = this.command(Opcode.UniformF4, 24);
    if (!at) return false;
    store<i32>(at, shader);
    store<i32>(at + 4, slotId);
    store<f32>(at + 8, x); store<f32>(at + 12, y);
    store<f32>(at + 16, z); store<f32>(at + 20, w);
    return true;
  }

  /** Append UTF-8 text, returning false when its size cannot be represented. */
  text(handle: i32, value: string): bool {
    const utf8 = String.UTF8.encode(value);
    const count = <u32>utf8.byteLength;
    if (count > u32.MAX_VALUE - 8) return false;
    const at = this.command(Opcode.Text, count + 8);
    if (!at) return false;
    store<i32>(at, handle);
    store<u32>(at + 4, count);
    memory.copy(at + 8, changetype<usize>(utf8), count);
    return true;
  }

  /** Publish the current frame to the provided command-slice address. */
  finish(slice: usize): void {
    store<u32>(slice, <u32>this.buffer);
    store<u32>(slice + 4, this.used);
  }
}

/** Work with time intervals in chart milliseconds or application seconds. */
export namespace Timeline {
  export function phase(now: f32, first: f32, last: f32): f32 {
    return last > first ? max<f32>(0, min<f32>(1, (now - first) / (last - first))) : <f32>(now >= last);
  }
  export function mix(a: f32, b: f32, fraction: f32): f32 { return a + (b - a) * fraction; }
}

/** Evaluate common visual interpolation curves. */
export namespace Easing {
  export function smooth(value: f32): f32 {
    const t = max<f32>(0, min<f32>(1, value));
    return t * t * (3 - 2 * t);
  }
  export function easeOut(value: f32): f32 {
    const t = <f32>1 - max<f32>(0, min<f32>(1, value));
    return <f32>1 - t * t * t;
  }
}

/** A reusable value for composing world-space positions. */
export class Vec3 {
  constructor(public x: f32 = 0, public y: f32 = 0, public z: f32 = 0) {}
  dot(other: Vec3): f32 { return this.x * other.x + this.y * other.y + this.z * other.z; }
  length(): f32 { return Mathf.sqrt(this.dot(this)); }
}

/** Write column-major matrices directly into guest storage. */
export namespace Mat4 {
  export function identity(out: usize): void {
    for (let i: usize = 0; i < 16; ++i) store<f32>(out + i * 4, i % 5 == 0 ? 1 : 0);
  }
  export function translation(out: usize, x: f32, y: f32, z: f32): void {
    identity(out);
    store<f32>(out + 48, x); store<f32>(out + 52, y); store<f32>(out + 56, z);
  }
  /** Write the product to storage that does not overlap either input. */
  export function multiply(out: usize, first: usize, second: usize): void {
    for (let row: usize = 0; row < 4; ++row) for (let column: usize = 0; column < 4; ++column) {
      let value: f32 = 0;
      for (let i: usize = 0; i < 4; ++i)
        value += load<f32>(first + (i * 4 + row) * 4) * load<f32>(second + (column * 4 + i) * 4);
      store<f32>(out + (column * 4 + row) * 4, value);
    }
  }
}
