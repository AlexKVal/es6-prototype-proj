/* eslint no-process-exit: 0 */

import 'colors';
import build from './build';
import { setExecOptions } from './exec';

import yargs from 'yargs';

const argv = yargs
  .option('verbose', {
    demand: false,
    default: false,
    describe: 'Increased debug output'
  })
  .option('dev', {
    demand: false,
    default: false,
    describe: 'Only used when supplied with the --docs-only flag'
  })
  .argv;

setExecOptions(argv);

build()
  .catch(err => {
    if (err.stack) {
      console.error(err.stack.red);
    } else {
      console.error(err.toString().red);
    }
    process.exit(1);
  });
