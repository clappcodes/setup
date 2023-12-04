#!/usr/bin/env node

const packageJSON = require('../package.json')
const lib = require('../lib')

if (process.argv.length < 3) {
    console.log('You need to specify the installation location. It needs to be the folder where app.asar is located.');
    console.log('E.g.:   node index.js /Applications/Crawless.app/Contents/Resources');
    process.exit(0);
}

const appPath = process.argv[2];

console.log(appPath)

lib(appPath)
