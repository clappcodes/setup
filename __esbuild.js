if (process.send) {
    const esbuild = require("esbuild");
    const path = require("node:path");
    const fs = require("node:fs");
    const xxx = 38;

    const arg = process.argv[2];
    const cwd = process.argv[3] || process.cwd();

    const pkgPath = require.resolve(path.resolve(cwd, 'package.json'))
    const pkg = require(pkgPath);
    const send = (event, data) => process.send ? process.send({ event, data }) : console.log(`[${event}]`, data)

    /** @type {esbuild.Plugin} */
    const myPlugin = {
        name: "myPlugin",
        setup(build) {
            const files = {};
            // Redirect all paths starting with "images/" to "./public/images/"
            build.onResolve({ filter: /\/esbuild\.js/ }, args => {
                const absPath = require.resolve('@clapp/setup/esbuild')
                // console.log('onResolve', absPath, args)
                return {
                    path: absPath //path.join(args.resolveDir, 'public', args.path) 
                }
            })
            build.onEnd(async (result) => {
                const changed = [];
                const added = []
                for (let out of result.outputFiles) {
                    if (files[out.path] !== out.hash) {
                        const isFirstBuild = typeof files[out.path] === "undefined";
                        const isESBuild = out.path.endsWith('/esbuild.js')
                        files[out.path] = out.hash;

                        if (isESBuild && !isFirstBuild) {
                            send('restart')
                            restart = true;
                            break;
                        }
                        if (!isESBuild) {
                            fs.writeFileSync(out.path, out.contents);
                            if (isFirstBuild) {
                                added.push({ path: out.path })
                            } else {
                                changed.push({
                                    path: out.path
                                })
                            }
                        }

                    }
                }

                if (added.length) {
                    send("added", added)
                } else if (changed.length) {
                    send("change", changed);
                }
                // console.log(`[onEnd]`, `build ended with ${result.errors.length} errors`);
            });
        },
    };


    /** @type {import('esbuild').CommonOptions} */
    const options = {
        entryPoints: ["./src/*.ts", "./src/esbuild.js"],
        format: "cjs",
        absWorkingDir: cwd, //path.resolve(__dirname, "../"),
        sourcemap: false, //'inline',
        outdir: "./lib",
        platform: "node",
        logLevel: "info",
        plugins: [myPlugin],
        write: false,
        banner: {
            js: `/// ${pkg.name} v${pkg.version}`,
        }
    }

    const absOutDir = path.resolve(options.absWorkingDir, options.outdir)
    if (!fs.existsSync(absOutDir))
        fs.mkdirSync(absOutDir)

    console.log(`\n${pkg.name} v${pkg.version} ${arg} ${cwd} ${process.pid} - ((${xxx}))\n`);

    process.on("message", (msg) => {
        console.log("esb.on.message", msg);
    });

    process.on("exit", (msg) => {
        console.log("esb.on.exit", msg);
    });

    process.on("close", (msg) => {
        console.log("esb.on.close", msg);
    });

    /** @type {esbuild.BuildContext<typeof options>} */
    let ctx;

    async function init() {
        ctx = await esbuild.context(options);

        if (arg === "--watch") {
            await ctx.watch();
            // console.log("Watching...");
        } else {
            const start = Date.now();
            await ctx.rebuild();
            const took = Date.now() - start;
            console.log(`Build done (${took}ms)`);
            await ctx.dispose();
            process.exit(1)
        }
    }

    init();

} else {
    const { fork, ChildProcess } = require('node:child_process')
    /** @type {ChildProcess} */
    let esb
    function run(cwd, ...args) {
        console.clear()

        const resolvedPath = require.resolve(__filename);
        delete require.cache[resolvedPath];

        esb = fork(__filename, args, {
            cwd: cwd || process.cwd()
        })

        console.log('PID', esb.pid);

        esb.on("message", ({ event, data }) => {
            switch (event) {
                case 'restart':
                    esb._restart = true;
                    esb.kill(1);
                    break;
                case 'added':
                    console.log('[added]', data.map(c => c.path))
                    break;
                case 'change':
                    console.log('[change]', data.map(c => c.path))
                    break;
            }
        })

        esb.on('close', (code, signal) => {
            if (esb._restart) {
                console.log('- Restarting...')
                setTimeout(() => run(cwd, ...args))
            } else {
                console.log(`Child process closed ${code} ${signal}`);
            }
        });

        esb.on("error", (msg) => {
            console.log('on.error', msg)
        })

        return esb
    }

    // if (module.filename !== __filename) {
    //     const [_, __, cwd, ...args] = process.argv
    //     run(cwd, ...args)
    // }

    module.exports = {
        run,
        get esb() {
            return esb
        }
    }
}