import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.tsx',
  output: [
    { file: 'dist/index.cjs', format: 'cjs', sourcemap: true, exports: 'named' },
    { file: 'dist/index.mjs', format: 'esm', sourcemap: true },
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
