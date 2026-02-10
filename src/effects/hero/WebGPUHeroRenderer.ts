import type { MotionMode } from "../../hooks/useMotionMode";
import type { HeroRenderer } from "./types";

type GPUCanvasContextLike = {
  configure: (config: Record<string, unknown>) => void;
  getCurrentTexture: () => { createView: () => unknown };
};

function loadImageBitmap(src: string): Promise<ImageBitmap> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      createImageBitmap(image).then(resolve).catch(reject);
    };
    image.onerror = () => reject(new Error("Failed to load hero image for WebGPU renderer."));
    image.src = src;
  });
}

export async function createWebGPUHeroRenderer(
  canvas: HTMLCanvasElement,
  heroImageSrc: string,
  enabled: boolean,
): Promise<HeroRenderer | null> {
  if (!enabled) return null;

  const maybeNavigator = navigator as Navigator & { gpu?: any };
  if (!maybeNavigator.gpu) return null;
  const gpuTextureUsage = (globalThis as any).GPUTextureUsage;
  const gpuBufferUsage = (globalThis as any).GPUBufferUsage;
  const gpuShaderStage = (globalThis as any).GPUShaderStage;
  if (!gpuTextureUsage || !gpuBufferUsage || !gpuShaderStage) return null;

  const adapter = await maybeNavigator.gpu.requestAdapter();
  if (!adapter) return null;

  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu") as GPUCanvasContextLike | null;
  if (!context) return null;

  const format = maybeNavigator.gpu.getPreferredCanvasFormat();
  const bitmap = await loadImageBitmap(heroImageSrc);

  const heroTexture = device.createTexture({
    size: [bitmap.width, bitmap.height],
    format: "rgba8unorm",
    usage: gpuTextureUsage.TEXTURE_BINDING | gpuTextureUsage.COPY_DST | gpuTextureUsage.RENDER_ATTACHMENT,
  });
  device.queue.copyExternalImageToTexture({ source: bitmap }, { texture: heroTexture }, [bitmap.width, bitmap.height]);

  const sampler = device.createSampler({
    magFilter: "linear",
    minFilter: "linear",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
  });

  const uniformBuffer = device.createBuffer({
    size: 16,
    usage: gpuBufferUsage.UNIFORM | gpuBufferUsage.COPY_DST,
  });

  const shaderModule = device.createShaderModule({
    code: `
struct Uniforms {
  time: f32,
  vNorm: f32,
  liteMode: f32,
  pad: f32
};

@group(0) @binding(0) var heroTex: texture_2d<f32>;
@group(0) @binding(1) var heroSampler: sampler;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

@vertex
fn vsMain(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
  var pos = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );
  return vec4<f32>(pos[vertexIndex], 0.0, 1.0);
}

fn uvFromPos(position: vec4<f32>) -> vec2<f32> {
  return position.xy * 0.5 + vec2<f32>(0.5, 0.5);
}

@fragment
fn fsMain(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
  let uv = uvFromPos(position);
  let amp = mix(0.002, 0.015, clamp(uniforms.vNorm, 0.0, 1.0));
  let t = select(uniforms.time, 0.0, uniforms.liteMode > 0.5);
  let wave = sin((uv.y + t * 0.35) * 24.0) * cos((uv.x - t * 0.22) * 19.0);
  let displaced = clamp(uv + vec2<f32>(wave * amp, wave * amp * 0.45), vec2<f32>(0.0), vec2<f32>(1.0));
  let baseColor = textureSample(heroTex, heroSampler, displaced);
  return vec4<f32>(baseColor.rgb, 1.0);
}`,
  });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: gpuShaderStage.FRAGMENT, texture: { sampleType: "float" } },
      { binding: 1, visibility: gpuShaderStage.FRAGMENT, sampler: { type: "filtering" } },
      { binding: 2, visibility: gpuShaderStage.FRAGMENT, buffer: { type: "uniform" } },
    ],
  });

  const pipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] });
  const pipeline = device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: { module: shaderModule, entryPoint: "vsMain" },
    fragment: {
      module: shaderModule,
      entryPoint: "fsMain",
      targets: [{ format }],
    },
    primitive: { topology: "triangle-list" },
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: heroTexture.createView() },
      { binding: 1, resource: sampler },
      { binding: 2, resource: { buffer: uniformBuffer } },
    ],
  });

  const setSize = (width: number, height: number, dpr: number, renderScale: number) => {
    const scale = Math.max(0.1, renderScale);
    canvas.width = Math.max(1, Math.floor(width * dpr * scale));
    canvas.height = Math.max(1, Math.floor(height * dpr * scale));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.configure({
      device,
      format,
      alphaMode: "premultiplied",
    });
  };

  const render = (timeSeconds: number, vNorm: number, motionMode: MotionMode) => {
    const uniforms = new Float32Array([timeSeconds, Math.min(Math.max(vNorm, 0), 1), motionMode === "lite" ? 1 : 0, 0]);
    device.queue.writeBuffer(uniformBuffer, 0, uniforms.buffer, uniforms.byteOffset, uniforms.byteLength);

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3, 1, 0, 0);
    pass.end();
    device.queue.submit([encoder.finish()]);
  };

  return {
    backend: "webgpu",
    setSize,
    render,
    dispose: () => {
      uniformBuffer.destroy();
      heroTexture.destroy();
    },
  };
}
