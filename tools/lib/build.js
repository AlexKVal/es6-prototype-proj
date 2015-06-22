import 'colors';
import fsp from 'fs-promise';
import { exec } from '../exec';
import { libRoot } from '../constants';

export default function BuildCommonJs() {
  console.log('Building: '.cyan + 'npm module'.green);

  return exec(`rimraf ${libRoot}`)
    .then(() => fsp.mkdirs(libRoot))
    .then(() => exec('babel src --out-dir lib'))
    .then(() => console.log('Built: '.cyan + 'npm module'.green));
}
