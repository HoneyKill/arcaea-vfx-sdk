use core::mem::{offset_of, size_of};

pub const VERSION: u32 = 1;
pub const SCOPE_GLOBAL: u32 = 0;
pub const SCOPE_CHART: u32 = 1;
pub const FEATURE_UINT_INDICES: u32 = 1 << 0;
pub const FEATURE_INSTANCING: u32 = 1 << 1;
pub const FEATURE_HUD_POST: u32 = 1 << 2;
pub const FEATURE_DEPTH_STENCIL: u32 = 1 << 3;
pub const FEATURE_NOTE_MESH: u32 = 1 << 4;
pub const FEATURE_DEPTH_TEXTURE: u32 = 1 << 5;
pub const FEATURE_SCENE_PRESENTATION: u32 = 1 << 6;
pub const FEATURE_JUDGMENT_COUNTS: u32 = 1 << 7;
pub const FEATURE_ARC_PROJECTION_MESH: u32 = 1 << 8;
pub const FEATURE_ASSET_READ_ERRORS: u32 = 1 << 9;
pub const NOTE_MESH_VARIANT_COUNT: u32 = 6;
pub const CAMERA_RELATIVE: u32 = 0;
pub const CAMERA_ABSOLUTE: u32 = 1;
pub const CAMERA_WORLD_OFFSET: u32 = 2;
/// Reflect the rendered group on its local X axis before applying the group rotation.
pub const GROUP_REFLECT_X: u32 = 1 << 6;
pub const PHASE_ENTER: u32 = 0;
pub const PHASE_EXIT: u32 = 1;

pub mod scene {
    pub const NONE: u32 = 0;
    pub const START: u32 = 1;
    pub const MAIN_MENU: u32 = 2;
    pub const PACK_SELECT: u32 = 3;
    pub const SONG_SELECT: u32 = 4;
    pub const GAMEPLAY: u32 = 5;
    pub const RESULTS: u32 = 6;
    pub const DOWNLOADS: u32 = 7;
}

pub mod flag {
    pub const SEEKING: u32 = 1;
    pub const MIRROR: u32 = 2;
    pub const PAUSED: u32 = 4;
    pub const REDUCED_MOTION: u32 = 8;
    pub const AUTOPLAY: u32 = 16;
    pub const PRACTICE: u32 = 32;
    pub const FIXED_BPM: u32 = 64;
}

pub mod layer {
    pub const BACKGROUND: u32 = 0;
    pub const PLAYFIELD: u32 = 1;
    pub const FOREGROUND: u32 = 2;
    pub const HUD: u32 = 3;
}

pub mod node {
    pub const CANVAS: u32 = 0;
    pub const SPRITE: u32 = 1;
    pub const IMAGE: u32 = 2;
    pub const TEXT: u32 = 3;
    pub const MESH: u32 = 4;
    pub const CLONE: u32 = 5;
    pub const NATIVE: u32 = 6;
    pub const LIVE_TEXT: u32 = 7;
}

pub mod opcode {
    pub const MAT4_BATCH: u16 = 1;
    pub const COLOR_VIS_BATCH: u16 = 2;
    pub const CAMERA_POSE: u16 = 3;
    pub const UNIFORM_F4_BATCH: u16 = 4;
    pub const UNIFORM_MAT4_BATCH: u16 = 5;
    pub const NODE_SHADER_BIND: u16 = 6;
    pub const MESH_UPLOAD: u16 = 7;
    pub const MESH_INSTANCES: u16 = 8;
    pub const PARTICLE_BATCH: u16 = 9;
    pub const NOTE_OVERRIDE_BATCH: u16 = 10;
    pub const GROUP_POLICY_BATCH: u16 = 11;
    pub const TEXT_UPDATE: u16 = 12;
    pub const RENDER_GRAPH: u16 = 13;
    pub const PLAY_SFX: u16 = 14;
    pub const NOTE_MESH_BIND: u16 = 15;
    pub const NODE_ORDER: u16 = 16;
    pub const TEXT_LAYOUT: u16 = 17;
    pub const NODE_UNIFORM_F4: u16 = 18;
    pub const NOTE_PALETTE_BATCH: u16 = 19;
    pub const GROUP_NOTE_TRANSFORM_BATCH: u16 = 20;
    pub const MAT4_ADJUST_BATCH: u16 = 21;
}

pub const SHADER_ASSET_PATHS: u32 = 1;
pub const POST_CLEAR: u32 = 1;
pub const POST_DEPTH: u32 = 1 << 1;

pub mod blend {
    pub const ALPHA: u8 = 0;
    pub const ADD: u8 = 1;
    pub const MULTIPLY: u8 = 2;
    pub const REPLACE: u8 = 3;
    pub const SCREEN: u8 = 4;
    pub const COMPOSITE: u8 = 5;
}

pub mod texture {
    pub const STRAIGHT_ALPHA: u32 = 1;
    pub const REPEAT: u32 = 1 << 1;
    pub const MIPMAP: u32 = 1 << 2;
    pub const NEAREST: u32 = 1 << 3;
}

pub mod rt {
    pub const PING_PONG: u32 = 1;
    pub const DEPTH: u32 = 1 << 1;
    pub const LINEAR: u32 = 1 << 2;
}

pub mod note_part {
    pub const TAP_BODY: u32 = 0;
    pub const HOLD_BODY: u32 = 1;
    pub const ARC_BODY: u32 = 2;
    pub const ARC_PROJECTION: u32 = 3;
    pub const ARCTAP: u32 = 4;
    pub const ARCTAP_PROJECTION: u32 = 5;
    pub const FLICK_BODY: u32 = 6;
}

pub mod note_mesh {
    pub const LOCAL: u32 = 0;
    pub const WIDTH: u32 = 1;
    pub const QUAD: u32 = 2;
    pub const CUSTOM_SOUND: u32 = 1;
    pub const LIGHT: u32 = 2;
    pub const DARK: u32 = 4;
}

pub mod group {
    pub const HIDDEN: u32 = 1;
    pub const HIDE_PROJECTION: u32 = 1 << 1;
    pub const HIDE_ARC_HEAD: u32 = 1 << 2;
    pub const HIDE_ARC_CAP: u32 = 1 << 3;
    pub const HIDE_GUIDES: u32 = 1 << 4;
    pub const KEEP_BODY: u32 = 1 << 5;
    pub use super::GROUP_REFLECT_X as REFLECT_X;
    pub const LIGHT_STYLE: u32 = 1 << 7;
    pub const DARK_STYLE: u32 = 1 << 8;
}

pub mod note_flag {
    pub const TRACE: u32 = 1;
    pub const INPUT: u32 = 1 << 1;
}

pub mod palette_flag {
    pub const HIGH: u32 = 1;
    pub const LOW: u32 = 1 << 1;
    pub const PROJECTION: u32 = 1 << 2;
}

pub const INDEX_U16: u32 = 16;
pub const INDEX_U32: u32 = 32;

pub mod asset_error {
    pub const NOT_FOUND: i32 = -1;
    pub const BUFFER_TOO_SMALL: i32 = -2;
    pub const READ_FAILED: i32 = -3;
    pub const TOO_LARGE: i32 = -4;
}

pub mod import_source {
    pub const ARCHIVE: u32 = 0;
    pub const PACKAGE: u32 = 1;
}

#[repr(C)]
#[derive(Clone, Copy)]
pub struct InitConfig {
    pub abi_version: u32,
    pub byte_size: u32,
    pub scope: u32,
    pub scene_id: u32,
    pub difficulty: i32,
    pub note_count: u32,
    pub timing_group_count: u32,
    pub features: u32,
}

#[repr(C)]
#[derive(Clone, Copy)]
pub struct CommandSlice {
    pub ptr: u32,
    pub bytes: u32,
}

#[repr(C)]
#[derive(Clone, Copy)]
pub struct Hit {
    pub note_index: i32,
    pub world: [f32; 3],
    pub offset_ms: f32,
    pub group_id: u16,
    pub kind: u8,
    pub judgment: u8,
}

#[repr(C)]
#[derive(Clone, Copy)]
pub struct Touch {
    pub id: i32,
    pub screen: [f32; 2],
    pub world: [f32; 2],
    pub phase: u8,
    pub reserved: [u8; 3],
}

#[repr(C, align(16))]
pub struct CommonInput {
    pub scene_id: u32,
    pub flags: u32,
    pub app_time_sec: f64,
    pub delta_sec: f32,
    pub audio_rms: f32,
    pub audio_onset: f32,
    pub touch_count: u32,
    pub viewport: [f32; 4],
    pub design_size: [f32; 2],
    pub reserved: [f32; 2],
    pub audio_bands: [f32; 4],
    pub fft256: [f32; 256],
    pub touches: [Touch; 10],
}

/// Cumulative scored judgments for the current play interval. Pure includes max Pure.
#[repr(C)]
#[derive(Clone, Copy)]
pub struct JudgmentCounts {
    pub total: i32,
    pub pure: i32,
    pub max_pure: i32,
    pub far: i32,
    pub lost: i32,
}

#[repr(C, align(16))]
#[derive(Clone, Copy)]
pub struct Gameplay {
    pub chart_time_ms: i32,
    pub bpm: f32,
    pub beat_progress: f32,
    pub speed: f32,
    pub playback_rate: f32,
    pub score: i32,
    pub combo: i32,
    pub hp: f32,
    pub camera_base_fov: f32,
    pub hit_count: u32,
    pub global_audio_offset_ms: f32,
    pub reserved: u32,
    pub hand_centroid: [f32; 4],
    pub hits: [Hit; 64],
    /// Present when the host advertises `FEATURE_JUDGMENT_COUNTS`.
    pub judgments: JudgmentCounts,
}

#[repr(C, align(16))]
#[derive(Clone, Copy)]
pub struct SongSelect {
    pub song_id_hash: u64,
    pub difficulty_class: i32,
    pub high_score: i32,
    pub chart_constant: f32,
    pub bpm_min: f32,
    pub bpm_max: f32,
    pub clear_type: i32,
    pub side: i32,
    pub reserved: [u32; 3],
}

#[repr(C, align(16))]
#[derive(Clone, Copy)]
pub struct Results {
    pub score: i32,
    pub max_pure: i32,
    pub pure: i32,
    pub far: i32,
    pub lost: i32,
    pub early_count: i32,
    pub late_count: i32,
    pub max_combo: i32,
    pub grade: i32,
    pub clear_type: i32,
    pub is_new_best: u32,
    pub mean_offset_ms: f32,
    pub offset_hist: [u32; 64],
}

#[repr(C, align(16))]
#[derive(Clone, Copy)]
pub struct MainMenu {
    pub partner_id: i32,
    pub partner_awakened: u32,
    pub potential: f32,
    pub reserved: u32,
}

#[repr(C)]
pub union SceneInput {
    pub gameplay: Gameplay,
    pub song_select: SongSelect,
    pub results: Results,
    pub main_menu: MainMenu,
}

#[repr(C, align(16))]
pub struct FrameInput {
    pub common: CommonInput,
    pub scene: SceneInput,
}

#[repr(C)]
#[derive(Clone, Copy, Default)]
pub struct NodeConfig {
    pub parent: i32,
    pub texture: i32,
    pub clone_source: i32,
    pub layer: u32,
    pub width: f32,
    pub height: f32,
    pub font_size: f32,
    pub rgba: u32,
    pub text_ptr: u32,
    pub text_bytes: u32,
    pub font_ptr: u32,
    pub font_bytes: u32,
}

#[repr(C)]
#[derive(Clone, Copy)]
pub struct ObjectDescription {
    pub local_mat: [f32; 16],
    pub world_mat: [f32; 16],
    pub size: [f32; 2],
    pub anchor: [f32; 2],
    pub kind: u32,
    pub visible: u32,
}

#[repr(C)]
#[derive(Clone, Copy)]
pub struct NoteMetadata {
    pub index: i32,
    pub kind: i32,
    pub timing_group: i32,
    pub lane: i32,
    pub start_time_ms: i32,
    pub end_time_ms: i32,
    pub start: [f32; 2],
    pub end: [f32; 2],
    pub color: i32,
    pub flags: u32,
}

#[repr(C)]
#[derive(Clone, Copy)]
pub struct TimingMetadata {
    pub timing_ms: i32,
    pub bpm: f32,
    pub divisor: f32,
    pub floor_position: f32,
}

#[repr(C)]
#[derive(Clone, Copy)]
pub struct PathSample {
    pub time_ms: i32,
    pub position: [f32; 3],
}

#[repr(C)]
#[derive(Clone, Copy)]
pub struct NotePath {
    pub note_index: i32,
    pub next_note: i32,
    pub samples_ptr: u32,
    pub sample_count: u32,
}

#[repr(C)]
#[derive(Clone, Copy)]
pub struct MatrixCommand { pub handle: i32, pub matrix: [f32; 16] }
#[repr(C)]
#[derive(Clone, Copy)]
pub struct ColorCommand { pub handle: i32, pub rgba: [u8; 4], pub visible: u8, pub blend: u8, pub sort_delta: i16 }

#[repr(C)]
#[derive(Clone, Copy)]
pub struct NodeOrder { pub handle: i32, pub order: i32 }

#[repr(C)]
#[derive(Clone, Copy)]
pub struct NodeUniformF4 { pub handle: i32, pub slot: i32, pub value: [f32; 4] }

#[repr(C)]
#[derive(Clone, Copy)]
pub struct TextLayout {
    pub handle: i32,
    pub horizontal: u32,
    pub vertical: u32,
    pub width: f32,
    pub height: f32,
    pub line_spacing: f32,
}
#[repr(C)]
#[derive(Clone, Copy)]
pub struct CameraCommand {
    pub position: [f32; 3], pub fov_offset: f32, pub basis: [f32; 9],
    pub near_plane: f32, pub far_plane: f32, pub tilt_scale: f32, pub mode: u32,
}
#[repr(C)]
#[derive(Clone, Copy)]
pub struct UniformF4 { pub shader: i32, pub slot: i32, pub value: [f32; 4] }
#[repr(C)]
#[derive(Clone, Copy)]
pub struct UniformMat4 { pub shader: i32, pub slot: i32, pub value: [f32; 16] }
#[repr(C)]
#[derive(Clone, Copy)]
pub struct ShaderBinding { pub handle: i32, pub shader: i32, pub tex0: i32, pub tex1: i32, pub wrap_flags: u32 }
#[repr(C)]
#[derive(Clone, Copy)]
pub struct Vertex { pub position: [f32; 3], pub normal: [f32; 3], pub uv: [f32; 2], pub rgba: u32 }
#[repr(C)]
#[derive(Clone, Copy)]
pub struct Instance { pub matrix: [f32; 16], pub rgba: u32 }
#[repr(C)]
#[derive(Clone, Copy)]
pub struct Particle { pub position: [f32; 3], pub size: [f32; 2], pub angle: f32, pub rgba: u32 }
#[repr(C)]
#[derive(Clone, Copy)]
pub struct MeshUpload { pub mesh: i32, pub vertex_count: u32, pub index_count: u32, pub index_format: u32 }
#[repr(C)]
#[derive(Clone, Copy)]
pub struct MeshInstances { pub mesh: i32, pub layer: u32, pub count: u32 }
#[repr(C)]
#[derive(Clone, Copy)]
pub struct NoteMeshBind { pub mesh: i32, pub part: u32, pub variant: u32, pub fit: u32 }
#[repr(C)]
#[derive(Clone, Copy)]
pub struct ParticleBatch { pub shader: i32, pub texture: i32, pub layer: u32, pub blend: u32, pub count: u32 }
#[repr(C)]
#[derive(Clone, Copy)]
pub struct NoteOverride {
    pub note_index: i32, pub offset: [f32; 3], pub scale: [f32; 3], pub custom: [f32; 4],
    pub rgba: u32, pub visible: u8, pub reserved: [u8; 3],
}

#[repr(C)]
#[derive(Clone, Copy)]
pub struct NotePalette {
    pub note_index: i32,
    pub high: u32,
    pub low: u32,
    pub projection: u32,
    pub flags: u32,
}

#[repr(C)]
#[derive(Clone, Copy)]
pub struct GroupNoteTransform {
    pub group: i32,
    pub basis: [f32; 9],
}
#[repr(C)]
#[derive(Clone, Copy)]
pub struct GroupPolicy { pub group: i32, pub angle_x: f32, pub angle_y: f32, pub scroll_speed: f32, pub fade_near: f32, pub fade_far: f32, pub flags: u32 }
#[repr(C)]
#[derive(Clone, Copy)]
pub struct TextUpdate { pub handle: i32, pub utf8_len: u32 }
#[repr(C)]
#[derive(Clone, Copy)]
pub struct PostPass {
    pub shader: i32, pub input: i32, pub destination: i32, pub history: i32,
    pub layer: u32, pub flags: u32, pub blend: u32, pub reserved: u32,
}
#[repr(C)]
#[derive(Clone, Copy)]
pub struct PlaySound { pub handle: i32, pub volume: f32, pub pitch: f32 }

const _: () = {
    assert!(size_of::<CommonInput>() == 1344 && offset_of!(CommonInput, fft256) == 80);
    assert!(offset_of!(CommonInput, touches) == 1104);
    assert!(size_of::<JudgmentCounts>() == 20);
    assert!(size_of::<Gameplay>() == 1632 && offset_of!(Gameplay, hits) == 64);
    assert!(offset_of!(Gameplay, judgments) == 1600);
    assert!(size_of::<SongSelect>() == 48 && size_of::<MainMenu>() == 16);
    assert!(size_of::<Results>() == 304 && offset_of!(Results, offset_hist) == 48);
    assert!(size_of::<FrameInput>() == 2976 && offset_of!(FrameInput, scene) == 1344);
    assert!(size_of::<NodeConfig>() == 48 && size_of::<ObjectDescription>() == 152);
    assert!(size_of::<Vertex>() == 36 && size_of::<Instance>() == 68 && size_of::<Particle>() == 28);
    assert!(size_of::<CameraCommand>() == 68 && size_of::<NoteOverride>() == 52 && size_of::<PostPass>() == 32);
    assert!(size_of::<NoteMeshBind>() == 16 && size_of::<NodeOrder>() == 8 && size_of::<TextLayout>() == 24);
    assert!(size_of::<NodeUniformF4>() == 24 && size_of::<NotePalette>() == 20 && size_of::<GroupNoteTransform>() == 40);
};

#[cfg(target_arch = "wasm32")]
#[link(wasm_import_module = "arcaea")]
extern "C" {
    pub fn host_find_object(name: u32, bytes: u32) -> i32;
    pub fn host_describe_object(handle: i32, out: u32) -> i32;
    pub fn host_create_node(kind: u32, config: u32, bytes: u32) -> i32;
    pub fn host_set_parent(child: i32, parent: i32, keep_world: u32) -> i32;
    pub fn host_load_texture(path: u32, bytes: u32, flags: u32) -> i32;
    pub fn host_create_shader(vertex: u32, v_bytes: u32, fragment: u32, f_bytes: u32, flags: u32) -> i32;
    pub fn host_uniform_slot(shader: i32, name: u32, bytes: u32) -> i32;
    pub fn host_create_rt(scale: u32, flags: u32) -> i32;
    pub fn host_bind_note_shader(part: u32, shader: i32, flags: u32) -> i32;
    pub fn host_read_notes(first: u32, count: u32, out: u32) -> i32;
    pub fn host_read_note_ordinals(first: u32, count: u32, out: u32) -> i32;
    pub fn host_read_timings(group: u32, first: u32, count: u32, out: u32) -> i32;
    pub fn host_override_paths(paths: u32, count: u32) -> i32;
    pub fn host_load_sfx(path: u32, bytes: u32) -> i32;
    pub fn host_read_param(key: u32, bytes: u32, out: u32) -> i32;
    pub fn host_log(severity: u32, message: u32, bytes: u32);
    /// Query with zero capacity, or copy bytes and return their count. Negative results are in `asset_error`.
    pub fn host_read_asset(path: u32, bytes: u32, out: u32, capacity: u32) -> i32;
    /// Write a relative output file during the exported `mod_convert` callback.
    pub fn host_import_write(path: u32, path_bytes: u32, data: u32, bytes: u32) -> i32;
    /// Copy a file from `import_source` during the exported `mod_convert` callback.
    pub fn host_import_copy(source: u32, source_bytes: u32, output: u32, output_bytes: u32, source_kind: u32) -> i32;
}
