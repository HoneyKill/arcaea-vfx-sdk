import {
  ABI_VERSION, allocate, Blend, CommandWriter, Frame, FrameFlag, Layer, Opcode, rgba, Scene,
} from "../../assemblyscript/assembly/index";

const writer = new CommandWriter();
const barCount: u32 = 20;
const batchHeaderBytes: u32 = 20;
const particleBytes: u32 = 28;

/** Report the ABI implemented by this guest. */
export function mod_abi_version(): u32 { return ABI_VERSION; }

/** Reserve the host's frame storage with its requested alignment. */
export function mod_alloc(bytes: u32, align: u32): u32 { return allocate(bytes, align); }

/** Accept the read-only initialization record. */
export function mod_init(_config: u32): i32 { return 0; }

/** Accept scene entry and exit without creating persistent nodes. */
export function mod_on_scene(_scene: u32, _phase: u32): i32 { return 0; }

/** Accept chart seeks. The spectrum has no gameplay state to reset. */
export function mod_seek(_timeMs: i32): void {}

/** Draw a music-reactive ribbon of cyan and violet tiles in the lower menu. */
export function mod_update(frame: u32, out: u32): void {
  writer.begin();
  if (Frame.scene(frame) == Scene.MainMenu) {
    const width = Frame.designWidth(frame);
    const height = Frame.designHeight(frame);
    const reduced = (Frame.flags(frame) & FrameFlag.ReducedMotion) != 0;
    const time = <f32>Frame.appSeconds(frame);
    const batch = writer.command(Opcode.Particles, batchHeaderBytes + barCount * 2 * particleBytes);
    if (batch != 0) {
      store<u32>(batch + 8, Layer.Hud);
      store<u32>(batch + 12, Blend.Add);
      store<u32>(batch + 16, barCount * 2);
      for (let bar: u32 = 0; bar < barCount; ++bar) {
        const fraction = <f32>bar / <f32>(barCount - 1);
        const energy = reduced ? <f32>0.16 : min<f32>(1, Frame.spectrum(frame, 2 + bar * 3) * 11);
        const wave = reduced ? <f32>0.5 : (Mathf.sin(time * 2.8 - fraction * 8) + 1) * 0.5;
        const x = width * (0.30 + 0.39 * fraction);
        const y = height * (0.12 + 0.028 * wave);
        const barHeight = height * (0.012 + 0.018 * wave + 0.075 * energy);
        const red = <u8>(92 + 122 * fraction);
        const green = <u8>(229 - 97 * fraction);
        const alpha = <u8>(125 + 110 * energy);
        const tile = batch + batchHeaderBytes + bar * 2 * particleBytes;
        storeParticle(tile, x, y - barHeight * 0.33, width * 0.009, barHeight * 0.42, rgba(red, green, 255, 46));
        storeParticle(tile + particleBytes, x, y + barHeight * 0.5, width * 0.009, barHeight, rgba(red, green, 255, alpha));
      }
    }
  }
  writer.finish(out);
}

/** Write a screen-space quad to a VfxParticle record in the current batch. */
function storeParticle(ptr: usize, x: f32, y: f32, width: f32, height: f32, color: u32): void {
  store<f32>(ptr, x);
  store<f32>(ptr + 4, y);
  store<f32>(ptr + 12, width);
  store<f32>(ptr + 16, height);
  store<u32>(ptr + 24, color);
}
