import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ensure the dist directory exists
if (fs.existsSync('lib')) {
  fs.rmSync('lib', { recursive: true });
}
fs.mkdirSync('lib');

// Create temporary tsconfig for CJS
const tsconfigCJS = {
  extends: './tsconfig.json',
  compilerOptions: {
    module: 'CommonJS',
    moduleResolution: 'node',
    outDir: 'lib',
    rootDir: 'src',
    declarationMap: false,
    sourceMap: false,
  },
  include: ['src/**/*'],
  exclude: ['node_modules', 'lib', 'test']
};
fs.writeFileSync('tsconfig.cjs.json', JSON.stringify(tsconfigCJS, null, 2));

// Create temporary tsconfig for ESM
const tsconfigESM = {
  extends: './tsconfig.json',
  compilerOptions: {
    module: 'ESNext',
    moduleResolution: 'node',
    outDir: 'lib',
    rootDir: 'src',
    declarationMap: false,
    sourceMap: false,
  },
  include: ['src/**/*'],
  exclude: ['node_modules', 'lib', 'test']
};
fs.writeFileSync('tsconfig.esm.json', JSON.stringify(tsconfigESM, null, 2));

try {
  // Build ESM and rename to .mjs
  // eslint-disable-next-line no-undef
  console.log('Building ESM...');
  execSync('tsc -p tsconfig.esm.json', { stdio: 'inherit' });
  // Rename ESM files to .mjs
  const files = fs.readdirSync('lib');
  files.forEach(file => {
    if (file.endsWith('.js')) {
      // Skip files that are already processed by CJS build
      const mjsPath = path.join('lib', file.replace(/\.js$/, '.mjs'));
      const jsPath = path.join('lib', file);
      if (!fs.existsSync(mjsPath)) {
        fs.renameSync(jsPath, mjsPath);
      }
    }
  });
  // Build CommonJS
  // eslint-disable-next-line no-undef
  console.log('Building CommonJS...');
  execSync('tsc -p tsconfig.cjs.json', { stdio: 'inherit' });

  // eslint-disable-next-line no-undef
  console.log('Build completed successfully!');
} finally {
  // Cleanup temporary config files
  fs.unlinkSync('tsconfig.cjs.json');
  fs.unlinkSync('tsconfig.esm.json');
}
