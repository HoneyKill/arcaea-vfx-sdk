#ifndef ARCAEA_MOD_ABI_H
#define ARCAEA_MOD_ABI_H

#include <stddef.h>
#include <stdint.h>

#define ARCAEA_MOD_ABI_VERSION 1u
#define ARCAEA_MOD_IMPORT_MODULE "arcaea"
#define ARCAEA_MOD_TOUCH_COUNT 10u
#define ARCAEA_MOD_HIT_COUNT 64u

#if defined(__cplusplus)
#define ARCAEA_MOD_ALIGN(n) alignas(n)
#define ARCAEA_MOD_ASSERT(condition) static_assert(condition, #condition)
#elif defined(_MSC_VER)
#define ARCAEA_MOD_ALIGN(n) __declspec(align(n))
#define ARCAEA_MOD_ASSERT(condition) _Static_assert(condition, #condition)
#else
#define ARCAEA_MOD_ALIGN(n) __attribute__((aligned(n)))
#define ARCAEA_MOD_ASSERT(condition) _Static_assert(condition, #condition)
#endif

/* ABI buffers use little-endian scalars, binary32/binary64 floats and UTF-8.
 * Matrices are column-major. All addresses are offsets in WASM32 memory.
 * Negative handles indicate errors; zero is reserved except where documented. */
enum ModSceneId_e {
    SCENE_NONE = 0, SCENE_START = 1, SCENE_MAIN_MENU = 2, SCENE_PACK_SELECT = 3,
    SCENE_SONG_SELECT = 4, SCENE_GAMEPLAY = 5, SCENE_RESULTS = 6, SCENE_DOWNLOADS = 7
};

enum ModScenePhase_e { SCENE_PHASE_ENTER = 0, SCENE_PHASE_EXIT = 1 };
enum ModScope_e { MOD_SCOPE_GLOBAL = 0, MOD_SCOPE_CHART = 1 };
enum ModFrameFlags_e {
    MOD_FLAG_IS_SEEKING = 1u << 0,
    MOD_FLAG_MIRROR = 1u << 1,
    MOD_FLAG_PAUSED = 1u << 2,
    MOD_FLAG_REDUCED_MOTION = 1u << 3,
    MOD_FLAG_AUTOPLAY = 1u << 4,
    MOD_FLAG_PRACTICE_MODE = 1u << 5,
    MOD_FLAG_FIXED_BPM = 1u << 6
};

enum ModFeature_e {
    MOD_FEATURE_UINT_INDICES = 1u << 0,
    MOD_FEATURE_INSTANCING = 1u << 1,
    MOD_FEATURE_HUD_POST = 1u << 2,
    MOD_FEATURE_DEPTH_STENCIL = 1u << 3,
    MOD_FEATURE_NOTE_MESH = 1u << 4,
    MOD_FEATURE_DEPTH_TEXTURE = 1u << 5,
    MOD_FEATURE_SCENE_PRESENTATION = 1u << 6,
    MOD_FEATURE_JUDGMENT_COUNTS = 1u << 7
};

enum VfxLayer_e { LAYER_BG = 0, LAYER_PLAYFIELD = 1, LAYER_VFX_FG = 2, LAYER_HUD = 3 };
enum ModNodeKind_e {
    MOD_NODE_CANVAS = 0, MOD_NODE_SPRITE = 1, MOD_NODE_IMAGE = 2,
    MOD_NODE_TEXT = 3, MOD_NODE_MESH = 4, MOD_NODE_CLONE = 5, MOD_NODE_NATIVE = 6,
    /* Clone a text drawable and keep its string synchronized with clone_source. */
    MOD_NODE_LIVE_TEXT = 7
};
enum ModBlend_e {
    MOD_BLEND_ALPHA = 0, MOD_BLEND_ADD = 1, MOD_BLEND_MULTIPLY = 2, MOD_BLEND_REPLACE = 3,
    MOD_BLEND_SCREEN = 4, MOD_BLEND_COMPOSITE = 5
};
enum ModTextureFlags_e {
    MOD_TEXTURE_STRAIGHT_ALPHA = 1u << 0, MOD_TEXTURE_REPEAT = 1u << 1,
    MOD_TEXTURE_MIPMAP = 1u << 2, MOD_TEXTURE_NEAREST = 1u << 3
};
enum ModShaderFlags_e { MOD_SHADER_ASSET_PATHS = 1u << 0 };
enum ModRenderTargetFlags_e {
    RT_FLAG_PING_PONG = 1u << 0, RT_FLAG_DEPTH = 1u << 1, RT_FLAG_LINEAR = 1u << 2
};
/* WORLD_OFFSET adds pos in world axes and applies basis in the base camera's local axes. */
enum ModCameraMode_e { MOD_CAMERA_RELATIVE = 0, MOD_CAMERA_ABSOLUTE = 1, MOD_CAMERA_WORLD_OFFSET = 2 };
enum ModMeshIndexFormat_e { MOD_INDEX_U16 = 16, MOD_INDEX_U32 = 32 };
enum ModNotePart_e {
    MOD_PART_TAP_BODY = 0, MOD_PART_HOLD_BODY = 1, MOD_PART_ARC_BODY = 2,
    MOD_PART_ARC_PROJECTION = 3, MOD_PART_ARCTAP = 4, MOD_PART_ARCTAP_PROJECTION = 5,
    MOD_PART_FLICK_BODY = 6
};
enum ModNoteMeshFit_e { MOD_NOTE_MESH_LOCAL = 0, MOD_NOTE_MESH_WIDTH = 1, MOD_NOTE_MESH_QUAD = 2 };
/* Each mesh binding applies to the specified variant. */
enum ModNoteMeshVariant_e {
    MOD_NOTE_MESH_CUSTOM_SOUND = 1, MOD_NOTE_MESH_LIGHT = 2, MOD_NOTE_MESH_DARK = 4,
    MOD_NOTE_MESH_VARIANT_COUNT = 6
};
enum ModGroupFlags_e {
    MOD_GROUP_HIDDEN = 1u << 0, MOD_GROUP_HIDE_PROJECTION = 1u << 1,
    MOD_GROUP_HIDE_ARC_HEAD = 1u << 2, MOD_GROUP_HIDE_ARC_CAP = 1u << 3,
    MOD_GROUP_HIDE_GUIDES = 1u << 4, MOD_GROUP_KEEP_BODY = 1u << 5,
    /* Reflect the rendered group on its local X axis before applying the group rotation. */
    MOD_GROUP_REFLECT_X = 1u << 6, MOD_GROUP_LIGHT_STYLE = 1u << 7, MOD_GROUP_DARK_STYLE = 1u << 8
};
enum ModPostFlags_e {
    MOD_POST_CLEAR = 1u << 0,
    /* Playfield pass depth in u_depthTex and optional u_overlayDepthTex.
     * The corresponding vec4 projection uniforms are u_depthProjection and
     * u_overlayDepthProjection, in matrix index order 10, 14, 11, 15.
     * A zero projection marks an unavailable camera. */
    MOD_POST_DEPTH = 1u << 1
};

typedef struct ModInitConfig_t {
    uint32_t abi_version, byte_size, scope, scene_id;
    int32_t difficulty;
    uint32_t note_count, timing_group_count, features;
} ModInitConfig_t;

typedef struct ModCmdSlice_t { uint32_t ptr, bytes; } ModCmdSlice_t;

typedef struct ModHitEvent_t {
    int32_t note_index;
    float world_x, world_y, world_z;
    float offset_ms;
    uint16_t group_id;
    uint8_t kind, judgment;
} ModHitEvent_t;

typedef struct ModTouchPoint_t {
    int32_t touch_id;
    float screen_x, screen_y, world_x, world_y;
    uint8_t phase, reserved[3];
} ModTouchPoint_t;

typedef struct ARCAEA_MOD_ALIGN(16) ModCommonInput_t {
    uint32_t scene_id, flags;
    double app_time_sec;
    float delta_sec, audio_rms, audio_onset;
    uint32_t touch_count;
    float viewport[4], design_size[2], reserved[2], audio_bands[4], fft256[256];
    ModTouchPoint_t touches[ARCAEA_MOD_TOUCH_COUNT];
} ModCommonInput_t;

/** @brief Cumulative scored judgments and the total for the current play interval. Pure includes max Pure. */
typedef struct ModJudgmentCounts_t {
    int32_t total, pure, max_pure, far, lost;
} ModJudgmentCounts_t;

typedef struct ARCAEA_MOD_ALIGN(16) ModGameplayPayload_t {
    int32_t chart_time_ms;
    float bpm, beat_progress, speed, playback_rate;
    int32_t score, combo;
    float hp, camera_base_fov;
    uint32_t hit_count;
    float global_audio_offset_ms;
    uint32_t reserved;
    float hand_centroid[4];
    ModHitEvent_t hits[ARCAEA_MOD_HIT_COUNT];
    /* Present when MOD_FEATURE_JUDGMENT_COUNTS is advertised. */
    ModJudgmentCounts_t judgments;
} ModGameplayPayload_t;

typedef struct ARCAEA_MOD_ALIGN(16) ModSongSelectPayload_t {
    uint64_t song_id_hash;
    int32_t difficulty_class, high_score;
    float chart_constant, bpm_min, bpm_max;
    int32_t clear_type, side, reserved[3];
} ModSongSelectPayload_t;

typedef struct ARCAEA_MOD_ALIGN(16) ModResultsPayload_t {
    int32_t score, max_pure, pure, far, lost, early_count, late_count, max_combo, grade, clear_type;
    uint32_t is_new_best;
    float mean_offset_ms;
    uint32_t offset_hist[64];
} ModResultsPayload_t;

typedef struct ARCAEA_MOD_ALIGN(16) ModMainMenuPayload_t {
    int32_t partner_id;
    uint32_t partner_awakened;
    float potential;
    uint32_t reserved;
} ModMainMenuPayload_t;

typedef struct ARCAEA_MOD_ALIGN(16) ModFrameInput_t {
    ModCommonInput_t common;
    union {
        ModGameplayPayload_t gameplay;
        ModSongSelectPayload_t song_select;
        ModResultsPayload_t results;
        ModMainMenuPayload_t main_menu;
    } scene;
} ModFrameInput_t;

typedef struct ModObjectDesc_t {
    float local_mat[16], world_mat[16];
    float size[2], anchor[2];
    uint32_t kind, visible;
} ModObjectDesc_t;

typedef struct ModNodeConfig_t {
    int32_t parent, texture, clone_source;
    uint32_t layer;
    float width, height, font_size;
    uint32_t rgba;
    uint32_t text_ptr, text_bytes, font_ptr, font_bytes;
} ModNodeConfig_t;

typedef struct ModNoteMetadata_t {
    int32_t index, kind, timing_group, lane;
    int32_t start_time_ms, end_time_ms;
    float start_x, start_y, end_x, end_y;
    int32_t color;
    uint32_t flags;
} ModNoteMetadata_t;

enum ModNoteFlags_e { MOD_NOTE_TRACE = 1u << 0, MOD_NOTE_INPUT = 1u << 1 };

typedef struct ModTimingMetadata_t {
    int32_t timing_ms;
    float bpm, divisor, floor_position;
} ModTimingMetadata_t;

typedef struct ModPathSample_t { int32_t time_ms; float x, y, z; } ModPathSample_t;
typedef struct ModNotePath_t {
    int32_t note_index, next_note;
    uint32_t samples_ptr, sample_count;
} ModNotePath_t;

enum ModOpcode_e {
    CMD_MAT4_BATCH = 0x0001,
    CMD_COLOR_VIS_BATCH = 0x0002,
    CMD_CAMERA_POSE = 0x0003,
    CMD_UNIFORM_F4_BATCH = 0x0004,
    CMD_UNIFORM_MAT4_BATCH = 0x0005,
    CMD_NODE_SHADER_BIND = 0x0006,
    CMD_MESH_UPLOAD = 0x0007,
    CMD_MESH_INSTANCES = 0x0008,
    CMD_PARTICLE_BATCH = 0x0009,
    CMD_NOTE_OVERRIDE_BATCH = 0x000a,
    CMD_GROUP_POLICY_BATCH = 0x000b,
    CMD_TEXT_UPDATE = 0x000c,
    CMD_RENDER_GRAPH = 0x000d,
    CMD_PLAY_SFX = 0x000e,
    CMD_NOTE_MESH_BIND = 0x000f,
    CMD_NODE_ORDER = 0x0010,
    CMD_TEXT_LAYOUT = 0x0011,
    CMD_NODE_UNIFORM_F4 = 0x0012,
    CMD_NOTE_PALETTE_BATCH = 0x0013,
    CMD_GROUP_NOTE_TRANSFORM_BATCH = 0x0014,
    /* VfxMat4Command_t with translation in parent space and basis around the current local anchor. */
    CMD_MAT4_ADJUST_BATCH = 0x0015
};

typedef struct ModCmdHeader_t {
    uint16_t opcode, flags;
    uint32_t payload_bytes;
} ModCmdHeader_t;

typedef struct VfxMat4Command_t { int32_t handle; float mat4[16]; } VfxMat4Command_t;
typedef struct VfxColorCommand_t {
    int32_t handle;
    uint8_t rgba[4], visible, blend;
    int16_t sort_delta;
} VfxColorCommand_t;
typedef struct VfxCameraCommand_t {
    float pos[3], fov_offset, basis[9], near_p, far_p, tilt_scale;
    uint32_t mode;
} VfxCameraCommand_t;
typedef struct VfxUniformF4_t { int32_t shader, slot; float value[4]; } VfxUniformF4_t;
typedef struct VfxNodeUniformF4_t { int32_t handle, slot; float value[4]; } VfxNodeUniformF4_t;
typedef struct VfxUniformMat4_t { int32_t shader, slot; float value[16]; } VfxUniformMat4_t;
typedef struct VfxNodeShader_t { int32_t handle, shader, tex0, tex1; uint32_t wrap_flags; } VfxNodeShader_t;
typedef struct VfxVertex3D {
    float position[3], normal[3], uv[2];
    uint32_t rgba;
} VfxVertex3D;
typedef struct VfxInstanceData { float mat4[16]; uint32_t rgba; } VfxInstanceData;
typedef struct VfxParticle { float position[3], size[2], angle; uint32_t rgba; } VfxParticle;
typedef struct VfxMeshUpload_t { int32_t mesh; uint32_t v_cnt, i_cnt, index_fmt; } VfxMeshUpload_t;
typedef struct VfxMeshInstances_t { int32_t mesh; uint32_t layer, count; } VfxMeshInstances_t;
/* Variant selects the custom-hit-sound bit and optional light or dark style. An extent of one in
 * X fits the native model width. XY in [0,1] fits a projected sprite quad. */
typedef struct VfxNoteMeshBind_t { int32_t mesh; uint32_t part, variant, fit; } VfxNoteMeshBind_t;
typedef struct VfxParticleBatch_t { int32_t shader, tex; uint32_t layer, blend, count; } VfxParticleBatch_t;
typedef struct VfxNoteOverride_t {
    int32_t note_idx;
    float offset[3], scale[3], custom[4];
    uint32_t rgba;
    uint8_t vis, reserved[3];
} VfxNoteOverride_t;
enum ModNotePaletteFlags_e { MOD_PALETTE_HIGH = 1u, MOD_PALETTE_LOW = 2u, MOD_PALETTE_PROJECTION = 4u };
typedef struct VfxNotePalette_t {
    int32_t note_idx;
    uint32_t high, low, projection, flags;
} VfxNotePalette_t;
typedef struct VfxGroupPolicy_t {
    int32_t group_id;
    float angle_x, angle_y, scroll_speed, fade_near, fade_far;
    uint32_t flags;
} VfxGroupPolicy_t;
typedef struct VfxGroupNoteTransform_t {
    int32_t group_id;
    float basis[9];
} VfxGroupNoteTransform_t;
typedef struct VfxTextUpdate_t { int32_t text_handle; uint32_t utf8_len; } VfxTextUpdate_t;
typedef struct VfxNodeOrder_t { int32_t handle, order; } VfxNodeOrder_t;
/* Alignment components use left/center/right and top/center/bottom, numbered 0–2. */
typedef struct VfxTextLayout_t {
    int32_t handle;
    uint32_t horizontal, vertical;
    float width, height, line_spacing;
} VfxTextLayout_t;
typedef struct VfxPostPass {
    int32_t shader, src_rt, dst_rt, history_rt;
    uint32_t src_layer, flags, blend, reserved;
} VfxPostPass;
typedef struct VfxPlaySfx_t { int32_t sfx_id; float volume, pitch; } VfxPlaySfx_t;

ARCAEA_MOD_ASSERT(sizeof(float) == 4 && sizeof(double) == 8);
ARCAEA_MOD_ASSERT(sizeof(ModInitConfig_t) == 32 && sizeof(ModCmdSlice_t) == 8);
ARCAEA_MOD_ASSERT(sizeof(ModHitEvent_t) == 24 && sizeof(ModTouchPoint_t) == 24);
ARCAEA_MOD_ASSERT(sizeof(ModCommonInput_t) == 1344 && offsetof(ModCommonInput_t, fft256) == 80);
ARCAEA_MOD_ASSERT(offsetof(ModCommonInput_t, touches) == 1104);
ARCAEA_MOD_ASSERT(sizeof(ModJudgmentCounts_t) == 20);
ARCAEA_MOD_ASSERT(sizeof(ModGameplayPayload_t) == 1632 && offsetof(ModGameplayPayload_t, hits) == 64);
ARCAEA_MOD_ASSERT(offsetof(ModGameplayPayload_t, judgments) == 1600);
ARCAEA_MOD_ASSERT(sizeof(ModSongSelectPayload_t) == 48 && sizeof(ModMainMenuPayload_t) == 16);
ARCAEA_MOD_ASSERT(sizeof(ModResultsPayload_t) == 304 && offsetof(ModResultsPayload_t, offset_hist) == 48);
ARCAEA_MOD_ASSERT(sizeof(ModFrameInput_t) == 2976 && offsetof(ModFrameInput_t, scene) == 1344);
ARCAEA_MOD_ASSERT(sizeof(ModObjectDesc_t) == 152 && sizeof(ModNodeConfig_t) == 48);
ARCAEA_MOD_ASSERT(sizeof(ModNoteMetadata_t) == 48 && sizeof(ModTimingMetadata_t) == 16);
ARCAEA_MOD_ASSERT(sizeof(ModNotePath_t) == 16 && sizeof(ModPathSample_t) == 16);
ARCAEA_MOD_ASSERT(sizeof(ModCmdHeader_t) == 8 && offsetof(ModCmdHeader_t, payload_bytes) == 4);
ARCAEA_MOD_ASSERT(sizeof(VfxMat4Command_t) == 68 && sizeof(VfxColorCommand_t) == 12);
ARCAEA_MOD_ASSERT(sizeof(VfxCameraCommand_t) == 68 && sizeof(VfxUniformF4_t) == 24);
ARCAEA_MOD_ASSERT(sizeof(VfxNodeUniformF4_t) == 24);
ARCAEA_MOD_ASSERT(sizeof(VfxUniformMat4_t) == 72 && sizeof(VfxNodeShader_t) == 20);
ARCAEA_MOD_ASSERT(sizeof(VfxVertex3D) == 36 && sizeof(VfxInstanceData) == 68 && sizeof(VfxParticle) == 28);
ARCAEA_MOD_ASSERT(sizeof(VfxMeshUpload_t) == 16 && sizeof(VfxMeshInstances_t) == 12);
ARCAEA_MOD_ASSERT(sizeof(VfxParticleBatch_t) == 20 && sizeof(VfxNoteOverride_t) == 52);
ARCAEA_MOD_ASSERT(sizeof(VfxNotePalette_t) == 20);
ARCAEA_MOD_ASSERT(sizeof(VfxGroupPolicy_t) == 28 && sizeof(VfxTextUpdate_t) == 8);
ARCAEA_MOD_ASSERT(sizeof(VfxGroupNoteTransform_t) == 40);
ARCAEA_MOD_ASSERT(sizeof(VfxNodeOrder_t) == 8 && sizeof(VfxTextLayout_t) == 24);
ARCAEA_MOD_ASSERT(sizeof(VfxPostPass) == 32 && sizeof(VfxPlaySfx_t) == 12);

#if defined(__cplusplus)
ARCAEA_MOD_ASSERT(alignof(ModFrameInput_t) == 16);
#endif

#if defined(__wasm__)
#if defined(__cplusplus)
extern "C" {
#endif
#define ARCAEA_MOD_IMPORT(name) __attribute__((import_module(ARCAEA_MOD_IMPORT_MODULE), import_name(#name)))
#define ARCAEA_MOD_EXPORT(name) __attribute__((export_name(#name)))

/** @brief Return the ABI version this module implements. @return ABI version. */
ARCAEA_MOD_EXPORT(mod_abi_version) uint32_t mod_abi_version(void);
/** @brief Reserve persistent host-writeable storage. @param bytes Length. @param align Required alignment. @return Nonzero WASM offset. */
ARCAEA_MOD_EXPORT(mod_alloc) uint32_t mod_alloc(uint32_t bytes, uint32_t align);
/** @brief Initialize persistent state. @param cfg Offset of ModInitConfig_t. @return Zero on success. */
ARCAEA_MOD_EXPORT(mod_init) int32_t mod_init(uint32_t cfg);
/** @brief Enter or exit a scene. @param scene_id Scene. @param phase Lifecycle phase. @return Zero on success. */
ARCAEA_MOD_EXPORT(mod_on_scene) int32_t mod_on_scene(uint32_t scene_id, uint32_t phase);
/** @brief Reset time-dependent effects. @param chart_time_ms New chart time. */
ARCAEA_MOD_EXPORT(mod_seek) void mod_seek(int32_t chart_time_ms);
/** @brief Produce one frame. @param frame Offset of ModFrameInput_t. @param slice Offset of writeable ModCmdSlice_t. */
ARCAEA_MOD_EXPORT(mod_update) void mod_update(uint32_t frame, uint32_t slice);

/** @brief Resolve a public scene object. @param name UTF-8 offset. @param length Bytes. @return Handle or negative error. */
ARCAEA_MOD_IMPORT(host_find_object) int32_t host_find_object(uint32_t name, uint32_t length);
/** @brief Read registered geometry. @param handle Scene object. @param description ModObjectDesc_t offset. @return Zero on success. */
ARCAEA_MOD_IMPORT(host_describe_object) int32_t host_describe_object(int32_t handle, uint32_t description);
/** @brief Create a scene-owned node. Mesh nodes may use text_ptr/text_bytes for a package mesh file containing two LE u32 counts followed by VfxVertex3D data and u32 indices. File-backed meshes start hidden as templates. @param kind Node kind. @param config ModNodeConfig_t offset. @param bytes Config size. @return Handle. */
ARCAEA_MOD_IMPORT(host_create_node) int32_t host_create_node(uint32_t kind, uint32_t config, uint32_t bytes);
/** @brief Parent an owned node. @param child Child handle. @param parent Parent handle. @param keep_world Preserve world pose. @return Zero on success. */
ARCAEA_MOD_IMPORT(host_set_parent) int32_t host_set_parent(int32_t child, int32_t parent, uint32_t keep_world);
/** @brief Load a package-local texture. @param path UTF-8 offset. @param bytes String length. @param flags Texture flags. @return Handle. */
ARCAEA_MOD_IMPORT(host_load_texture) int32_t host_load_texture(uint32_t path, uint32_t bytes, uint32_t flags);
/** @brief Compile UTF-8 vertex and fragment GLSL. @param vertex Vertex offset. @param vertex_bytes Length. @param fragment Fragment offset. @param fragment_bytes Length. @param flags Reserved. @return Handle. */
ARCAEA_MOD_IMPORT(host_create_shader) int32_t host_create_shader(uint32_t vertex, uint32_t vertex_bytes, uint32_t fragment, uint32_t fragment_bytes, uint32_t flags);
/** @brief Resolve a uniform once. @param shader Shader handle. @param name UTF-8 offset. @param bytes Length. @return Slot. */
ARCAEA_MOD_IMPORT(host_uniform_slot) int32_t host_uniform_slot(int32_t shader, uint32_t name, uint32_t bytes);
/** @brief Create an off-screen target. @param scale_q16 Viewport scale in Q16. @param flags Target flags. @return Handle. */
ARCAEA_MOD_IMPORT(host_create_rt) int32_t host_create_rt(uint32_t scale_q16, uint32_t flags);
/** @brief Select a visual note shader. @param part Note component. @param shader Shader handle. @param flags Reserved. @return Zero on success. */
ARCAEA_MOD_IMPORT(host_bind_note_shader) int32_t host_bind_note_shader(uint32_t part, int32_t shader, uint32_t flags);
/** @brief Copy chart metadata. @param first First note. @param count Requested records. @param out ModNoteMetadata_t array offset. @return Records written. */
ARCAEA_MOD_IMPORT(host_read_notes) int32_t host_read_notes(uint32_t first, uint32_t count, uint32_t out);
/** @brief Return AFF source ordinals in the same order as host_read_notes. @param first First native note index. @param count Destination capacity in uint32_t rows. @param out Destination. @return Rows read. */
ARCAEA_MOD_IMPORT(host_read_note_ordinals) int32_t host_read_note_ordinals(uint32_t first, uint32_t count, uint32_t out);
/** @brief Copy timing metadata. @param group TimingGroup. @param first First event. @param count Requested records. @param out ModTimingMetadata_t array offset. @return Records written. */
ARCAEA_MOD_IMPORT(host_read_timings) int32_t host_read_timings(uint32_t group, uint32_t first, uint32_t count, uint32_t out);
/** @brief Submit immutable visual paths. @param paths ModNotePath_t array offset. @param count Records. @return Zero on success. */
ARCAEA_MOD_IMPORT(host_override_paths) int32_t host_override_paths(uint32_t paths, uint32_t count);
/** @brief Resolve a package sound. @param path UTF-8 offset. @param bytes Length. @return Handle. */
ARCAEA_MOD_IMPORT(host_load_sfx) int32_t host_load_sfx(uint32_t path, uint32_t bytes);
/** @brief Read one scalar setting. @param key UTF-8 offset. @param bytes Length. @param out Float offset. @return Zero on success. */
ARCAEA_MOD_IMPORT(host_read_param) int32_t host_read_param(uint32_t key, uint32_t bytes, uint32_t out);
/** @brief Report a diagnostic. @param severity 0 debug, 1 warning, 2 error. @param message UTF-8 offset. @param bytes Length. */
ARCAEA_MOD_IMPORT(host_log) void host_log(uint32_t severity, uint32_t message, uint32_t bytes);
/**
 * @brief Read a package-local resource into guest storage.
 * @param path UTF-8 offset. @param bytes Path length. @param out Destination offset.
 * @param capacity Capacity, or zero to query size. @return Byte count or a negative error.
 * @note During chart conversion an empty path reads the archive's NUL-terminated UTF-8 relative filenames.
 */
ARCAEA_MOD_IMPORT(host_read_asset) int32_t host_read_asset(uint32_t path, uint32_t bytes, uint32_t out, uint32_t capacity);
#if defined(__cplusplus)
}
#endif
#endif

#undef ARCAEA_MOD_ALIGN
#undef ARCAEA_MOD_ASSERT

#endif
