// @clapp/setup v1.0.2
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/inject.ts
var inject_exports = {};
__export(inject_exports, {
  default: () => inject
});
module.exports = __toCommonJS(inject_exports);
var import_node_fs = require("node:fs");
var import_node_child_process = require("node:child_process");
var import_node_path = __toESM(require("node:path"));
function inject(appPath, libFile) {
  return new Promise((resolve, reject) => {
    const resPath = import_node_path.default.resolve(appPath, "Contents/Resources/");
    const index_html_file = import_node_path.default.resolve(
      resPath,
      "app.asar/",
      "dist/ui/index.html"
    );
    const script_src = import_node_path.default.join(resPath, libFile);
    const script_type = "module";
    if (!(0, import_node_fs.existsSync)(resPath)) {
      reject("This directory doesn't exist.");
    }
    if (!(0, import_node_fs.existsSync)(_path("app.asar"))) {
      reject(`This directory doesn't contain "app.asar".`);
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
      let filePath = index_html_file;
      let contents = (0, import_node_fs.readFileSync)(filePath, "utf8");
      console.log(`Processing ${index_html_file}...`);
      contents = contents.replace(
        /<title>Crawless<\/title>/,
        `<title>Crawless (dev)</title>
<script type="${script_type}" src="${script_src}"></script>`
      );
      (0, import_node_fs.writeFileSync)(filePath, contents);
      (0, import_node_fs.rmSync)(_path("app.asar.old"), { recursive: true, force: true });
      console.log("Done", script_src);
      resolve(script_src);
    });
    function _path(to) {
      return resPath.replace(/\/+$/, "") + "/" + to.replace(/^\/+/, "");
    }
  });
}
//# sourceMappingURL=inject.js.map
