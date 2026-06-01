import { build as viteBuild } from 'vite';
import react from '@vitejs/plugin-react';
import esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';
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
    const preventParentLookupPlugin = {
      name: 'prevent-parent-lookup',
      setup(build) {
        // Prevent esbuild from scanning parent directories recursively looking for package.json or node_modules
        build.onResolve({ filter: /^[^.\\/]/ }, args => {
          return { path: args.path, external: true };
        });
      }
    };

    const serverSource = fs.readFileSync(path.resolve(__dirname, 'server.ts'), 'utf8');
    const tsconfigSource = fs.readFileSync(path.resolve(__dirname, 'tsconfig.json'), 'utf8');

    await esbuild.build({
      stdin: {
        contents: serverSource,
        resolveDir: __dirname,
        sourcefile: 'server.ts',
        loader: 'ts',
      },
      bundle: true,
      platform: 'node',
      format: 'cjs',
      sourcemap: true,
      tsconfigRaw: tsconfigSource,
      outfile: 'dist/server.cjs',
      absWorkingDir: __dirname,
      logLevel: 'info',
      plugins: [preventParentLookupPlugin]
    });
    console.log('✅ esbuild server packaging succeeded!');
    console.log('🎉 Full programmatic build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

runBuild();
