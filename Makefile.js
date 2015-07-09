/* globals cat, config, cp, ls, popd, pushd, rm, target, exec, exit */
/* eslint curly: 0 */
import 'colors';
import 'shelljs/make';
import path from 'path';
import semver from 'semver';

// do not die on errors
config.fatal = false;

// constants
const bowerRepo = 'git@github.com:alexkval/es6-prototype-proj-bower.git';
const tmpBowerRepo = path.join(__dirname, 'tmp-bower-repo');
const bowerRoot = path.join(__dirname, 'amd/');

const packagePath = path.join(__dirname, 'package.json');
const changelog = path.join(__dirname, 'CHANGELOG.md');
const license = path.join(__dirname, 'LICENSE');

const clOptions = {};
function parseArgs(argsArray) {
  if (!argsArray) return;

  clOptions.dryRun = argsArray.includes('-n') || argsArray.includes('--dry-run');
  clOptions.verbose = argsArray.includes('-v') || argsArray.includes('--verbose');

  if (clOptions.dryRun) console.log('DRY RUN'.magenta);
}

function printErrorAndExit(error) {
  console.error(error.red);
  exit(1);
}

function run(command) {
  const { code, output } = exec(command, {silent: !clOptions.verbose});
  if (code !== 0) printErrorAndExit(output);
  return output;
}

function safeRun(command) {
  if (clOptions.dryRun) {
    console.log(`[${command}]`.grey, 'DRY RUN'.magenta);
  } else {
    return run(command);
  }
}

function gitTagAndPush(vVersion) {
  safeRun(`changelog --title ${vVersion} -s | git tag -a -F - ${vVersion}`);
  safeRun('git push');
  safeRun('git push --tags');
}

function release(releaseType, preid) {
  if (releaseType === undefined) printErrorAndExit('Must specify version bump type');

  // ensure git repo has no pending changes
  if (exec('git diff-index --name-only HEAD --').output.length) {
    printErrorAndExit('Git repository must be clean');
  }
  console.info('No pending changes'.cyan);

  // ensure git repo last version is fetched
  if (/\[behind (.*)\]/.test(exec('git fetch').output)) {
    printErrorAndExit(`Your repo is behind by ${RegExp.$1} commits`);
  }
  console.info('Current with latest changes from remote'.cyan);

  // check linting
  // console.log('Running: '.cyan + 'eslint'.green);
  // run('npm run lint');
  // console.log('Completed: '.cyan + 'eslint'.green);

  // check tests
  // console.log('Running: '.cyan + 'tests'.green);
  // run('karma start --single-run');
  // run('npm run test-only');
  // console.log('Completed: '.cyan + 'tests'.green);

  // version bump
  const npmjson = JSON.parse(cat(packagePath));
  const oldVersion = npmjson.version;
  let newVersion;

  if (['major', 'minor', 'patch'].includes(releaseType)) {
    newVersion = semver.inc(oldVersion, releaseType);
  } else {
    newVersion = releaseType;
  }

  if (preid) {
    newVersion = semver.inc(newVersion, 'pre', preid);
  }

  npmjson.version = newVersion;
  `${JSON.stringify(npmjson, null, 2)}\n`.to(packagePath);

  console.log('Version changed from '.cyan + oldVersion.green + ' to '.cyan + newVersion.green);
  safeRun(`git add ${packagePath}`);

  // npm run build
  console.log('Running: '.cyan + 'build'.green);
  // const res = exec('npm run build', {silent: !clOptions.verbose});
  // if (res.code !== 0) {
  //   // revert and exit
  //   console.log('Build failed, reverting version bump'.red);
  //   run('git reset HEAD .');
  //   run('git checkout package.json');
  //   console.log('Version bump reverted'.red);
  //   printErrorAndExit(res.output);
  // }
  console.log('Completed: '.cyan + 'build'.green);

  // generate changelog
  const vVersion = `v${newVersion}`;

  run(`changelog --title ${vVersion} --out ${changelog}`);
  safeRun(`git add ${changelog}`);
  safeRun(`git commit -m "Release ${vVersion}"`);
  console.log('Generated Changelog'.cyan);

  // tag and release
  console.log('Tagging: '.cyan + vVersion.green);
  gitTagAndPush(vVersion);
  console.log('Tagged: '.cyan + vVersion.green);

  // npm
  // console.log('Releasing: '.cyan + 'npm package'.green);
  // safeRun('npm publish');
  // console.log('Released: '.cyan + 'npm package'.green);

  // bower
  // console.log('Releasing: '.cyan + 'bower package'.green);
  // rm('-rf', tmpBowerRepo);
  // run(`git clone ${bowerRepo} ${tmpBowerRepo}`);
  // pushd(tmpBowerRepo);
  // rm('-rf', ls(tmpBowerRepo).filter(file => file !== '.git')); // delete all but `.git` dir
  // cp('-R', bowerRoot, tmpBowerRepo);
  // cp(license, tmpBowerRepo);
  // safeRun('git add -A .');
  // safeRun(`git commit -m "Release ${vVersion}"`);
  // gitTagAndPush(vVersion);
  // popd();
  // if (clOptions.dryRun) {
  //   console.log(`[rm -rf ${tmpBowerRepo}]`.grey, 'DRY RUN'.magenta);
  // } else {
  //   rm('-rf', tmpBowerRepo);
  // }
  // console.log('Released: '.cyan + 'bower package'.green);

  console.log('Version '.cyan + `v${newVersion}`.green + ' released!'.cyan);
}

target.patch = (argsArray) => {
  parseArgs(argsArray);
  release('patch');
};

target.minor = (argsArray) => {
  parseArgs(argsArray);
  release('minor');
};

target.major = (argsArray) => {
  parseArgs(argsArray);
  release('major');
};

// target.alpha = (argsArray) => {
//   parseArgs(argsArray);
//   release('patch', 'alpha');
// };

target.all = () => {
  console.log(`
Usage: babel-node Makefile.js patch|minor|major -- [-n|--dry-run] [-v|--verbose]

  babel-node Makefile.js minor => Release with minor version bump
  babel-node Makefile.js major => Release with major version bump
  babel-node Makefile.js major -- -n    => Release dry run with patch version bump
  babel-node Makefile.js patch -- -n -v => Release dry run with verbose output
  `);
};
