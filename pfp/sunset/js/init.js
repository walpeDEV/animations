import canvas from './canvas.js';
import game from './game.js';
import { initWebGL } from './gl-utils.js';

async function setup() {
  canvas.init();
  canvas.resize();

  await initWebGL(canvas.gl);

  game.start();
  window.addEventListener('resize', canvas.resize);
  // window.addEventListener('mousemove', game.mouseMove);
}

Promise.all([
  new Promise((resolve) => window.addEventListener('load', resolve)),
  // document.fonts.load('20px Inter'),
  // document.fonts.load('bold 20px Inter'),
]).then(() => {
  setup();
});
