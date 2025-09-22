import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const outputDir = path.join(process.cwd(), 'public/meta-img');

async function generateOgImage({ title, slug, relativeUrl }) {
  const imagePath = path.join(outputDir, `${slug}.png`);

  try {
    await fs.access(imagePath);
    console.log(`Image already exists for ${slug}, skipping generation.`);
    return;
  } catch (error) {
    // Image does not exist, so we generate it.
  }

  const width = 1200;
  const height = 630;
  const padding = 60;

  const logoPath = path.join(process.cwd(), 'src/images/theme/alok-logo.png');
  const fontPath = path.join(process.cwd(), 'node_modules/@fontsource/zilla-slab/files/zilla-slab-latin-400-normal.woff');

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#1a1a1a;" />
          <stop offset="100%" style="stop-color:#000000;" />
        </linearGradient>
        <style>
          .title {
            font-family: 'Zilla Slab';
            font-size: 64px;
            fill: #ffffff;
            text-anchor: start;
          }
          .url {
            font-family: 'Zilla Slab';
            font-size: 24px;
            fill: #dddddd;
            text-anchor: end;
          }
        </style>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#gradient)" />
      <foreignObject x="${padding}" y="${padding}" width="${width - 2 * padding}" height="${height - 2 * padding}">
        <body xmlns="http://www.w3.org/1999/xhtml">
          <div style="font-family: 'Zilla Slab'; font-size: 64px; color: #ffffff; word-wrap: break-word;">
            ${title}
          </div>
        </body>
      </foreignObject>
      <text x="${width - padding}" y="${height - padding}" class="url">${relativeUrl}</text>
    </svg>
  `;

  const logo = await sharp(logoPath).resize(192).toBuffer();

  await fs.mkdir(outputDir, { recursive: true });

  await sharp(Buffer.from(svg), {
    path: fontPath,
  })
    .composite([
      {
        input: logo,
        left: padding,
        top: height - padding - (await sharp(logo).metadata()).height,
      },
    ])
    .png()
    .toFile(imagePath);
}

export default generateOgImage;
