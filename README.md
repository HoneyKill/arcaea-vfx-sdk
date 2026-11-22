# Arcaea VFX SDK

使用 C/Zig、Rust 或 AssemblyScript 为 Arcaea_std 制作 WebAssembly 特效插件。

## 快速开始

克隆仓库，在根目录新建 `main.ts`。这个插件进入主菜单时会把 `Hello, Arcaea!` 写入游戏日志。

```ts
import { ABI_VERSION, allocate, logMessage, ScenePhase } from "./assemblyscript/assembly/index";

export function mod_abi_version(): u32 { return ABI_VERSION; }
export function mod_alloc(bytes: u32, align: u32): u32 { return allocate(bytes, align); }
export function mod_init(config: u32): i32 { return 0; }

export function mod_on_scene(scene: u32, phase: u32): i32 {
  if (phase == ScenePhase.Enter) {
    const message = String.UTF8.encode("Hello, Arcaea!");
    logMessage(0, changetype<u32>(message), <u32>message.byteLength);
  }
  return 0;
}
```

用 Node.js 和 npm 编译，输出为 `vfx/main.wasm`。

```sh
npm init -y
npm install --save-dev assemblyscript@0.27.31
node assemblyscript/build.mjs main.ts
```

## 打包和安装

创建 `vfx/manifest.json`。`entry` 和素材路径都相对于 `vfx/`。发布自己的插件时换成自己的 `id`。

```json
{
  "abi": 1,
  "id": "example.hello",
  "name": "Hello Arcaea",
  "scope": "global",
  "scenes": ["main_menu"],
  "entry": "main.wasm"
}
```

在仓库根目录打包 `vfx/`，把生成的 ZIP 发给玩家。

```sh
cmake -E tar cf hello-vfx.zip --format=zip vfx
```

在游戏里打开 **Plugins → Import plugin** 导入 ZIP，再到 **Details** 启用。谱面特效使用 `scope: "chart"`，随曲包把 `vfx/` 放在谱面目录。

## SDK 接口

- **C/Zig** 使用 `c/` 下的 ABI。C 用 Clang 和 LLD 编译到 `wasm32-unknown-unknown`，并编入 `c/runtime.c`。Zig 使用 `wasm32-freestanding`，把 `c/` 加入头文件搜索路径。 [C 接口](c/arcaea_sdk.h) · [Zig 接口](c/arcaea.zig)
- **Rust** 将 `rust/` 添加为 `arcaea-vfx` 路径依赖，把 Cargo 配置放在插件项目的 `.cargo/` 中，将 `cdylib` 编译到 `wasm32-unknown-unknown`。 [Rust 接口](rust/src/abi.rs) · [Cargo 配置](rust/.cargo/config.toml)
- **AssemblyScript** 从 `assemblyscript/assembly/index.ts` 导入帧数据和命令写入器。 [AssemblyScript 接口](assemblyscript/assembly/index.ts)

在 `mod_on_scene` 创建场景对象，在 `mod_update` 读取每帧数据并提交渲染指令。 [ABI 定义](c/arcaea_mod_abi.h)
