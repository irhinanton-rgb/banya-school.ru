import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const indexPath = path.join(distDir, 'index.html');
const assetsDir = path.join(distDir, 'assets');

if (fs.existsSync(indexPath) && fs.existsSync(assetsDir)) {
  let html = fs.readFileSync(indexPath, 'utf-8');
  const files = fs.readdirSync(assetsDir);

  // 1. Inline CSS
  const cssFiles = files.filter(f => f.endsWith('.css'));
  for (const cssFile of cssFiles) {
    const cssPath = path.join(assetsDir, cssFile);
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    html = html.replace(
      new RegExp(`<link[^>]*href=["\'][^"\']*${cssFile}["\'][^>]*>`, 'g'),
      `<style>\n${cssContent}\n</style>`
    );
  }

  // 2. Inline JS
  const jsFiles = files.filter(f => f.endsWith('.js'));
  for (const jsFile of jsFiles) {
    const jsPath = path.join(assetsDir, jsFile);
    const jsContent = fs.readFileSync(jsPath, 'utf-8');
    html = html.replace(
      new RegExp(`<script[^>]*src=["\'][^"\']*${jsFile}["\'][^>]*>\\s*</script>`, 'g'),
      `<script type="module">\n${jsContent}\n</script>`
    );
  }

  // Also remove modulepreload links since everything is inlined
  html = html.replace(/<link[^>]*rel=["\']modulepreload["\'][^>]*>/g, '');

  fs.writeFileSync(indexPath, html, 'utf-8');
  console.log('Successfully inlined CSS and JS into dist/index.html!');
  console.log('Resulting index.html size:', Buffer.byteLength(html, 'utf-8'), 'bytes');
} else {
  console.warn('dist folder or assets folder not found');
}
