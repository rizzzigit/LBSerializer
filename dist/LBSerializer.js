"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFileSync = exports.readFileSync = exports.writeFile = exports.readFile = exports.deserialize = exports.serialize = void 0;
var tslib_1 = require("tslib");
var serializer_1 = require("./core/serializer");
tslib_1.__exportStar(require("./core/static"), exports);
tslib_1.__exportStar(require("./core/options"), exports);
tslib_1.__exportStar(require("./core/serializer"), exports);
exports.serialize = serializer_1.Serializer.serialize.bind(serializer_1.Serializer);
exports.deserialize = serializer_1.Serializer.deserialize.bind(serializer_1.Serializer);
exports.readFile = serializer_1.Serializer.readFile.bind(serializer_1.Serializer);
exports.writeFile = serializer_1.Serializer.writeFile.bind(serializer_1.Serializer);
exports.readFileSync = serializer_1.Serializer.readFileSync.bind(serializer_1.Serializer);
exports.writeFileSync = serializer_1.Serializer.writeFileSync.bind(serializer_1.Serializer);
