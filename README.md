# Arcaea VFX SDK

使用 C／Zig、Rust 或 AssemblyScript 为 Arcaea_std 制作 WebAssembly 特效插件。

## 快速开始 · 潮汐光谱

**Tidal Spectrum** 在主菜单下方绘制一条青紫色光带。每个光块用一段 BGM 频谱控制高度，水波从左向右移动。开启 **Reduced Motion** 时光带保持静止。示例使用宿主的粒子四边形，无需图片或着色器文件。 [示例源码](examples/tidal-spectrum/main.ts) · [清单](examples/tidal-spectrum/vfx/manifest.json)

在 SDK 根目录安装 Node.js 和 npm 后，执行以下命令编译并打包。`main.ts` 已包含 ABI 1 要求的六个导出函数。

```sh
npm install --no-save --no-package-lock assemblyscript@0.27.31
node assemblyscript/build.mjs examples/tidal-spectrum/main.ts --output=examples/tidal-spectrum/vfx/main.wasm
cmake -E chdir examples/tidal-spectrum cmake -E tar cf ../../tidal-spectrum.zip --format=zip vfx
```

在游戏主菜单打开 **Plugins → Import plugin**，选择 `tidal-spectrum.zip`。安装后进入 **Details → Enable**，关闭插件面板即可看到效果。调整 `barCount` 可改变光块数。清单中的 `entry` 和素材路径相对于 `vfx/`，发布自己的作品前请换掉示例 `id`。

## 客户端兼容性

`"abi": 1` 标识接口的传输格式。源码构建可用下表确认客户端基线。各平台安装包请以其发布说明采用的源码为准。

| 功能 | 最低客户端源码或能力 |
| --- | --- |
| 潮汐光谱、基础演出与归档转换 | [`350ec0a`](https://github.com/HoneyKill/Arcaea_std/commit/350ec0a) |
| `host_read_note_ordinals`、累计判定计数、`0x0010` 到 `0x0015` 指令 | [`bdd783e`](https://github.com/HoneyKill/Arcaea_std/commit/bdd783e) |
| Arc 投影自定义网格 | `MOD_FEATURE_ARC_PROJECTION_MESH` |
| 可在演出中处理的 `host_read_asset` 失败 | `MOD_FEATURE_ASSET_READ_ERRORS` |

宿主导入在初始化前解析。使用 `host_read_note_ordinals` 等新增导入时，请在插件分发说明标明最低版本。能力位通过 `ModInitConfig_t.features` 读取。

新版客户端会在导入全局插件或谱面包时检查所声明模块的 WASM 导入和导出签名。演出模块需要 `mod_abi_version`、`mod_alloc`、`mod_init`、`mod_on_scene`、`mod_seek`、`mod_update`。普通宿主导入在 `mod_init` 和 `mod_on_scene` 的进场阶段调用，`host_log` 也可在其他回调中调用。 [C ABI 定义](c/arcaea_mod_abi.h)

## SDK 接口

- **C／Zig**。C 用 Clang 和 LLD 编译到 `wasm32-unknown-unknown`，并编入 `c/runtime.c`。Zig 使用 `wasm32-freestanding`，把 `c/` 加入头文件搜索路径。 [C 接口](c/arcaea_sdk.h) · [Zig 接口](c/arcaea.zig)
- **Rust**。将 `rust/` 添加为 `arcaea-vfx` 路径依赖，把 Cargo 配置放在插件项目的 `.cargo/` 中，将 `cdylib` 编译到 `wasm32-unknown-unknown`。 [Rust 接口](rust/src/abi.rs) · [Cargo 配置](rust/.cargo/config.toml)
- **AssemblyScript**。从 `assemblyscript/assembly/index.ts` 导入 `Init`、`Frame`、`CommandWriter` 及 ABI 常量。`CommandWriter.command` 接收指令编号和载荷字节数，载荷字段按 C ABI 写入。 [AssemblyScript 接口](assemblyscript/assembly/index.ts)

谱面演出使用 `scope: "chart"`，随曲包把 `vfx/` 放在 AFF 所在目录。自定义归档格式用全局插件的 `chartImporter` 声明独立的转换模块。转换模块导出 `mod_abi_version` 和 `mod_convert`，使用 `host_read_asset` 读取输入归档，以及 `host_import_write` 和 `host_import_copy` 生成原生曲包。AssemblyScript 转换器用 `node assemblyscript/build.mjs converter.ts --importer` 生成 `vfx/importer.wasm`。 [游戏插件指南](https://github.com/HoneyKill/Arcaea_std/blob/main/work_space/docs/wasm-vfx.md)
