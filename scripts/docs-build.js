/* globals cat, cp, mkdir, rm, test */
/* eslint curly: 0 */
import 'colors';
import 'shelljs/global';
import path from 'path';
import _ from 'lodash';

const repoRoot = path.resolve(__dirname, '../');
const docsFolder = path.join(repoRoot, 'docs');
const docsRoot = path.join(repoRoot, 'docs-built');
const docsTemplate = path.join(docsFolder, 'index.template.html');
const license = path.join(repoRoot, 'LICENSE');
const readme = path.join(repoRoot, 'README.md');

console.log('Creating: '.cyan + 'docs'.green);

rm('-rf', docsRoot);
mkdir('-p', docsRoot);

const pkg = JSON.parse(cat(path.join(repoRoot, 'package.json')));
const template = _.template(cat(docsTemplate));
const docsIndex = template({ pkg });
docsIndex.to(path.join(docsRoot, 'index.html'));

cp(readme, docsRoot);
if (test('-e', license)) cp(license, docsRoot);

console.log('Created: '.cyan + 'docs'.green);
