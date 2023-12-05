import * as esbuild from 'esbuild'
import path from 'path'
import pkg from './package.json' assert { type: "json" }

const arg = process.argv[2]
const exports = Object.values(pkg.exports)
    .map(file => file.replace('lib/', 'src/').replace(path.extname(file), '.ts'))

console.log(`\n${pkg.name} v${pkg.version}\n`)

const options = {
    entryPoints: exports,
    bundle: true,
    sourcemap: true,
    outdir: './lib',
    platform: 'node',
    external: ["esbuild"],
    logLevel: "debug",
    banner: {
        js: `// ${pkg.name} v${pkg.version}`
    },
    define: {
        CLAPP_SRC_PATH: `"${path.resolve(process.env.PWD, '../')}"`
    }
}

const ctx = await esbuild.context(options)

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