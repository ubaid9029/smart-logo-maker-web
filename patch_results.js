const fs = require('fs');

let content = fs.readFileSync('src/app/results/page.jsx', 'utf-8');

const target = `                <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
                  <div
                    className="absolute"
                    style={{
                      ...BRAND_WATERMARK_PATTERN_STYLE,
                      inset: BRAND_WATERMARK_OVERLAY_INSET,
                      opacity: BRAND_WATERMARK_OPACITY,
                      transform: \`rotate(\${BRAND_WATERMARK_ROTATION}deg) scale(\${BRAND_WATERMARK_OVERLAY_SCALE})\`,
                    }}
                  />
                </div>`;

content = content.replace(target, '');

fs.writeFileSync('src/app/results/page.jsx', content, 'utf-8');
console.log('Results page updated.');
