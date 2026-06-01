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
    const preventParentLookupPlugin = {
      name: 'prevent-parent-lookup',
      setup(build) {
        // Prevent esbuild from scanning parent directories recursively looking for package.json or node_modules
        build.onResolve({ filter: /^[^./\\]/ }, args => {
          // If the path is absolute (e.g. Windows driver path D:\... or absolute /...), do not mark it external
          if (path.isAbsolute(args.path) || /^[A-Za-z]:[/\\]/.test(args.path)) {
            return null; // Let esbuild handle it
          }
          return { path: args.path, external: true };
        });
      }
    };

    await esbuild.build({
      entryPoints: [path.resolve(__dirname, 'server.ts')],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      sourcemap: true,
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      outfile: 'dist/server.cjs',
      absWorkingDir: process.cwd(),
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
