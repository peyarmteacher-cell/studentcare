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
    const absoluteWorkspaceRoot = __dirname;

    const localBundlePlugin = {
      name: 'local-bundle',
      setup(build) {
        // 1. Handle non-relative (external) packages
        build.onResolve({ filter: /^[^.\\/]/ }, args => {
          // If it starts with "@/ ", it is a local alias, not an external package
          if (args.path.startsWith('@/') || path.isAbsolute(args.path) || /^[A-Za-z]:[/\\]/.test(args.path)) {
            return null; // Let the next resolver handle it as local
          }
          return { path: args.path, external: true };
        });

        // 2. Handle absolute paths or relative/alias paths locally
        build.onResolve({ filter: /.*/ }, args => {
          // Resolve the importer's directory
          let importerDir = absoluteWorkspaceRoot;
          if (args.resolveDir) {
            importerDir = args.resolveDir;
          } else if (args.importer) {
            const cleanImporter = args.importer.replace(/^local:/, '');
            if (path.isAbsolute(cleanImporter)) {
              importerDir = path.dirname(cleanImporter);
            }
          }

          // Compute potential absolute paths for this import
          let resolvedPath = args.path;
          if (args.path.startsWith('@/')) {
            resolvedPath = path.resolve(absoluteWorkspaceRoot, args.path.substring(2));
          } else if (args.path.startsWith('.') || args.path.startsWith('..')) {
            resolvedPath = path.resolve(importerDir, args.path);
          } else if (path.isAbsolute(args.path) || /^[A-Za-z]:[/\\]/.test(args.path)) {
            resolvedPath = path.resolve(args.path);
          } else {
            // Fallback for any other path (e.g. entry point)
            resolvedPath = path.resolve(absoluteWorkspaceRoot, args.path);
          }

          // Security & Safety constraint: Don't probe outside workspace to prevent Plesk permission errors
          if (!resolvedPath.toLowerCase().startsWith(absoluteWorkspaceRoot.toLowerCase())) {
            return { path: args.path, external: true };
          }

          // Try file extensions (.ts, .js, .json) or look for a directory index (.ts, .js)
          const extensions = ['', '.ts', '.js', '.json', '/index.ts', '/index.js'];
          let foundFile = null;
          for (const ext of extensions) {
            const testPath = resolvedPath + ext;
            try {
              if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
                foundFile = testPath;
                break;
              }
            } catch (e) {
              // ignore stat errors
            }
          }

          if (foundFile) {
            return {
              path: foundFile,
              namespace: 'local'
            };
          }

          return null; // Let next resolve handlers try
        });

        // 3. Load files from 'local' namespace directly via Node's fs module
        build.onLoad({ filter: /.*/, namespace: 'local' }, args => {
          const contents = fs.readFileSync(args.path, 'utf8');
          const ext = path.extname(args.path);
          let loader = 'ts';
          if (ext === '.json') loader = 'json';
          else if (ext === '.js' || ext === '.mjs' || ext === '.cjs') loader = 'js';
          
          return {
            contents,
            loader,
            resolveDir: path.dirname(args.path)
          };
        });
      }
    };

    const tsconfigSource = fs.readFileSync(path.resolve(__dirname, 'tsconfig.json'), 'utf8');

    await esbuild.build({
      entryPoints: [path.resolve(__dirname, 'server.ts')],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      sourcemap: true,
      tsconfigRaw: tsconfigSource,
      outfile: 'dist/server.cjs',
      absWorkingDir: __dirname,
      logLevel: 'info',
      plugins: [localBundlePlugin]
    });
    console.log('✅ esbuild server packaging succeeded!');
    console.log('🎉 Full programmatic build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

runBuild();
