/**
 * script to build (transpile) files.
 * By default it transpiles all files for all packages and writes them
 * into `lib/` directory.
 * Non-js or files matching IGNORE_PATTERN will be copied without transpiling.
 *
 * Example:
 *  compile package: node ./scripts/compile-packages.js
 *  watch compile: node ./scripts/compile-packages.js --watch
 */
'use strict';

const compile = require('./compile');

compile();
compile(true);
