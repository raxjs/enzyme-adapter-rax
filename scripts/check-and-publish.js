/**
 * Scripts to check unpublished version and run publish
 */
const { existsSync, readdirSync, readFileSync } = require('fs');
const { join } = require('path');
const { spawnSync } = require('child_process');
const axios = require('axios');
const semver = require('semver');

function checkVersion(callback) {
  console.log('[PUBLISH] Start check...');
  let ret;

  const packageInfoPath = join(process.cwd(), 'package.json');
  if (existsSync(packageInfoPath)) {
    const packageInfo = JSON.parse(readFileSync(packageInfoPath));
    checkVersionExists(packageInfo.name, packageInfo.version).then(
      exists => {
        if (!exists) {
          ret = {
            name: packageInfo.name,
            local: packageInfo.version,
          };
        }

        callback(ret);
      },
    );
  }
}

function checkVersionExists(pkg, version) {
  return axios(
    `http://registry.npmjs.com/${encodeURIComponent(pkg)}/${encodeURIComponent(
      version,
    )}`,
    { timeout: 2000 },
  )
    .then(res => res.status === 200)
    .catch(err => false);
}

function publish(pkg, version, tag) {
  console.log('[PUBLISH]', `${pkg}@${version}`);
  const rootDir = process.cwd();
  // npm run build
  spawnSync('npm', [
    'run',
    'build',
  ], {
    stdio: 'inherit',
    cwd: rootDir,
  });

  // npm publish
  spawnSync('npm', [
    'publish',
    '--tag=' + tag,
    // use default registry
  ], {
    stdio: 'inherit',
    cwd: rootDir,
  });
}

function isPrerelease(v) {
  const semVer = semver.parse(v);
  if (semVer === null) return false;
  return semVer.prerelease.length > 0;
}

function checkVersionAndPublish() {
  checkVersion(ret => {
    console.log('');
    if (!ret) {
      console.log('[PUBLISH] No diff with the package.');
    } else {
      console.log('[PUBLISH] Will publish following package:');
      const { name, local } = ret;
      const tag = isPrerelease(local) ? 'beta' : 'latest';
      console.log(`--- ${name}@${local} current tag: ${tag} ---`);
      publish(name, local, tag);
    }
  });
}

checkVersionAndPublish();
