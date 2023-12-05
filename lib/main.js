// @clapp/setup v1.0.1
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

// src/main.ts
var import_node_fs = require("node:fs");
var import_node_child_process = require("node:child_process");
var import_node_path = __toESM(require("node:path"));
var index_html_file = "dist/ui/index.html";
var cx_js_file = "../../../app.dev/lib/ext.js";
console.log(module.paths);
module.exports = function run(appPath) {
  const appDir = import_node_path.default.resolve(appPath, "Contents/Resources");
  if (!(0, import_node_fs.existsSync)(appDir)) {
    console.log("This directory doesn't exist.");
    process.exit(0);
  }
  if (!(0, import_node_fs.existsSync)(_path("app.asar"))) {
    console.log(`This directory doesn't contain "app.asar".`);
    process.exit(0);
  }
  if (!(0, import_node_fs.existsSync)(_path("app.asar.bak"))) {
    console.log("Creating a backup of app.asar because none exists.");
    (0, import_node_fs.renameSync)(_path("app.asar"), _path("app.asar.bak"));
  }
  if ((0, import_node_fs.existsSync)(_path("app.asar"))) {
    console.log("app.asar already exists. Removing it.");
    if ((0, import_node_fs.existsSync)(_path("app.asar.old"))) {
      (0, import_node_fs.rmSync)(_path("app.asar.old"), { recursive: true, force: true });
    }
    (0, import_node_fs.renameSync)(_path("app.asar"), _path("app.asar.old"));
  }
  (0, import_node_child_process.exec)(`asar extract ${_path("app.asar.bak")} ${_path("app.asar")}`, () => {
    let filePath = _path(`app.asar/${index_html_file}`);
    let contents = (0, import_node_fs.readFileSync)(filePath, "utf8");
    console.log(`Processing ${index_html_file}...`);
    contents = contents.replace(
      /<title>Crawless<\/title>/,
      `<title>(clapp) Crawless</title>

    <script src="${cx_js_file}"></script>`
    );
    (0, import_node_fs.writeFileSync)(filePath, contents);
    (0, import_node_fs.rmSync)(_path("app.asar.old"), { recursive: true, force: true });
    console.log("Done", filePath);
  });
  function _path(to) {
    return appDir.replace(/\/+$/, "") + "/" + to.replace(/^\/+/, "");
  }
};
//# sourceMappingURL=main.js.map
