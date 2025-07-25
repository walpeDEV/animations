const canvas = {
  canvas: undefined,
  text: undefined,
  ctxText: undefined,
  shaderProgram: undefined,
  width: 0,
  height: 0,
  gl: undefined,

  init: function () {
    canvas.canvas = document.getElementById('canvas');
    canvas.gl = canvas.canvas.getContext('webgl2', {
      alpha: true,
    });
    canvas.text = document.getElementById('text');
    canvas.ctxText = canvas.text.getContext('2d');
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

    canvas.text.width = w * dpr;
    canvas.text.height = h * dpr;
    canvas.text.style.width = w + 'px';
    canvas.text.style.height = h + 'px';
    canvas.ctxText.setTransform(1, 0, 0, 1, 0, 0);
    canvas.ctxText.scale(dpr, dpr);

    canvas.gl.viewport(
      0,
      0,
      canvas.gl.drawingBufferWidth,
      canvas.gl.drawingBufferHeight,
    );
  },
};

export default canvas;
