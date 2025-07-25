import canvas from './canvas.js';
import { decodeStat, getStatInfo } from './stats.js';

function drawLine(ctx, lineBuffer, x, y, fontHeight, oldColor) {
  const oldTextAlign = ctx.textAlign;

  // TODO: Currently only left align and center align are supported
  const textTotalW = lineBuffer.width;
  let textX = oldTextAlign === 'center' ? x - textTotalW / 2 : x;
  ctx.textAlign = 'left';

  for (const word of lineBuffer.raw) {
    if (word.startsWith('<') && word.endsWith('>')) {
      const meta = lineBuffer.metaInfo.shift();
      if (meta.color !== undefined) {
        if (meta.color === '') ctx.fillStyle = oldColor;
        else ctx.fillStyle = meta.color;
      }
      if (meta.icon) {
        meta.icon(ctx, textX, y, fontHeight);
        textX += meta.iconWidth;
      }
      continue;
    }
    ctx.fillText(word, textX, y);
    textX += ctx.measureText(` ${word}`).width;
  }
  ctx.textAlign = oldTextAlign;
}

function drawText(ctx, text, x, y, fontHeight, lineHeight, w) {
  ctx.textBaseline = 'bottom';
  const ar = text.split(' ');
  let lineBuffer = {
    raw: [],
    width: 0,
    metaInfo: [],
  };

  let lineY = y;
  const spaceWidth = ctx.measureText(' ').width;
  const oldColor = ctx.fillStyle;

  function appendWordToLine(words, wordWidth) {
    if (lineBuffer.raw.length === 0) {
      lineBuffer.raw.push(...words);
      lineBuffer.width = wordWidth;
      return;
    }

    const textWidth = wordWidth + spaceWidth + lineBuffer.width;
    if (textWidth <= w) {
      lineBuffer.width = textWidth;
      lineBuffer.raw.push(...words);
      return;
    }
    drawLine(ctx, lineBuffer, x, lineY, fontHeight, oldColor);
    lineBuffer.raw = words;
    lineBuffer.width = wordWidth;
    lineY += lineHeight;
  }

  for (const word of ar) {
    if (word.startsWith('<') && word.endsWith('>')) {
      const { chunks, metaInfo } = decodeStat(
        ctx,
        word,
        fontHeight,
        spaceWidth,
      );
      lineBuffer.metaInfo.push(...metaInfo);
      for (const chunk of chunks) {
        appendWordToLine(chunk.contents, chunk.width);
      }
      continue;
    }

    const wordWidth = ctx.measureText(word).width;
    appendWordToLine([word], wordWidth);
  }
  drawLine(ctx, lineBuffer, x, lineY, fontHeight, oldColor);
  ctx.fillStyle = oldColor;
}

export default drawText;
