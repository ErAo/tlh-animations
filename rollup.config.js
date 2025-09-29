import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [
  // ES Module build
  {
    input: 'animations.js',
    output: {
      file: 'dist/tlh-animations.es.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      nodeResolve()
    ]
  },
  // UMD build
  {
    input: 'animations.js',
    output: {
      file: 'dist/tlh-animations.umd.js',
      format: 'umd',
      name: 'TLH',
      sourcemap: true
    },
    plugins: [
      nodeResolve()
    ]
  },
  // CommonJS build
  {
    input: 'animations.js',
    output: {
      file: 'dist/tlh-animations.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [
      nodeResolve()
    ]
  },
  // Minified UMD build
  {
    input: 'animations.js',
    output: {
      file: 'dist/tlh-animations.umd.min.js',
      format: 'umd',
      name: 'TLH',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      terser()
    ]
  }
];