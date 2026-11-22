import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const sdk = dirname(fileURLToPath(import.meta.url));
const project = process.cwd();
const flags = process.argv.slice(2);
const watching = flags.includes("--watch");
const entry = resolve(project, flags.find(value => !value.startsWith("--")) || "main.ts");
const outArg = flags.find(value => value.startsWith("--output="));
const destination = outArg ? resolve(project, outArg.slice("--output=".length)) : join(project, "vfx", "main.wasm");
const temporary = destination + ".next";
const compiler = join(project, "node_modules", "assemblyscript", "bin", "asc.js");

let active = false;
let pending = false;
let timer;

/** Initialize AssemblyScript before the host asks the guest to allocate ABI buffers.
 * @param {string} binaryPath Compiled module to prepare for the game.
 * @returns {Promise<void>} The module is ready for publication.
 */
async function bindRuntimeStart(binaryPath) {
  const requireCompiler = createRequire(compiler);
  const { default: binaryen } = await import(pathToFileURL(requireCompiler.resolve("binaryen")).href);
  const module = binaryen.readBinary(await readFile(binaryPath));
  try {
    const startupExport = module.getExport("arcaea_runtime_start");
    if (!startupExport) return;
    const versionExport = module.getExport("mod_abi_version");
    if (!versionExport) throw new Error("The AssemblyScript entry must export mod_abi_version");
    const startup = binaryen.getExportInfo(startupExport).value;
    const version = binaryen.getExportInfo(versionExport).value;
    const wrapper = "arcaea.sdk.abi_version";
    module.addFunction(wrapper, binaryen.none, binaryen.i32, [], module.block(null, [
      module.call(startup, [], binaryen.none),
      module.call(version, [], binaryen.i32)
    ], binaryen.i32));
    module.removeExport("arcaea_runtime_start");
    module.removeExport("mod_abi_version");
    module.addFunctionExport(wrapper, "mod_abi_version");
    module.setFeatures(module.getFeatures() | binaryen.Features.BulkMemory | binaryen.Features.MutableGlobals |
      binaryen.Features.NontrappingFPToInt | binaryen.Features.SignExt);
    if (!module.validate()) throw new Error("AssemblyScript runtime initialization produced an invalid module");
    await writeFile(binaryPath, module.emitBinary());
  } finally {
    module.dispose();
  }
}

// Publish only a successful compiler output so the game watches a complete module.
async function compile() {
  if (active) {
    pending = true;
    return;
  }
  active = true;
  try {
    await mkdir(dirname(destination), { recursive: true });
    const status = await new Promise((resolveStatus, reject) => {
      const processHandle = spawn(process.execPath, [compiler, entry, "--config", join(sdk, "asconfig.json"),
        "--target", "release", "--outFile", temporary], { stdio: "inherit" });
      processHandle.once("error", reject);
      processHandle.once("exit", resolveStatus);
    });
    if (status !== 0) throw new Error("AssemblyScript compilation failed");
    await bindRuntimeStart(temporary);
    await rename(temporary, destination);
  } catch (error) {
    await rm(temporary, { force: true });
    console.error(error.message);
    if (!watching) process.exitCode = 1;
  } finally {
    active = false;
    if (pending) {
      pending = false;
      void compile();
    }
  }
}

// Coalesce atomic-save rename events and ordinary source changes.
function queue(_event, filename) {
  if (filename && extname(filename.toString()) !== ".ts") return;
  clearTimeout(timer);
  timer = setTimeout(() => void compile(), 60);
}

if (watching) {
  for (const directory of new Set([dirname(entry), join(sdk, "assembly")]))
    watch(directory, queue);
}
await compile();
