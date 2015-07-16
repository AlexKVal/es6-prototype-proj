#!/usr/bin/env node
/* eslint "no-var": 0 */
var conventionalChangelog = require('conventional-changelog');

conventionalChangelog({
  preset: 'angular'
})
.pipe(process.stdout);
