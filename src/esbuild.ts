import { fork, ChildProcess } from "node:child_process";
import esbuild from "esbuild";
import path from "node:path";
import fs from "node:fs";
import { EventEmitter } from "node:events";

if (process.send) {
	const xxx = 2;

	const arg = process.argv[2];
	const cwd = process.argv[3] || process.cwd();

	const pkgPath = require.resolve(path.resolve(cwd, "package.json"));
	const pkg = require(`${pkgPath}`);
	const send = (event: string, data?: object) =>
		process.send
			? process.send({ event, data })
			: console.log(`[${event}]`, data);

	/** @type {esbuild.Plugin} */
	const myPlugin: esbuild.Plugin = {
		name: "myPlugin",
		setup(build) {
			const files = {};
			build.onResolve({ filter: /\/esbuild/ }, (args) => {
				// const absPsath = require.resolve("@clapp/setup/esbuild");
				const wp = path.resolve(__dirname, "../", args.path);
				// console.log("----onResolves esbuild", wp, __dirname);
				return {
					// watchFiles: [wp],
					path: wp,
				};
			});
			build.onEnd(async (result) => {
				const changed = [];
				const added = [];
				for (let out of result.outputFiles) {
					if (files[out.path] !== out.hash) {
						const isFirstBuild = typeof files[out.path] === "undefined";
						const isESBuild = out.path.endsWith("/esbuild.js");
						files[out.path] = out.hash;
						const absOutDir = path.parse(out.path).dir;
						if (!fs.existsSync(absOutDir))
							fs.mkdirSync(absOutDir, { recursive: true });

						if (isESBuild)
							fs.writeFileSync(
								(out.path = require.resolve("@clapp/setup/esbuild")),
								out.contents
							);
						else fs.writeFileSync(out.path, out.contents);

						if (isESBuild && !isFirstBuild) {
							send("restart", { path: out.path });
							break;
						}
						// if (!isESBuild) {
						if (isFirstBuild) {
							added.push({ path: out.path });
						} else {
							changed.push({
								path: out.path,
							});
						}
						// }
					}
				}

				if (added.length) {
					send("added", added);
				} else if (changed.length) {
					send("change", changed);
				} else {
					send("result", result);
				}
				// console.log(`[onEnd]`, `build ended with ${result.errors.length} errors`);
			});
		},
	};

	const ep = ["./src/*.ts", "./src/**/*.ts"];
	if (!fs.existsSync(path.resolve(cwd, "./src/esbuild.ts")))
		ep.push("./src/esbuild.ts");
	// console.log("ep", ep);
	const options: esbuild.BuildOptions = {
		entryPoints: ep,
		format: "cjs",
		absWorkingDir: cwd, //path.resolve(__dirname, "../"),
		sourcemap: false, //'inline',
		outdir: "./lib",

		platform: "node",
		logLevel: "info",
		plugins: [myPlugin],
		write: false,
		color: true,
		banner: {
			js: `// ${pkg.name} v${pkg.version}`,
		},
	};

	const absOutDir = path.resolve(options.absWorkingDir, options.outdir);
	if (!fs.existsSync(absOutDir)) fs.mkdirSync(absOutDir);

	console.log(
		`\n${pkg.name} v${pkg.version} ${arg} ${cwd} ${process.pid} - ((${xxx}))\n`
	);

	process.on("message", (msg) => {
		console.log("esb.on.message", msg);
	});

	process.on("exit", (msg) => {
		console.log("esb.on.exit", msg);
		ctx.dispose();
	});

	process.on("close", (msg) => {
		console.log("esb.on.closes", msg);
		ctx.dispose();
	});

	let ctx: esbuild.BuildContext<esbuild.BuildOptions>;

	async function init() {
		ctx = await esbuild.context(options);

		if (arg === "--watch") {
			await ctx.watch();
			// const srv = await ctx.serve({});
			// send("serve", srv);
			// console.log("Watching...");
		} else {
			const start = Date.now();
			await ctx.rebuild();
			const took = Date.now() - start;
			console.log(`Build done (${took}ms)`);
			await ctx.dispose();
			process.exit(1);
		}
	}

	init();
} else {
	const myEmitter = new EventEmitter();
	// myEmitter.on("newListener", (s) => console.log("newLis", s));

	let esb: ChildProcess;
	// @ts-ignore

	const pids = {
		get value() {
			return JSON.parse(localStorage.getItem("_pids") || "{}");
		},
		set value(value) {
			const newval = Object.assign({}, this.value, value);
			console.log("newvals", newval);
			localStorage.setItem("_pids", JSON.stringify(newval));
		},
	};

	function run(cwd, args, _ev) {
		if (_ev) {
			// @ts-ignore
			myEmitter._events = _ev;
		}
		// console.clear();
		// console.log(myEmitter._events);

		const resolvedPath = require.resolve(__filename);
		delete require.cache[resolvedPath];
		// console.log("resolvedPath", resolvedPath);
		// @ts-ignore
		esb = myEmitter.child = fork(resolvedPath, args, {
			cwd: cwd || process.cwd(),
			stdio: ["pipe", "pipe", "pipe", "ipc"],
		});

		myEmitter.emit("start", { pid: esb.pid, filePath: resolvedPath });

		// console.log("[PID]", esb.pid);

		esb.stdout.on("data", (data) => {
			console.log(`${data}`);
		});
		esb.stderr.on("data", (data) => {
			console.warn(`${data}`);
		});
		esb.on(
			"message",
			({ event, data }: { event: string; data: [{ path: string }] }) => {
				switch (event) {
					case "restart":
						// @ts-ignore
						esb._restart = true;
						esb.kill(1);
						console.clear();
						console.log(
							`- [proccess]`,
							esb.pid,
							`closed ${esb.exitCode} ${esb.signalCode}`
						);
						delete require.cache[__filename];
						// @ts-ignore
						esb = require(__filename).run(cwd, args, myEmitter._events);
						console.log(`+ [proccess]`, esb.pid, `created!`);
						myEmitter.emit("restart", data);
						break;
					case "added":
						myEmitter.emit("added", data);
						break;
					case "change":
						myEmitter.emit("change", data);
						break;
					case "serve":
						myEmitter.emit("serve", data);
						break;
				}
			}
		);

		esb.on("close", (code, signal) => {
			// @ts-ignore
			myEmitter.emit("close", { code, signal });
		});

		esb.on("error", (msg) => {
			console.log("on.error", msg);
		});

		return esb;
	}

	// if (module.filename !== __filename) {
	//     const [_, __, cwd, ...args] = process.argv
	//     run(cwd, ...args)
	// }
	// @ts-ignore
	myEmitter.run = run;
	// @ts-ignore
	Object.defineProperty(myEmitter, "proccess", {
		get: () => esb,
		configurable: true,
		enumerable: true,
	});
	module.exports = myEmitter;
}
