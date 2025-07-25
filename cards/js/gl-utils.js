import canvas from './canvas.js';

export const uniformLocations = {
  positionMatrix: undefined,
  aspectRatio: undefined,
  time: undefined,
};

export function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export const throwGlError = (m) => {
  const mes = m + '\nWebGL Error: ' + canvas.gl.getError();
  canvas.error.style = 'position: absolute;';
  canvas.error.innerText = mes;
  throw new Error(mes);
};

export async function loadShaderSource(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load shader: ${url}`);
  }
  return await response.text();
}

export async function initWebGL(gl, vertexShaderSrc, fragmentShaderSrc) {
  if (vertexShaderSrc === undefined) vertexShaderSrc = 'glsl/vertexShader.vert';
  if (fragmentShaderSrc === undefined)
    fragmentShaderSrc = 'glsl/fragmentShader.frag';
  const vertexShaderSource = await loadShaderSource(vertexShaderSrc);
  const fragmentShaderSource = await loadShaderSource(fragmentShaderSrc);

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );

  canvas.shaderProgram = createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(canvas.shaderProgram);

  // NOTE: Not needed for this porject
  // gl.enable(gl.DEPTH_TEST);
  // gl.depthFunc(gl.LESS);
  // gl.enable(gl.CULL_FACE);

  uniformLocations.positionMatrix = gl.getUniformLocation(
    canvas.shaderProgram,
    'u_positionMatrix',
  );

  uniformLocations.time = gl.getUniformLocation(canvas.shaderProgram, 'u_time');
  uniformLocations.aspectRatio = gl.getUniformLocation(
    canvas.shaderProgram,
    'u_aspectRatio',
  );
}
