const { renameSync, existsSync, createReadStream, createWriteStream, readFileSync, writeFileSync, unlinkSync, rmdirSync, rmSync } = require('node:fs');
const { exec } = require('node:child_process');
const path = require('node:path')

let index_html_file = 'dist/ui/index.html';
let cx_js_file = '../../../app.dev/lib/clapp.js'

// if (process.argv.length < 3) {
//     console.log('You need to specify the installation location. It needs to be the folder where app.asar is located.');
//     console.log('E.g.:   node index.js /Applications/Crawless.app/Contents/Resources');
//     process.exit(0);
// }

// const appDir = process.argv[2];

module.exports = function run(appPath) {
    const appDir = path.resolve(appPath, 'Contents/Resources')

    if (!existsSync(appDir)) {
        console.log('This directory doesn\'t exist.');
        process.exit(0);
    }

    if (!existsSync(_path('app.asar'))) {
        console.log('This directory doesn\'t contain "app.asar".');
        process.exit(0);
    }

    // Create a backup of the app.asar file if one doesn't already exist.
    if (!existsSync(_path('app.asar.bak'))) {
        console.log('Creating a backup of app.asar because none exists.');
        renameSync(_path('app.asar'), _path('app.asar.bak'));
        // createReadStream(_path('app.asar')).pipe(createWriteStream(_path('app.asar.bak')));
    }

    if (existsSync(_path('app.asar'))) {
        console.log('app.asar already exists. Removing it.')
        if (existsSync(_path('app.asar.old'))) {
            rmSync(_path('app.asar.old'), { recursive: true, force: true });
        }
        renameSync(_path('app.asar'), _path('app.asar.old'));
    }

    // Extract the asar file.
    exec(`asar extract ${_path('app.asar.bak')} ${_path('app.asar')}`, () => {

        let filePath = _path(`app.asar/${index_html_file}`);
        let contents = readFileSync(filePath, 'utf8');

        console.log(`Processing ${index_html_file}...`);
        contents = contents.replace(/<title>Crawless<\/title>/, `<title>(clapp) Crawless<\/title>\n
    <script src="${cx_js_file}"></script>`);
        // contents = contents.replace(/script-src/, "script-src blob: 'unsafe-eval'")
        writeFileSync(filePath, contents);

        rmSync(_path('app.asar.old'), { recursive: true, force: true });

        console.log('Setup finished.')
    });
    function _path(to) {
        return appDir.replace(/\/+$/, '') + '/' + to.replace(/^\/+/, '');
    }
}

