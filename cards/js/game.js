import canvas from './canvas.js';
import Card from './card.js';

let cardResizingState = true;

const game = {
  tickCount: 0,
  objects: {
    cards: [],
  },
  lastFrameElapsed: undefined,
  currentTimeStamp: undefined,
  startTimeStamp: undefined,
  currentTimeStamp: undefined,
  totalElapsed: undefined,
  start: function () {
    const w = canvas.width;
    const h = canvas.height;

    const createCards = 3;
    const space = 100;
    const cardW = 400;
    const cardH = 600;
    let x = w - createCards * cardW - (createCards - 1) * space;
    x /= 2;
    const y = (h - cardH) / 2;
    for (let i = 0; i < createCards; i++) {
      this.objects.cards[i] = new Card(
        x,
        y,
        cardW,
        cardH,
        'walpe',
        'Increases <4|int|+20> while coding.',
      );
      x += space + cardW;
    }

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
    canvas.gl.clear(canvas.gl.COLOR_BUFFER_BIT);
    canvas.ctxText.clearRect(0, 0, canvas.width, canvas.height);

    canvas.gl.bindVertexArray(Card.vao);
    for (const card of this.objects.cards) {
      const time = 500;
      if (game.totalElapsed <= time) {
        const progress = game.totalElapsed / time;
        const k = 5;

        let eased;
        if (progress < 0.5) {
          eased =
            (0.5 * (Math.exp(k * (2 * progress)) - 1)) / (Math.exp(k) - 1);
        } else {
          eased =
            1 -
            (0.5 * (Math.exp(k * (2 * (1 - progress))) - 1)) /
              (Math.exp(k) - 1);
        }

        const w = eased * 400;
        const h = eased * 600;
        card.resizeAroundMid(w, h);
      } else if (cardResizingState) {
        cardResizingState = false;

        const w = 400;
        const h = 600;
        card.resizeAroundMid(w, h);
      }
      card.draw();
    }
    canvas.gl.bindVertexArray(null);
  },
  mouseMove: function (e) {
    const x = e.x;
    const y = e.y;
    for (const card of game.objects.cards) {
      card.mouseMove(x, y);
    }
  },
};

export default game;
