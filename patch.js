const fs = require('fs');

let content = fs.readFileSync('src/lib/logoSvg.js', 'utf-8');

const target1 = `const SVG_CARD_WIDTH = 340;`;
const import1 = `import {
  BRAND_WATERMARK_SRC,
  BRAND_WATERMARK_TILE_SIZE,
  BRAND_WATERMARK_PATTERN_GAP,
  BRAND_WATERMARK_ROTATION,
  BRAND_WATERMARK_OPACITY,
} from './watermarkConfig';

const SVG_CARD_WIDTH = 340;`;

const target2 = `  return [
    \`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 \${SVG_CARD_WIDTH} \${SVG_CARD_HEIGHT}" preserveAspectRatio="xMidYMid meet">\`,
    \`<rect x="0" y="0" width="\${SVG_CARD_WIDTH}" height="\${SVG_CARD_HEIGHT}" rx="28" fill="\${escapeXml(backgroundColor)}" />\`,
    iconMarkup,
    nameMarkup,
    sloganMarkup,
    '</svg>',
  ].join('');
};`;

const replace2 = `  const wmId = 'wm-' + Math.random().toString(36).slice(2, 9);
  const patternSize = BRAND_WATERMARK_TILE_SIZE + BRAND_WATERMARK_PATTERN_GAP;
  const watermarkMarkup = [
    '<defs>',
    \`<pattern id="\${wmId}" width="\${patternSize}" height="\${patternSize}" patternUnits="userSpaceOnUse" patternTransform="rotate(\${BRAND_WATERMARK_ROTATION})">\`,
    \`<image href="\${escapeXml(BRAND_WATERMARK_SRC)}" x="\${BRAND_WATERMARK_PATTERN_GAP / 2}" y="\${BRAND_WATERMARK_PATTERN_GAP / 2}" width="\${BRAND_WATERMARK_TILE_SIZE}" height="\${BRAND_WATERMARK_TILE_SIZE}" />\`,
    '</pattern>',
    '</defs>',
    \`<rect x="0" y="0" width="\${SVG_CARD_WIDTH}" height="\${SVG_CARD_HEIGHT}" fill="url(#\${wmId})" opacity="\${BRAND_WATERMARK_OPACITY}" />\`
  ].join('');

  return [
    \`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 \${SVG_CARD_WIDTH} \${SVG_CARD_HEIGHT}" preserveAspectRatio="xMidYMid meet">\`,
    \`<rect x="0" y="0" width="\${SVG_CARD_WIDTH}" height="\${SVG_CARD_HEIGHT}" rx="28" fill="\${escapeXml(backgroundColor)}" />\`,
    watermarkMarkup,
    iconMarkup,
    nameMarkup,
    sloganMarkup,
    '</svg>',
  ].join('');
};`;

content = content.replace(target1, import1);
content = content.replace(target2, replace2);

fs.writeFileSync('src/lib/logoSvg.js', content, 'utf-8');
console.log('Script ran successfully');
