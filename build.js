import { build as viteBuild } from 'vite';
import react from '@vitejs/plugin-react';
import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runBuild() {
  console.log('🚀 Starting programmatic build to bypass IIS/Plesk permission restrictions...');

  try {
    console.log('📦 1. Building frontend assets with Vite...');
    await viteBuild({
      configFile: false, // Important: completely bypasses reading and bundling of vite.config.js
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
      },
      server: {
        hmr: false,
        watch: null,
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true,
      },
    });
    console.log('✅ Vite frontend build succeeded!');

    console.log('⚙️ 2. Bundling backend with esbuild...');
    await esbuild.build({
      entryPoints: ['server.ts'],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      // Explicitly mark all external dependencies from package.json to prevent recursive lookups in parent folders
      external: [
        'express', 
        'mysql2', 
        'sqlite3', 
        '@google/genai', 
        'dotenv',
        'path',
        'fs',
        'url',
        'http'
      ],
      sourcemap: true,
      tsconfig: 'tsconfig.json',
      outfile: 'dist/server.cjs',
      absWorkingDir: process.cwd(),
      logLevel: 'info',
    });
    console.log('✅ esbuild server packaging succeeded!');
    console.log('🎉 Full programmatic build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

runBuild();
