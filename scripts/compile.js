/**
 * script to build (transpile) files.
 * By default it transpiles all files for all package and writes them
 * into `lib/` directory.
 * Non-js or files matching IGNORE_PATTERN will be copied without transpiling.
 *
 * Example:
 *  compile package: node ./scripts/compile.js
 *  watch compile: node ./scripts/compile.js --watch
 */
'use strict';

const fs = require('fs');
const path = require('path');

const babel = require('@babel/core');
const chalk = require('chalk');
const glob = require('glob');
const minimatch = require('minimatch');
const parseArgs = require('minimist');
const chokidar = require('chokidar');

const SRC_DIR = 'src';
const JS_FILES_PATTERN = '**/*.js';
const IGNORE_PATTERN = '**/{__tests__,__mocks__}/**';

const args = parseArgs(process.argv);

const getBabelConfig = require('./config/getBabelConfig');

function buildPackage(rootPath, sourceCodeDir, isBuildEs) {
  const pattern = path.resolve(sourceCodeDir, '**/*');
  const files = glob.sync(pattern, {nodir: true});

  files.forEach(file => buildFile(rootPath, file, isBuildEs));
  process.stdout.write(`${chalk.green(`Finished build ${isBuildEs ? 'esm.' : 'cjs.'}`)}\n`);
}

function buildFile(rootPath, file, isBuildEs) {
  const BUILD_DIR = isBuildEs ? 'es' : 'lib';
  const packageBuildPath = path.resolve(rootPath, BUILD_DIR);
  const fileRelativePath = path.relative(path.resolve(rootPath, SRC_DIR), file);
  const destPath = path.resolve(packageBuildPath, fileRelativePath);
  let babelOptions;
  if (isBuildEs) {
    babelOptions = getBabelConfig(true);
  } else {
    babelOptions = getBabelConfig();
  }
  if (!fs.existsSync(packageBuildPath)) {
    fs.mkdirSync(packageBuildPath);
  }
  if (!minimatch(file, IGNORE_PATTERN)) {
    if (!minimatch(file, JS_FILES_PATTERN)) {
      fs.createReadStream(file).pipe(fs.createWriteStream(destPath));
    } else {
      console.log(file);
      const transformed = babel.transformFileSync(file, babelOptions).code;
      fs.writeFileSync(destPath, transformed);
    }
  }
}

module.exports = function compile(isBuildEs) {
  const rootPath = process.cwd();
  const sourceCodeDir = path.resolve(rootPath, SRC_DIR);
  if (args.watch) {
    // watch package
    console.log(chalk.green('watch packages compile...'));

    chokidar.watch(sourceCodeDir, {
      ignored: IGNORE_PATTERN
    }).on('change', () => {
      process.stdout.write(chalk.bold.inverse('Compiling package...\n'));
      try {
        buildPackage(rootPath, sourceCodeDir, isBuildEs);
      } catch (e) {}
      process.stdout.write('\n');
    });
  } else {
    process.stdout.write(chalk.bold.inverse('Compiling package...\n'));
    buildPackage(rootPath, sourceCodeDir, isBuildEs);
    process.stdout.write('\n');
  }
};
