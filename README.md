# Arcaea VFX SDK

Arcaea_std 的特效插件 SDK，支持 C、Zig、Rust 和 AssemblyScript。

## 安装插件

在游戏主菜单打开 **Plugins → Import plugin**，选择插件的 ZIP。安装后打开插件的 **Details → Enable** 启用。带特效的谱面包可通过 **Import Charts** 导入。

## 体验示例

**折光回声（Prism Echo）** 在主菜单悬浮一枚玻璃棱镜。低音点亮棱镜核心，点击背景会让折射涟漪向外扩散。可在插件详情调整光强。 [示例源码](examples/prism-echo/)

安装 Node.js 和 CMake 后，在本仓库根目录运行以下命令生成 `prism-echo.zip`。

```sh
npm install --no-save --no-package-lock assemblyscript@0.27.31
node assemblyscript/build.mjs examples/prism-echo/main.ts --output=examples/prism-echo/vfx/main.wasm
cmake -E chdir examples/prism-echo cmake -E tar cf ../../prism-echo.zip --format=zip vfx
```

导入并启用后，关闭插件面板即可看到效果。

## 制作插件

可从示例开始。修改 `vfx/manifest.json` 中的 `id` 和 `name`，把编译产物和素材放入 `vfx/`，再将整个目录打包为 ZIP。 [示例清单](examples/prism-echo/vfx/manifest.json)

[C SDK](c/) · [Zig 接口](c/arcaea.zig) · [Rust SDK](rust/) · [AssemblyScript SDK](assemblyscript/)
