import 'colors';
import bower from './amd/build';
import lib from './lib/build';
import dist from './dist/build';
import { copy } from './fs-utils';
import { distRoot, bowerRoot } from './constants';

export default function Build(verbose) {
  return Promise.all([
      lib(),
      bower(),
      dist()
    ])
    .then(() => copy(distRoot, bowerRoot));
}
