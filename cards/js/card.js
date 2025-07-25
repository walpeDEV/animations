import canvas from './canvas.js';
import game from './game.js';
import { uniformLocations } from './gl-utils.js';
import drawText from './textDrawer.js';

function writeCredits(ctx, x, y, fontSize, space) {
  ctx.font = `${fontSize}px Inter`;
  const urlParts = ['github.com/walpeDEV/animations/', 'tree/master/cards'];
  let lineY = y;
  for (const part of urlParts) {
    ctx.fillText(part, x, lineY);
    const w = ctx.measureText(part).width;
    ctx.fillRect(x - w / 2, lineY, w, fontSize / 10);
    lineY += fontSize + space;
  }
}

class Card {
  w;
  h;
  x;
  y;
  lifeTime;
  text;
  title;
  hover = false;
  hoverResize = 0;

  constructor(x, y, w, h, title = '', text = '') {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.lifeTime = Math.floor(Math.random() * 360);
    this.text = text;
    this.title = title;
  }

  static vao;
  static vbo;

  static init() {
    const gl = canvas.gl;
    // prettier-ignore
    const vertices = new Float32Array([
			0, 0,
			1, 1,
			1, 0,

			0, 0,
			0, 1,
			1, 1,
		]);

    Card.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Card.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    Card.vao = gl.createVertexArray();
    gl.bindVertexArray(Card.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, Card.vbo);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  draw() {
    const gl = canvas.gl;
    this.lifeTime += game.lastFrameElapsed / 30;

    const transitionTime = 200;
    const hovRes = game.lastFrameElapsed / transitionTime;

    if (this.hover && this.hoverResize < 1) {
      this.hoverResize += hovRes;
      if (this.hoverResize > 1) this.hoverResize = 1;
    } else if (!this.hover && this.hoverResize > 0) {
      this.hoverResize -= hovRes;
      if (this.hoverResize < 0) this.hoverResize = 0;
    }

    const a = this.hoverResize / 20 + 1;
    const w = this.w * a;
    const h = this.h * a;
    const x = this.x + (this.w - w) / 2;
    const y = this.y + (this.h - h) / 2;

    const positionMatrix = this.getRectMatrix(x, y, w, h);

    gl.uniformMatrix4fv(uniformLocations.positionMatrix, false, positionMatrix);
    gl.uniform1f(uniformLocations.time, this.lifeTime);
    gl.uniform1f(uniformLocations.aspectRatio, w / h);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    const ctx = canvas.ctxText;
    ctx.fillStyle = 'black';
    ctx.fillRect(x + w * 0.13, y + h * 0.37, w * 0.74, h * 0.5);

    ctx.fillStyle = 'white';
    ctx.font = `bold ${h / 14}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(this.title, x + w / 2, y + h * 0.49);
    const size = h / 27;
    ctx.font = `${size}px Inter`;
    drawText(
      ctx,
      this.text,
      x + w / 2,
      y + h * 0.6,
      size,
      h / 80 + size,
      w * 0.7,
    );

    writeCredits(ctx, x + w / 2, y + h * 0.78, h / 40, h / 80);
  }

  getRectMatrix(x, y, w, h) {
    const scaleX = 2 / canvas.width;
    const scaleY = 2 / canvas.height;

    const ndcX = x * scaleX - 1;
    const ndcY = 1 - y * scaleY;

    const ndcW = w * scaleX;
    const ndcH = h * scaleY;

    // prettier-ignore
    return new Float32Array([
    ndcW,  0,    0, 0,
    0,    -ndcH, 0, 0,
    0,     0,    1, 0,
    ndcX, ndcY,  0, 1,
  ]);
  }

  resizeAroundMid(newW, newH) {
    let mX = this.x + this.w / 2;
    let mY = this.y + this.h / 2;
    this.x = mX - newW / 2;
    this.y = mY - newH / 2;
    this.w = newW;
    this.h = newH;
  }

  mouseMove(x, y) {
    this.hover =
      x >= this.x &&
      x <= this.x + this.w &&
      y >= this.y &&
      y <= this.y + this.h;
  }
}

export default Card;
