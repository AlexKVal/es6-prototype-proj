import _ from 'lodash';
import baseConfig, { options } from './base.config';

export default _.extend({}, baseConfig, {
  entry: {
    'es6-prototype-proj': './src/index.js'
  },

  output: {
    path: './dist',
    filename: options.optimizeMinimize ? '[name].min.js' : '[name].js',
    library: 'Es6PrototypeProj',
    libraryTarget: 'umd'
  }
});
