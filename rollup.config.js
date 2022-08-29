import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: './es/index.mjs',
        format: 'es',
      },
      {
        file: './lib/index.js',
        format: 'cjs',
      },
    ],
    plugins: [typescript({ exclude: ['test'] })],
  },
  {
    input: './src/index.ts',
    output: [
      {
        file: './dist/eiya.js',
        format: 'umd',
        exports: 'named',
        name: 'Eiya',
      },
    ],
    plugins: [typescript({ exclude: ['test'], compilerOptions: { target: 'es6' } })],
  },
  {
    input: './src/index.ts',
    output: {
      file: './typings/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
