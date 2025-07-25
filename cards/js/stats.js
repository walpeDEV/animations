function getStatInfo(stat) {
  switch (stat) {
    case 'int': {
      return {
        value: null,
        name: 'Intelligence',
        color: '#90d5ff',
        iconSpace: 0.8,
        drawIcon: function (ctx, x, y, h) {
          const spaceLeft = -h * 0.2;
          const w = h * 0.8;

          const sX = x + spaceLeft;
          const sY = y - h - h * 0.05;
          const d = h / 15;
          const mX = sX + w / 2;
          const yL1 = sY + h * 0.85;
          const yL2 = sY + h * 0.7;
          const wL1 = h * 0.11;
          const wL2 = h * 0.15;

          const r = h * 0.3;
          const a = Math.acos(wL2 / r);
          const a2 = Math.acos((wL2 - d) / (r - d));
          const circleY = sY + r;
          const yL3 = Math.sin(a) * r + circleY;
          const yL4 = Math.sin(a2) * (r - d) + circleY;

          ctx.strokeStyle = 'white';
          ctx.beginPath();
          ctx.moveTo(mX - wL1, yL1);
          ctx.lineTo(mX + wL1, yL1);
          ctx.lineTo(mX + wL1, yL1 + d);
          ctx.lineTo(mX - wL1, yL1 + d);
          ctx.lineTo(mX - wL1, yL1);

          ctx.moveTo(mX - wL2, yL2);
          ctx.lineTo(mX + wL2, yL2);
          ctx.lineTo(mX + wL2, yL3);
          ctx.arc(mX, circleY, r, a, -a + Math.PI, true);
          ctx.lineTo(mX - wL2, yL2);
          ctx.lineTo(mX - wL2 + d, yL2);
          ctx.lineTo(mX - wL2 + d, yL4);
          ctx.arc(mX, circleY, r - d, -a2 + Math.PI, a2, false);
          ctx.lineTo(mX + wL2 - d, yL2 - d);
          ctx.lineTo(mX - wL2 + d, yL2 - d);
          ctx.lineTo(mX - wL2, yL2);

          ctx.fill();
        },
      };
    }
    default: {
      return {
        value: null,
        name: 'An error occured',
        color: 'red',
        iconSpace: 0,
        drawIcon: null,
      };
    }
  }
}

// <type|stat|value?>
const statTypes = [
  // TODO: Icon placement should be dynamically calucaleted, depending if icon is behind or after value
  [
    { type: 'icon', colored: true },
    { type: 'value', colored: true, optional: true },
    { type: 'name', colored: true },
  ],
  [
    { type: 'icon', colored: true },
    { type: 'value', colored: true, optional: false },
  ],
  [
    { type: 'value', colored: true, optional: false },
    { type: 'icon', colored: true },
  ],
  [
    { type: 'name', colored: false },
    { type: 'string', colored: false, value: 'by' },
    { type: 'icon', colored: true },
    { type: 'value', colored: true, optional: false },
  ],
  [
    { type: 'name', colored: false },
    { type: 'string', colored: false, value: 'by' },
    { type: 'value', colored: true, optional: false },
    { type: 'icon', colored: true },
  ],
  [{ type: 'name', colored: false }],
];

function decodeStat(ctx, word, h, spaceWidth) {
  const s = word.substring(1, word.length - 1);
  const symbolAr = s.split('|');
  const type = Number(symbolAr[0]);
  const stat = symbolAr[1];
  const value = symbolAr[2];

  const statInfo = getStatInfo(stat);

  class Chunk {
    width = 0;
    contents = [];
  }
  const chunks = [];
  let currentChunk = new Chunk();
  function resetCurrentChunk() {
    if (currentChunk.contents.length === 0) return;
    currentChunk.width += (currentChunk.contents.length - 1) * spaceWidth;
    chunks.push(currentChunk);
    currentChunk = new Chunk();
  }

  const metaInfo = [];
  let colored = false;
  for (const element of statTypes[type]) {
    if (element.type == 'value') {
      if (element.optional && value == undefined) continue;
      if (!element.optional && value == undefined)
        throw new Error(
          'Error when trying to parse stat: Value has to be defined',
        );
    }
    if (colored !== element.colored) {
      colored = element.colored;
      currentChunk.contents.push('<c>');
      metaInfo.push({ color: colored ? statInfo.color : '' });
    }

    if (element.type == 'icon') {
      const iconWidth = statInfo.iconSpace * h;
      currentChunk.width += iconWidth;
      currentChunk.contents.push('<i>');
      metaInfo.push({ icon: statInfo.drawIcon, iconWidth });
    } else if (element.type == 'string') {
      resetCurrentChunk();
      const words = element.value.split(' ');
      for (const word of words) {
        currentChunk.width += ctx.measureText(word).width;
        currentChunk.contents.push(word);
        resetCurrentChunk();
      }
    } else if (element.type == 'name') {
      const name = statInfo.name;
      const words = name.split(' ');
      for (const word of words) {
        currentChunk.width += ctx.measureText(word).width;
        currentChunk.contents.push(word);
        resetCurrentChunk();
      }
    } else if (element.type == 'value') {
      currentChunk.width += ctx.measureText(value).width;
      currentChunk.contents.push(value);
    }
  }
  if (colored) {
    currentChunk.contents.push('<c>');
    metaInfo.push({ color: '' });
  }
  resetCurrentChunk();

  return {
    chunks,
    metaInfo,
  };
}

export { getStatInfo, decodeStat };
