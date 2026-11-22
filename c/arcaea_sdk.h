#ifndef ARCAEA_C_SDK_H
#define ARCAEA_C_SDK_H

#include "arcaea_mod_abi.h"

typedef struct ArcaeaArena_t { uint32_t next; } ArcaeaArena_t;
typedef struct ArcaeaWriter_t { uint32_t buffer, used, capacity; } ArcaeaWriter_t;

/** @brief Pack an RGBA8 color in the ABI's channel order. @return Packed color. */
static inline uint32_t arcaea_rgba(uint8_t red, uint8_t green, uint8_t blue, uint8_t alpha)
{
    return red | ((uint32_t)green << 8) | ((uint32_t)blue << 16) | ((uint32_t)alpha << 24);
}

/** @brief Initialize a column-major identity matrix. @param matrix Sixteen writable floats. */
static inline void arcaea_identity(float matrix[16])
{
    for (uint32_t i = 0; i < 16; ++i) matrix[i] = i % 5 == 0 ? 1.0f : 0.0f;
}

#if defined(__wasm__)
#ifdef __cplusplus
extern "C" {
#endif
extern unsigned char __heap_base;
#ifdef __cplusplus
}
#endif

/** @brief Reserve aligned bytes in a freestanding WASM heap. @param arena Persistent allocator. @param size Bytes. @param alignment Power of two. @return Offset or zero on overflow or allocation failure. */
static inline uint32_t arcaea_alloc(ArcaeaArena_t* arena, uint32_t size, uint32_t alignment)
{
    if (!size || !alignment || (alignment & (alignment - 1))) return 0;
    const uint64_t start = arena->next ? arena->next : (uintptr_t)&__heap_base;
    const uint64_t aligned = (start + alignment - 1) & ~(uint64_t)(alignment - 1);
    const uint64_t end = aligned + size;
    if (end > UINT32_MAX) return 0;
    const uint32_t needed = (uint32_t)((end + 65535) >> 16);
    const size_t pages = __builtin_wasm_memory_size(0);
    if (needed > pages && __builtin_wasm_memory_grow(0, needed - pages) == (size_t)-1) return 0;
    arena->next = (uint32_t)end;
    return (uint32_t)aligned;
}

/** @brief Reuse the previous frame's allocated output storage. @param writer Guest-owned output writer. */
static inline void arcaea_begin(ArcaeaWriter_t* writer) { writer->used = 0; }

/** @brief Append a TLV header and zeroed four-byte-aligned payload. @param writer Output writer. @param arena Guest storage. @param opcode Command identifier. @param size Meaningful payload bytes. @return Writable payload or null. */
static inline void* arcaea_command(ArcaeaWriter_t* writer, ArcaeaArena_t* arena, uint16_t opcode, uint32_t size)
{
    const uint64_t padded = ((uint64_t)size + 3) & ~(uint64_t)3;
    const uint64_t needed = (uint64_t)writer->used + sizeof(ModCmdHeader_t) + padded;
    if (needed > UINT32_MAX) return NULL;
    if (needed > writer->capacity) {
        uint64_t capacity = writer->capacity ? (uint64_t)writer->capacity * 2 : 256;
        if (capacity < needed || capacity > UINT32_MAX) capacity = needed;
        uint32_t offset = arcaea_alloc(arena, (uint32_t)capacity, 4);
        if (!offset) return NULL;
        unsigned char* buffer = (unsigned char*)(uintptr_t)offset;
        const unsigned char* previous = (const unsigned char*)(uintptr_t)writer->buffer;
        for (uint32_t i = 0; i < writer->used; ++i) buffer[i] = previous[i];
        writer->buffer = offset;
        writer->capacity = (uint32_t)capacity;
    }
    ModCmdHeader_t* header = (ModCmdHeader_t*)(uintptr_t)(writer->buffer + writer->used);
    header->opcode = opcode;
    header->flags = 0;
    header->payload_bytes = (uint32_t)padded;
    unsigned char* payload = (unsigned char*)(header + 1);
    for (uint32_t i = 0; i < padded; ++i) payload[i] = 0;
    writer->used = (uint32_t)needed;
    return payload;
}

/** @brief Return the current command span to the host. @param writer Completed writer. @param output Host-provided WASM offset. */
static inline void arcaea_finish(const ArcaeaWriter_t* writer, uint32_t output)
{
    ModCmdSlice_t* slice = (ModCmdSlice_t*)(uintptr_t)output;
    slice->ptr = writer->buffer;
    slice->bytes = writer->used;
}
#endif
#endif
