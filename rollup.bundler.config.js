import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

// CommonJS and ES module builds
export default {
  input: 'src/index.ts',
  external: ['body-parser', 'cors', 'ejs', 'express', 'fs', 'jws', 'path'],
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'es' },
  ],
  plugins: [typescript()],
};
