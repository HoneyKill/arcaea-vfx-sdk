// Compile for wasm32-freestanding with the sdk/c include path.
pub const abi = @cImport({
    @cInclude("arcaea_mod_abi.h");
});

pub extern "arcaea" fn host_find_object(name: u32, length: u32) i32;
pub extern "arcaea" fn host_describe_object(handle: i32, description: u32) i32;
pub extern "arcaea" fn host_create_node(kind: u32, config: u32, bytes: u32) i32;
pub extern "arcaea" fn host_set_parent(child: i32, parent: i32, keep_world: u32) i32;
pub extern "arcaea" fn host_load_texture(path: u32, bytes: u32, flags: u32) i32;
pub extern "arcaea" fn host_create_shader(vertex: u32, vertex_bytes: u32, fragment: u32, fragment_bytes: u32, flags: u32) i32;
pub extern "arcaea" fn host_uniform_slot(shader: i32, name: u32, bytes: u32) i32;
pub extern "arcaea" fn host_create_rt(scale_q16: u32, flags: u32) i32;
pub extern "arcaea" fn host_bind_note_shader(part: u32, shader: i32, flags: u32) i32;
pub extern "arcaea" fn host_read_notes(first: u32, count: u32, out: u32) i32;
pub extern "arcaea" fn host_read_note_ordinals(first: u32, count: u32, out: u32) i32;
pub extern "arcaea" fn host_read_timings(group: u32, first: u32, count: u32, out: u32) i32;
pub extern "arcaea" fn host_override_paths(paths: u32, count: u32) i32;
pub extern "arcaea" fn host_load_sfx(path: u32, bytes: u32) i32;
pub extern "arcaea" fn host_read_param(key: u32, bytes: u32, out: u32) i32;
pub extern "arcaea" fn host_log(severity: u32, message: u32, bytes: u32) void;
pub extern "arcaea" fn host_read_asset(path: u32, bytes: u32, out: u32, capacity: u32) i32;
/// Write a staged output file from mod_convert.
pub extern "arcaea" fn host_import_write(path: u32, path_bytes: u32, data: u32, bytes: u32) i32;
/// Copy an archive or package resource to a staged output path from mod_convert.
pub extern "arcaea" fn host_import_copy(source: u32, source_bytes: u32, output: u32, output_bytes: u32, source_kind: u32) i32;

/// Convert a guest pointer to the linear-memory offset expected by the ABI.
pub fn offset(pointer: anytype) u32 {
    return @intCast(@intFromPtr(pointer));
}

/// Complete a command frame whose storage will remain live until the next call.
pub fn finish(output: *abi.ModCmdSlice_t, commands: []const u8) void {
    output.* = .{
        .ptr = if (commands.len == 0) 0 else offset(commands.ptr),
        .bytes = @intCast(commands.len),
    };
}
