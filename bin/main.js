#!/usr/bin/env node

const setup = require('../')
const path = require("path")

if (process.argv.length < 3) {
    console.log('You need to specify the installation location. It needs to be the folder where app.asar is located.');
    console.log('E.g.:   clapp-setup /Applications/Crawless.app');
    process.exit(0);
}

const appPath = process.argv[2];
const libPath = "app.dev/lib/";
const libFile = path.join(libPath, "@clapp/ext.js")

console.log('Injecting js lib...')

// const res = setup.paths.symlink(appPath, libPath)
// console.log("Symlink created", res);

setup
    .inject(appPath, libFile)
    .then(res => {
        console.log('Js lib path', res)
    }).then(() => {
        const res = setup.paths.symlink(appPath, libPath)
        console.log("Symlink created", res);
    }).catch(e => {
        console.error(`[Error]`, e)
    })