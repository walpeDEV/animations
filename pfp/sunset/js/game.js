import canvas from './canvas.js';
import { uniformLocations } from './gl-utils.js';

const randomNumber = Math.floor(Math.random() * 1e5);
const game = {
  tickCount: 0,

  lastFrameElapsed: undefined,
  currentTimeStamp: undefined,
  startTimeStamp: undefined,
  currentTimeStamp: undefined,
  totalElapsed: undefined,

  vbo: undefined,
  vao: undefined,
  start: function () {
    // const w = canvas.width;
    // const h = canvas.height;

    const gl = canvas.gl;
    // prettier-ignore
    const vertices = new Float32Array([
			-1, -1,
			 1,  1,
			 1, -1,

			-1, -1,
			-1,  1,
			 1,  1,
		]);

    game.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, game.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    game.vao = gl.createVertexArray();
    gl.bindVertexArray(game.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, game.vbo);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    // gl.bindVertexArray(null);

    window.requestAnimationFrame((timestamp) => {
      game.currentTimeStamp = timestamp;
      window.requestAnimationFrame(game.tick);
    });
  },
  tick: function (timestamp) {
    if (game.startTimeStamp === undefined) game.startTimeStamp = timestamp;
    game.lastFrameElapsed = timestamp - game.currentTimeStamp;
    game.currentTimeStamp = timestamp;

    game.tickCount++;
    game.totalElapsed = timestamp - game.startTimeStamp;

    game.draw();
    window.requestAnimationFrame(game.tick);
  },
  draw: function () {
    const gl = canvas.gl;
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(uniformLocations.time, game.totalElapsed * 5 + randomNumber);
    // gl.uniform1f(uniformLocations.time, game.currentTimeStamp);
    gl.uniform1f(uniformLocations.aspectRatio, canvas.width / canvas.height);
    // console.log(canvas.w)

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // canvas.gl.bindVertexArray(null);
  },
  // mouseMove: function (e) {
  //   // const x = e.x;
  //   // const y = e.y;
  // },
};

export default game;
