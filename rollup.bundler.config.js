import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

// CommonJS and ES module builds (for node and bundlers)
export default {
  input: 'src/index.ts',
  external: [
    'body-parser',
    'cors',
    'ejs',
    'express',
    'path'
  ],
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'es' }
  ],
  plugins: [
    typescript(),
    // terser({ 
    //   include: ['*.cjs.min.js', '*.esm.min.js'],
    //   output: { comments: true },
    // }),
  ]
};