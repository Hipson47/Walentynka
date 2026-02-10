import type { MotionMode } from "../../hooks/useMotionMode";
import type { HeroRenderer } from "./types";

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram | null {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load hero image for WebGL2 renderer."));
    image.src = src;
  });
}

export async function createWebGL2HeroRenderer(
  canvas: HTMLCanvasElement,
  heroImageSrc: string,
): Promise<HeroRenderer | null> {
  const gl = canvas.getContext("webgl2", { antialias: true, alpha: false, powerPreference: "high-performance" });
  if (!gl) return null;

  const vertexSource = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = (aPosition + 1.0) * 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

  const fragmentSource = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uHeroTexture;
uniform float uTime;
uniform float uVNorm;
uniform float uLiteMode;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  float timeFactor = mix(uTime, 0.0, step(0.5, uLiteMode));
  float amp = mix(0.002, 0.018, clamp(uVNorm, 0.0, 1.0));
  vec2 uv = vUv;
  vec2 p = uv * vec2(8.0, 6.0) + vec2(timeFactor * 0.7, -timeFactor * 0.45);
  float n = noise(p);
  float wobble = sin((uv.y + timeFactor * 0.35) * 22.0) * cos((uv.x - timeFactor * 0.25) * 17.0);
  vec2 displacement = vec2((n - 0.5) * 2.0 + wobble * 0.25, wobble * 0.18) * amp;
  vec2 displacedUv = clamp(uv + displacement, 0.0, 1.0);

  if (uLiteMode > 0.5) {
    outColor = texture(uHeroTexture, displacedUv);
    return;
  }

  vec2 chroma = vec2(amp * 0.55, amp * 0.25);
  float r = texture(uHeroTexture, clamp(displacedUv + chroma, 0.0, 1.0)).r;
  float g = texture(uHeroTexture, displacedUv).g;
  float b = texture(uHeroTexture, clamp(displacedUv - chroma, 0.0, 1.0)).b;
  outColor = vec4(r, g, b, 1.0);
}`;

  const program = createProgram(gl, vertexSource, fragmentSource);
  if (!program) return null;

  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) {
    gl.deleteProgram(program);
    return null;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const vao = gl.createVertexArray();
  if (!vao) {
    gl.deleteBuffer(positionBuffer);
    gl.deleteProgram(program);
    return null;
  }

  gl.bindVertexArray(vao);
  const positionLocation = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  const texture = gl.createTexture();
  if (!texture) {
    gl.deleteVertexArray(vao);
    gl.deleteBuffer(positionBuffer);
    gl.deleteProgram(program);
    return null;
  }

  const image = await loadImage(heroImageSrc);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  const timeLocation = gl.getUniformLocation(program, "uTime");
  const vNormLocation = gl.getUniformLocation(program, "uVNorm");
  const liteModeLocation = gl.getUniformLocation(program, "uLiteMode");
  const textureLocation = gl.getUniformLocation(program, "uHeroTexture");

  const render = (timeSeconds: number, vNorm: number, motionMode: MotionMode) => {
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(textureLocation, 0);
    gl.uniform1f(timeLocation, timeSeconds);
    gl.uniform1f(vNormLocation, Math.min(Math.max(vNorm, 0), 1));
    gl.uniform1f(liteModeLocation, motionMode === "lite" ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  };

  return {
    backend: "webgl2",
    setSize: (width, height, dpr, renderScale) => {
      const scale = Math.max(0.1, renderScale);
      canvas.width = Math.max(1, Math.floor(width * dpr * scale));
      canvas.height = Math.max(1, Math.floor(height * dpr * scale));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    render,
    dispose: () => {
      gl.deleteTexture(texture);
      gl.deleteVertexArray(vao);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    },
  };
}
