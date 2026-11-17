import typescript from '@rollup/plugin-typescript';

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
  ],
};
