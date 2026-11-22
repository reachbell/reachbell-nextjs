import typescript from '@rollup/plugin-typescript';
import { copyFileSync } from 'node:fs';

/**
 * One declaration file per module condition (same content), so TypeScript
 * with node16/nodenext doesn't treat the CJS entry as ESM-typed.
 */
const perConditionTypes = () => ({
  name: 'per-condition-types',
  writeBundle: { sequential: true, order: 'post', handler() {
    for (const name of ['index', 'server']) {
      copyFileSync(`dist/${name}.d.ts`, `dist/${name}.d.mts`);
      copyFileSync(`dist/${name}.d.ts`, `dist/${name}.d.cts`);
    }
  } },
});

const clientBanner = (chunk) => (chunk.name === 'index' ? '"use client";' : '');

export default {
  input: { index: 'src/index.tsx', server: 'src/server.ts' },
  output: [
    { dir: 'dist', entryFileNames: '[name].cjs', chunkFileNames: '[name]-[hash].cjs', format: 'cjs', sourcemap: true, exports: 'named', banner: clientBanner },
    { dir: 'dist', entryFileNames: '[name].mjs', chunkFileNames: '[name]-[hash].mjs', format: 'esm', sourcemap: true, banner: clientBanner },
  ],
  external: [
    'react',
    'react/jsx-runtime',
    'next/script',
    '@reachbell/sdk',
    '@reachbell/react',
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src',
      sourceMap: true,
    }),
    perConditionTypes(),
  ],
};
