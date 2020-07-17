import typescript from 'rollup-plugin-typescript2';
import * as basis from './rollup.bundler.config';

basis.default.input = 'test/src/index.ts';
basis.default.output[0].file += '.test.js';
basis.default.output[1].file += '.test.js';
basis.default.plugins = [
  typescript({
    include: ['src/**/*.ts', 'test/src/**/*.ts'],
  }),
];

export default basis.default;