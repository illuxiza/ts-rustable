import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ensure the dist directory exists
if (fs.existsSync('lib')) {
  fs.rmSync('lib', { recursive: true });
}
fs.mkdirSync('lib');

// First, generate .d.ts files with comments
const tsconfigDTS = {
  extends: './tsconfig.json',
  compilerOptions: {
    module: 'ESNext',
    moduleResolution: 'node',
    outDir: 'lib',
    rootDir: 'src',
    emitDeclarationOnly: true,
  },
  include: ['src/**/*'],
  exclude: ['node_modules', 'lib', 'test']
};
fs.writeFileSync('tsconfig.dts.json', JSON.stringify(tsconfigDTS, null, 2));

// Create temporary tsconfig for CJS
const tsconfigCJS = {
  extends: './tsconfig.json',
  compilerOptions: {
    module: 'CommonJS',
    moduleResolution: 'node',
    outDir: 'lib',
    rootDir: 'src',
    declaration: false,
    declarationMap: false,
    removeComments: true,
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
    declaration: false,
    declarationMap: false,
    removeComments: true,
  },
  include: ['src/**/*'],
  exclude: ['node_modules', 'lib', 'test']
};
fs.writeFileSync('tsconfig.esm.json', JSON.stringify(tsconfigESM, null, 2));

try {
  // Generate .d.ts files with comments
  console.log('Generating .d.ts files...');
  execSync('tsc -p tsconfig.dts.json', { stdio: 'inherit' });

  // Build ESM and rename to .mjs
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
  console.log('Building CommonJS...');
  execSync('tsc -p tsconfig.cjs.json', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} finally {
  // Cleanup temporary config files
  fs.unlinkSync('tsconfig.cjs.json');
  fs.unlinkSync('tsconfig.esm.json');
  fs.unlinkSync('tsconfig.dts.json');
}
