const mod = require('@clapp/setup/esbuild')

mod.run(null, ['--watch'], {
    change: [(d) => console.warn('change', d)],
    added: [(d) => console.warn('added', d)],
    restart: [(d) => console.warn('restart', d)]
})

// setTimeout(() => {
//     mod.esb.kill(1)
// }, 5000)