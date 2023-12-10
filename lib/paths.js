/// @clapp/setup v1.0.3
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
var paths_exports = {};
__export(paths_exports, {
  symlink: () => symlink
});
module.exports = __toCommonJS(paths_exports);
var fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
function symlink(appPath, libPath = "app.dev/lib") {
  if (!fs.existsSync(appPath)) {
    throw new Error(`!App not found at: ${appPath}`);
  }
  const target = CLAPP_SRC_PATH;
  const parsed = import_path.default.parse(target);
  const dest = import_path.default.resolve(appPath, "Contents/Resources/", libPath);
  const linkPath = import_path.default.resolve(dest, parsed.name);
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  if (!fs.existsSync(linkPath)) {
    fs.symlinkSync(target, linkPath, "dir");
  }
  const isDirectory = fs.statSync(linkPath).isDirectory();
  return { target, linkPath, isDirectory };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  symlink
});
