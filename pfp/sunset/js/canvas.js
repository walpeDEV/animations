const canvas = {
  canvas: undefined,
  shaderProgram: undefined,
  width: 0,
  height: 0,
  gl: undefined,

  init: function () {
    canvas.canvas = document.getElementById('canvas');
    canvas.gl = canvas.canvas.getContext('webgl2', {
      alpha: true,
    });
  },
  resize: function () {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = w;
    canvas.height = h;

    canvas.canvas.width = w * dpr;
    canvas.canvas.height = h * dpr;
    canvas.canvas.style.width = w + 'px';
    canvas.canvas.style.height = h + 'px';

    canvas.gl.viewport(
      0,
      0,
      canvas.gl.drawingBufferWidth,
      canvas.gl.drawingBufferHeight,
    );
  },
};

export default canvas;
