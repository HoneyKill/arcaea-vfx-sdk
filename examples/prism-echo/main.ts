import {
  ABI_VERSION, allocate, Blend, CommandWriter, createTarget, Frame, FrameFlag,
  Layer, Opcode, PostFlag, readParam, Scene, ScenePhase, shaderFiles, slot, TargetFlag,
} from "../../assemblyscript/assembly/index";

const writer = new CommandWriter();
const SHADER_VERTEX = "shaders/fullscreen.vert";
const PASS_BYTES: u32 = 32;
const PULSE_SECONDS: f32 = 1.1;

let prismShader: i32;
let bloomShader: i32;
let prismTarget: i32;
let bloomTarget: i32;
let viewSlot: i32;
let soundSlot: i32;
let touchSlot: i32;
let bloomSlot: i32;
let intensity: f32;
let sceneStart: f64 = -1;
let touchId: i32 = -1;
let pulseX: f32;
let pulseY: f32;
let pulseStart: f64 = -PULSE_SECONDS;

/** Report the host ABI implemented by this module. */
export function mod_abi_version(): u32 { return ABI_VERSION; }

/** Reserve bytes for the host at the requested alignment. */
export function mod_alloc(bytes: u32, align: u32): u32 { return allocate(bytes, align); }

/** Accept the host configuration and return the initialization status. */
export function mod_init(_config: u32): i32 { return 0; }

/** Build the menu's optical and bloom passes. Return a nonzero status on setup failure. */
export function mod_on_scene(scene: u32, phase: u32): i32 {
  if (scene != Scene.MainMenu || phase != ScenePhase.Enter) return 0;
  prismShader = shaderFiles(SHADER_VERTEX, "shaders/prism.frag");
  bloomShader = shaderFiles(SHADER_VERTEX, "shaders/bloom.frag");
  prismTarget = createTarget(49152, TargetFlag.Linear);
  bloomTarget = createTarget(32768, TargetFlag.Linear);
  if (min(min(prismShader, bloomShader), min(prismTarget, bloomTarget)) <= 0) return -1;

  viewSlot = slot(prismShader, "u_view");
  soundSlot = slot(prismShader, "u_sound");
  touchSlot = slot(prismShader, "u_touch");
  bloomSlot = slot(bloomShader, "u_glow");
  if (min(min(viewSlot, soundSlot), min(touchSlot, bloomSlot)) <= 0) return -1;

  const key = String.UTF8.encode("intensity");
  const value = heap.alloc(4);
  const status = readParam(changetype<u32>(key), <u32>key.byteLength, <u32>value);
  if (status == 0) intensity = load<f32>(value);
  heap.free(value);
  if (status != 0) return status;

  sceneStart = -1;
  touchId = -1;
  return 0;
}

/** Accept a chart seek. This menu theme carries no chart state. */
export function mod_seek(_timeMs: i32): void {}

/** Start a pulse at the first active contact in the frame, once per press. */
function sampleTouch(frame: u32, time: f64, width: f32, height: f32): void {
  for (let index: u32 = 0; index < Frame.touchCount(frame); ++index) {
    const touch = Frame.touch(frame, index);
    if (!touch) break;
    const phase = load<u8>(touch + 20);
    if (phase >= 2) continue;

    const id = load<i32>(touch);
    if (id != touchId || phase == 0) {
      pulseX = load<f32>(touch + 12) / width;
      pulseY = load<f32>(touch + 16) / height;
      pulseStart = time;
    }
    touchId = id;
    return;
  }
  touchId = -1;
}

/** Write one ModPostPass record targeting only the menu background. */
function writePass(at: usize, shader: i32, source: i32, target: i32, blend: Blend): void {
  store<i32>(at, shader);
  store<i32>(at + 4, source);
  store<i32>(at + 8, target);
  store<u32>(at + 16, Layer.Background);
  store<u32>(at + 20, target > 0 ? PostFlag.Clear : 0);
  store<u32>(at + 24, blend);
}

/** Pass the current audio and touch state to the shader graph and return its command slice. */
export function mod_update(frame: u32, out: u32): void {
  writer.begin();
  const width = Frame.designWidth(frame);
  const height = Frame.designHeight(frame);
  if (Frame.scene(frame) != Scene.MainMenu || width <= 0 || height <= 0) {
    writer.finish(out);
    return;
  }

  const now = Frame.appSeconds(frame);
  if (sceneStart < 0) {
    sceneStart = now;
    pulseStart = now - PULSE_SECONDS;
  }
  const reduced = (Frame.flags(frame) & FrameFlag.ReducedMotion) != 0;
  if (!reduced) sampleTouch(frame, now, width, height);
  const pulseAge = <f32>(now - pulseStart);
  const pulse = !reduced ? max<f32>(0, 1.0 - pulseAge / PULSE_SECONDS) : 0;
  const aspect = width / height;
  writer.uniform(prismShader, viewSlot, aspect, reduced ? 0 : <f32>((now - sceneStart) % 120), intensity, reduced ? 0 : 1);
  writer.uniform(prismShader, soundSlot, reduced ? 0 : Frame.band(frame, 0), reduced ? 0 : Frame.band(frame, 1),
    reduced ? 0 : Frame.band(frame, 3), reduced ? 0 : Frame.onset(frame));
  writer.uniform(prismShader, touchSlot, pulseX, pulseY, min(pulseAge, PULSE_SECONDS), pulse);
  writer.uniform(bloomShader, bloomSlot, aspect, intensity);

  const graph = writer.command(Opcode.RenderGraph, 4 + 4 * PASS_BYTES);
  if (graph) {
    store<u32>(graph, 4);
    const passes = graph + 4;
    writePass(passes, prismShader, 0, prismTarget, Blend.Replace);
    writePass(passes + PASS_BYTES, bloomShader, prismTarget, bloomTarget, Blend.Replace);
    writePass(passes + 2 * PASS_BYTES, 0, prismTarget, 0, Blend.Replace);
    writePass(passes + 3 * PASS_BYTES, 0, bloomTarget, 0, Blend.Add);
  }
  writer.finish(out);
}
