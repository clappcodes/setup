// @playground/vscode v1.0.0
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var import_node_child_process = require("node:child_process");
var import_esbuild = __toESM(require("esbuild"));
var import_node_path = __toESM(require("node:path"));
var import_node_fs = __toESM(require("node:fs"));
var import_node_events = require("node:events");
if (process.send) {
  const xxx = 2;
  const arg = process.argv[2];
  const cwd = process.argv[3] || process.cwd();
  const pkgPath = require.resolve(import_node_path.default.resolve(cwd, "package.json"));
  const pkg = require(`${pkgPath}`);
  const send = (event, data) => process.send ? process.send({ event, data }) : console.log(`[${event}]`, data);
  const myPlugin = {
    name: "myPlugin",
    setup(build) {
      const files = {};
      build.onResolve({ filter: /\/esbuild/ }, (args) => {
        const wp = import_node_path.default.resolve(__dirname, "../", args.path);
        return {
          // watchFiles: [wp],
          path: wp
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
            const absOutDir2 = import_node_path.default.parse(out.path).dir;
            if (!import_node_fs.default.existsSync(absOutDir2))
              import_node_fs.default.mkdirSync(absOutDir2, { recursive: true });
            if (isESBuild)
              import_node_fs.default.writeFileSync(
                out.path = require.resolve("@clapp/setup/esbuild"),
                out.contents
              );
            else
              import_node_fs.default.writeFileSync(out.path, out.contents);
            if (isESBuild && !isFirstBuild) {
              send("restart", { path: out.path });
              break;
            }
            if (isFirstBuild) {
              added.push({ path: out.path });
            } else {
              changed.push({
                path: out.path
              });
            }
          }
        }
        if (added.length) {
          send("added", added);
        } else if (changed.length) {
          send("change", changed);
        } else {
          send("result", result);
        }
      });
    }
  };
  const ep = ["./src/*.ts", "./src/**/*.ts"];
  if (!import_node_fs.default.existsSync(import_node_path.default.resolve(cwd, "./src/esbuild.ts")))
    ep.push("./src/esbuild.ts");
  const options = {
    entryPoints: ep,
    format: "cjs",
    absWorkingDir: cwd,
    //path.resolve(__dirname, "../"),
    sourcemap: false,
    //'inline',
    outdir: "./lib",
    platform: "node",
    logLevel: "info",
    plugins: [myPlugin],
    write: false,
    color: true,
    banner: {
      js: `// ${pkg.name} v${pkg.version}`
    }
  };
  const absOutDir = import_node_path.default.resolve(options.absWorkingDir, options.outdir);
  if (!import_node_fs.default.existsSync(absOutDir))
    import_node_fs.default.mkdirSync(absOutDir);
  console.log(
    `
${pkg.name} v${pkg.version} ${arg} ${cwd} ${process.pid} - ((${xxx}))
`
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
  let ctx;
  async function init() {
    ctx = await import_esbuild.default.context(options);
    if (arg === "--watch") {
      await ctx.watch();
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
  let run = function(cwd, args, _ev) {
    if (_ev) {
      myEmitter._events = _ev;
    }
    const resolvedPath = require.resolve(__filename);
    delete require.cache[resolvedPath];
    esb = myEmitter.child = (0, import_node_child_process.fork)(resolvedPath, args, {
      cwd: cwd || process.cwd(),
      stdio: ["pipe", "pipe", "pipe", "ipc"]
    });
    myEmitter.emit("start", { pid: esb.pid, filePath: resolvedPath });
    esb.stdout.on("data", (data) => {
      console.log(`${data}`);
    });
    esb.stderr.on("data", (data) => {
      console.warn(`${data}`);
    });
    esb.on(
      "message",
      ({ event, data }) => {
        switch (event) {
          case "restart":
            esb._restart = true;
            esb.kill(1);
            console.clear();
            console.log(
              `- [proccess]`,
              esb.pid,
              `closed ${esb.exitCode} ${esb.signalCode}`
            );
            delete require.cache[__filename];
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
      myEmitter.emit("close", { code, signal });
    });
    esb.on("error", (msg) => {
      console.log("on.error", msg);
    });
    return esb;
  };
  const myEmitter = new import_node_events.EventEmitter();
  let esb;
  const pids = {
    get value() {
      return JSON.parse(localStorage.getItem("_pids") || "{}");
    },
    set value(value) {
      const newval = Object.assign({}, this.value, value);
      console.log("newvals", newval);
      localStorage.setItem("_pids", JSON.stringify(newval));
    }
  };
  myEmitter.run = run;
  Object.defineProperty(myEmitter, "proccess", {
    get: () => esb,
    configurable: true,
    enumerable: true
  });
  module.exports = myEmitter;
}
