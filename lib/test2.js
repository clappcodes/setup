/// @clapp/setup v1.0.3
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var test2_exports = {};
__export(test2_exports, {
  id: () => id,
  test: () => import_test.id
});
module.exports = __toCommonJS(test2_exports);
var import_test = require("./test");
const id = { test2: "test2sdd", test: import_test.id };
console.log({ test: import_test.id, id });
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  id,
  test
});
