const fs = require('fs');
const path = require('path');

/**
 * Copies the entire dist directory into common ISPmanager / cPanel / Apache domain subdirectories.
 * This guarantees that FTP-Deploy-Action deploys the build into the actual web document root,
 * regardless of whether the FTP user was configured to start in:
 * - /var/www/<user>/data/ (root has www/banya-school.ru/)
 * - /var/www/<user>/data/www/ (root has banya-school.ru/)
 * - /var/www/<user>/data/www/banya-school.ru/ (root is ./)
 * - public_html/
 */
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip the target mirror subdirectories and heavy media already on the server
    if (['www', 'banya-school.ru', 'public_html'].includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const distDir = path.resolve(__dirname, '..', 'dist');

if (fs.existsSync(distDir)) {
  console.log('🔄 Mirroring dist/ build to www/banya-school.ru virtual host path...');

  const mirrorTargets = [
    path.join(distDir, 'www', 'banya-school.ru'),
  ];

  for (const target of mirrorTargets) {
    try {
      copyDirRecursive(distDir, target);
      console.log(`  ✓ Mirrored to: ${path.relative(distDir, target)}/`);
    } catch (err) {
      console.warn(`  ⚠️ Warning mirroring to ${target}:`, err.message);
    }
  }

  console.log('✅ Build mirroring complete! Fast sync enabled.');
} else {
  console.error('❌ dist/ does not exist. Run vite build first.');
}
