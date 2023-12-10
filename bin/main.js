#!/usr/bin/env node

const setup = require('../')
const path = require("path")
const fs = require('fs')
const pkg = require('../package.json')
const { execSync } = require('node:child_process')

const resolvemodFile = (modFile) => {
    try {
        return require.resolve(modFile, { paths: [process.cwd()] })
    } catch (e) {
        return false
    }
}
const command = process.argv[2]// || 'setup';
const appPath = process.argv[3] && path.resolve(process.argv[3])// || '/Applications/Crawless.app');
const modName = process.argv[4]// || '@clapp/init'
const modFile = resolvemodFile(modName)
const devPath = path.resolve(process.argv[5] || './');
const resPath = appPath && path.resolve(appPath, 'Contents/Resources')

console.log(`${pkg.name} v${pkg.version} (${process.cwd()})`);

if (command === 'build') {
    return require('@clapp/setup/esbuild').run(null, ['--watch'])
}

if (command !== 'setup') {
    console.log('- Usage')
    console.log('\n', `   clapp setup /Applications/Crawless.app @clapp/init .`, '\n');
    process.exit(0);
}

if (!appPath || !fs.existsSync(appPath)) {
    console.log(appPath
        ? '! Application not found'
        : '- Specify the app installation location');
    console.log('\n', `   clapp ${command} [${appPath || "/Applications/Crawless.app"}]`, '\n');
    process.exit(0);
}

if (!modName || !modFile) {
    console.log(modName
        ? '! Module not found'
        : '- Specify module to be injected');
    console.log('\n', `   clapp ${command} ${appPath} [${modName || "./mymodule.js"}]`);
    process.exit(0);
}

if (devPath && !fs.existsSync(devPath)) {
    console.log(devPath
        ? '! Workflow dev path does not exists'
        : '- Specify the workflow working directory');
    console.log('\n', `   clapp ${command} ${appPath} [${devPath || "./"}]`);
    process.exit(0);
}

// const extFile = path.resolve(__dirname, "../ext.js")

// const modFile = path.join(resPath, 'node_modules')
// const clappPath = path.resolve(__dirname, "../../")
// const clappLinkPath = path.resolve(modFile, path.parse(clappPath).name)
// const devLinkPath = path.resolve(resPath, 'dev')

// // ensure node_module exists before naking symlinks
// fs.mkdirSync(modFile, { recursive: true })
// // link @clapp/* to Resources/node_modules
// if (!fs.existsSync(clappLinkPath))
//     fs.symlinkSync(clappPath, clappLinkPath, 'dir')
// // link [devPath] to Resources/dev
// if (!fs.existsSync(devLinkPath))
//     fs.symlinkSync(devPath, devLinkPath, 'dir')

// const devPaths = [devPath, devLinkPath]
// const clappPaths = [clappPath, clappLinkPath]

const appName = path.basename(appPath, '.app')
console.log({ appName, appPath, modName, modFile, devPath, resPath })

const runCmd = (cmd) => { try { return String(execSync(cmd)) } catch (e) { return; } }
const killApp = () => runCmd(`pkill -nx ${appName}`)
const getPid = () => runCmd(`pgrep -nx ${appName}`)

console.log(`- Quiting ${appName}`)

const ki = setInterval(() => {
    if (getPid())
        killApp()
    else
        clearInterval(ki)
}, 100)

console.log(`- App Closed`)

console.log('- Injecting module:' + modFile)

setup
    .inject(appPath, modFile, { appName, appPath, modName, modFile, devPath, resPath })
    .then(res => {
        console.log('- Done', res)
        runCmd(`open ${appPath}`)
    })
    .catch(e => {
        console.error(`! Error`, e)
    })