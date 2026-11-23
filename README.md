# Arcaea VFX SDK

Arcaea_std 的特效插件 SDK，支持 C、Zig、Rust 和 AssemblyScript。

## 安装插件

在游戏主菜单打开 **Plugins → Import plugin**，选择插件的 ZIP。安装后打开插件的 **Details → Enable** 启用。带特效的谱面包可通过 **Import Charts** 导入。

## 体验示例

**潮汐光谱（Tidal Spectrum）** 会在主菜单下方显示随音乐起伏的青紫色光带。安装 Node.js 和 CMake 后，在本仓库根目录运行以下命令生成 `tidal-spectrum.zip`。 [示例源码](examples/tidal-spectrum/main.ts)

```sh
npm install --no-save --no-package-lock assemblyscript@0.27.31
node assemblyscript/build.mjs examples/tidal-spectrum/main.ts --output=examples/tidal-spectrum/vfx/main.wasm
cmake -E chdir examples/tidal-spectrum cmake -E tar cf ../../tidal-spectrum.zip --format=zip vfx
```

导入并启用后，关闭插件面板即可看到效果。

## 制作插件

可从示例开始。修改 `vfx/manifest.json` 中的 `id` 和 `name`，把编译产物和素材放入 `vfx/`，再将整个目录打包为 ZIP。 [示例清单](examples/tidal-spectrum/vfx/manifest.json)

[C SDK](c/) · [Zig 接口](c/arcaea.zig) · [Rust SDK](rust/) · [AssemblyScript SDK](assemblyscript/)
