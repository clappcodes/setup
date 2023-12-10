import * as esbuild from 'esbuild'
import path from 'node:path'
import pkg from './package.json' assert { type: "json" }
import * as fs from 'node:fs'

const arg = process.argv[2]

console.log(`\n${pkg.name} v${pkg.version}\n`)

/**
 * @type {esbuild.Plugin}
 */
const envPlugin = {
    name: 'env',
    setup(build) {
        // Intercept import paths called "env" so esbuild doesn't attempt
        // to map them to a file system location. Tag them with the "env-ns"
        // namespace to reserve them for this plugin.
        build.onResolve({ filter: /^env$/ }, args => ({
            path: args.path,
            namespace: 'env-ns',
        }))

        // Load paths tagged with the "env-ns" namespace and behave as if
        // they point to a JSON file containing the environment variables.
        build.onLoad({ filter: /.*/, namespace: 'env-ns' }, () => ({
            contents: JSON.stringify(process.env),
            loader: 'json',
        }))
    },
}

/**
 * @type {esbuild.Plugin}
 */
const myPlugin = {
    name: 'myPlugin',
    setup(build) {
        const files = {}
        build.onEnd(result => {
            const changed = []
            // console.log('[onEnd][result]', result)
            for (let out of result.outputFiles) {
                if (files[out.path] !== out.hash) {
                    files[out.path] = out.hash
                    fs.writeFileSync(out.path, out.contents)
                    const resolvedPath = require.resolve(out.path)
                    console.log(`[onEnd][changed]`, out.path, out.hash, resolvedPath)
                }
            }
            console.log(`[onEnd]`, `build ended with ${result.errors.length} errors`)
        })
    },
}

const ctx = await esbuild.context(/** @type {esbuild.CommonOptions} */({
    preserveSymlinks: true,
    entryPoints: ["./src/*.ts"],
    // bundle: true,
    //external: ["esbuild"],
    format: 'cjs',
    sourcemap: false, //'inline',
    outdir: './lib',
    platform: 'node',
    logLevel: "debug",
    plugins: [myPlugin, envPlugin],
    write: false,
    banner: {
        js: `// ${pkg.name} v${pkg.version}`
    },
    define: {
        CLAPP_SRC_PATH: `"${path.resolve(process.env.PWD, '../')}"`
    }
}))

if (arg === '--watch') {
    await ctx.watch()
    console.log('Watching...')
} else {
    const start = Date.now()
    await ctx.rebuild()
    const took = Date.now() - start
    console.log(`Build done in ${took}ms`)
    await ctx.dispose()
}