#include <stddef.h>
#include <stdint.h>

/** @brief Provide byte copying for a freestanding WASM module. @param destination Output. @param source Input. @param size Bytes. @return Destination. */
void* memcpy(void* destination, const void* source, size_t size)
{
    volatile unsigned char* dst = destination;
    const unsigned char* src = source;
    for (size_t i = 0; i < size; ++i) dst[i] = src[i];
    return destination;
}

/** @brief Set bytes without importing a C library. @param destination Output. @param value Byte value. @param size Bytes. @return Destination. */
void* memset(void* destination, int value, size_t size)
{
    volatile unsigned char* dst = destination;
    for (size_t i = 0; i < size; ++i) dst[i] = (unsigned char)value;
    return destination;
}

/** @brief Copy possibly overlapping WASM memory. @param destination Output. @param source Input. @param size Bytes. @return Destination. */
void* memmove(void* destination, const void* source, size_t size)
{
    if ((uintptr_t)destination <= (uintptr_t)source) return memcpy(destination, source, size);
    volatile unsigned char* dst = destination;
    const unsigned char* src = source;
    while (size > 0) { --size; dst[size] = src[size]; }
    return destination;
}
