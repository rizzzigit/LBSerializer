"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serializer = void 0;
var tslib_1 = require("tslib");
var fs_1 = tslib_1.__importDefault(require("fs"));
var static_1 = require("./static");
var Serializer = /** @class */ (function () {
    function Serializer(options) {
        this.options = tslib_1.__assign({ randomBytesSize: 4 }, options);
    }
    Object.defineProperty(Serializer, "serializer", {
        get: function () {
            return this._serializer || (this._serializer = new Serializer());
        },
        enumerable: false,
        configurable: true
    });
    Serializer.serialize = function (input) {
        return this.serializer.serialize(input);
    };
    Serializer.deserialize = function (input) {
        return this.serializer.deserialize(input);
    };
    Serializer.readFile = function (path) {
        return this.serializer.readFile(path);
    };
    Serializer.writeFile = function (path, data) {
        return this.serializer.writeFile(path, data);
    };
    Serializer.readFileSync = function (path) {
        return this.serializer.readFileSync(path);
    };
    Serializer.writeFileSync = function (path, data) {
        return this.serializer.writeFileSync(path, data);
    };
    Serializer.prototype.readFile = function (path) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.deserialize;
                        return [4 /*yield*/, fs_1.default.promises.readFile(path)];
                    case 1: return [2 /*return*/, _a.apply(this, [_b.sent()])];
                }
            });
        });
    };
    Serializer.prototype.writeFile = function (path, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.default.promises.writeFile(path, this.serialize(data))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Serializer.prototype.readFileSync = function (path) {
        return this.deserialize(fs_1.default.readFileSync(path));
    };
    Serializer.prototype.writeFileSync = function (path, data) {
        return fs_1.default.writeFileSync(path, this.serialize(data));
    };
    Serializer.prototype.serialize = function (input) {
        var _a;
        try {
            JSON.stringify(input);
        }
        catch (error) {
            if ((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('Converting circular structure to JSON')) {
                throw new Error('Circular structure cannot be converted to LB');
            }
        }
        return Buffer.concat(this._serialize(input));
    };
    Serializer.prototype._serialize = function (input) {
        var sink = [];
        var pushType = function () {
            var intArray = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                intArray[_i] = arguments[_i];
            }
            sink.push(Buffer.from(intArray));
        };
        var pushHex = function (hex) {
            sink.push(Buffer.from(hex, 'hex'));
        };
        var pushString = function (string) {
            sink.push(Buffer.from(string, 'utf-8'));
        };
        var pushLength = function (buffer) {
            var lengthBuffer = Buffer.from((function (hex) { return hex.length % 2 ? "0".concat(hex) : "".concat(hex); })("".concat(buffer.length.toString(16))), 'hex');
            if (lengthBuffer.length > 255) {
                throw Object.assign(new Error('Length buffer length too long'), { buffer: buffer });
            }
            sink.push(Buffer.concat([Buffer.from([lengthBuffer.length]), lengthBuffer]));
        };
        if (typeof (input) === 'bigint') {
            var hex = input.toString(16);
            if (input === BigInt(0)) {
                pushType(static_1.Types.ZeroBigInteger);
            }
            else if (!hex.indexOf('-')) {
                pushType(static_1.Types.NegativeBigInteger);
                pushHex((function (hex) { return hex.length % 2 ? "0".concat(hex) : hex; })(hex.slice(1)));
            }
            else {
                pushType(static_1.Types.PositiveBigInteger);
                pushHex(hex.length % 2 ? "0".concat(hex) : hex);
            }
        }
        else if (typeof (input) === 'number') {
            var hex = input.toString(16);
            if (input === 0) {
                pushType(static_1.Types.ZeroNumber);
            }
            else if ((hex.indexOf('.') > -1) && (!hex.indexOf('-'))) {
                pushType(static_1.Types.NegativeFloat);
                sink.push.apply(sink, this._serialize(-input).slice(1));
            }
            else if (hex.indexOf('.') > -1) {
                var _a = "".concat(input).split('.').map(function (num) { return Number(num); }), real = _a[0], decimal = _a[1];
                var realBuffer = Buffer.from((function (realHex) { return realHex.length % 2 ? "0".concat(realHex) : realHex; })(real.toString(16)), 'hex');
                var decimalBuffer = Buffer.from((function (decimalHex) { return decimalHex.length % 2 ? "0".concat(decimalHex) : decimalHex; })(decimal.toString(16)), 'hex');
                pushType(static_1.Types.PositiveFloat);
                pushLength(realBuffer);
                sink.push(realBuffer);
                pushLength(decimalBuffer);
                sink.push(decimalBuffer);
            }
            else if (!hex.indexOf('-')) {
                pushType(static_1.Types.NegativeNumber);
                pushHex((function (hex) { return hex.length % 2 ? "0".concat(hex) : hex; })(hex.slice(1)));
            }
            else {
                pushType(static_1.Types.PositiveNumber);
                pushHex(hex.length % 2 ? "0".concat(hex) : hex);
            }
        }
        else if (typeof (input) === 'boolean') {
            pushType(input ? static_1.Types.TrueBoolean : static_1.Types.FalseBoolean);
        }
        else if (typeof (input) === 'string') {
            if (input.length) {
                pushType(static_1.Types.String);
                pushString(input);
            }
            else {
                pushType(static_1.Types.EmptyString);
            }
        }
        else if (['undefined', 'function'].includes(typeof (input))) {
            pushType(static_1.Types.Undefined);
        }
        else if (typeof (input) === 'object') {
            if (input instanceof URL) {
                pushType(static_1.Types.URL);
                sink.push(Buffer.from(input.href, 'utf-8'));
            }
            else if (input instanceof Error) {
                pushType(static_1.Types.Error);
                sink.push.apply(sink, this._serialize((function () {
                    var error = tslib_1.__assign(tslib_1.__assign({}, input), { name: input.name, message: input.message, stack: input.stack });
                    if (input.cause != null) {
                        error.cause = input.cause;
                    }
                    return error;
                })()).slice(1));
            }
            else if (input instanceof Date) {
                pushType(static_1.Types.Date);
                pushHex((function (hex) {
                    if (hex.length % 2) {
                        hex = "0".concat(hex);
                    }
                    return hex;
                })(input.getTime().toString(16)));
            }
            else if (Array.isArray(input)) {
                if (input.length === 1) {
                    pushType(static_1.Types.SingleEntryArray);
                    sink.push.apply(sink, this._serialize(input[0]));
                }
                else if (input.length) {
                    pushType(static_1.Types.Array);
                    for (var _i = 0, input_1 = input; _i < input_1.length; _i++) {
                        var inputEntry = input_1[_i];
                        var buffer = this.serialize(inputEntry);
                        pushLength(buffer);
                        sink.push(buffer);
                    }
                }
                else {
                    pushType(static_1.Types.EmptyArray);
                }
            }
            else if (input == null) {
                pushType(static_1.Types.Null);
            }
            else if (Buffer.isBuffer(input) ||
                (input instanceof Int8Array) ||
                (input instanceof Int16Array) ||
                (input instanceof Int32Array) ||
                (input instanceof BigInt64Array) ||
                (input instanceof BigUint64Array) ||
                (input instanceof Uint8Array) ||
                (input instanceof Uint16Array) ||
                (input instanceof Uint32Array)) {
                var inputBuffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
                if (inputBuffer.length) {
                    pushType(static_1.Types.Buffer);
                    sink.push(inputBuffer);
                }
                else {
                    pushType(static_1.Types.EmptyBuffer);
                }
            }
            else {
                var inputObj = (function (input) {
                    var newObject = {};
                    for (var inputKey in input) {
                        if ((input[inputKey] === undefined) ||
                            (typeof (input[inputKey]) === 'function')) {
                            continue;
                        }
                        newObject[inputKey] = input[inputKey];
                    }
                    return newObject;
                })(tslib_1.__assign({}, input));
                if (!inputObj) {
                    pushType(static_1.Types.Undefined);
                }
                else if (Object.keys(inputObj).length === 1) {
                    pushType(static_1.Types.SingleEntryObject);
                    for (var inputObjKey in inputObj) {
                        sink.push(this.serialize([inputObjKey, inputObj[inputObjKey]]).slice(1));
                    }
                }
                else if (Object.keys(inputObj).length) {
                    pushType(static_1.Types.Object);
                    for (var inputObjKey in inputObj) {
                        var keyBuffer = Buffer.concat([Buffer.from([0]), Buffer.from(inputObjKey, 'utf-8')]);
                        var valueBuffer = Buffer.concat([Buffer.from([1]), this.serialize(inputObj[inputObjKey])]);
                        pushLength(keyBuffer);
                        sink.push(keyBuffer);
                        pushLength(valueBuffer);
                        sink.push(valueBuffer);
                    }
                }
                else {
                    pushType(static_1.Types.EmptyObject);
                }
            }
        }
        return sink;
    };
    Serializer.prototype.deserialize = function (input) {
        var _this = this;
        var sink = input;
        var strip = function (stripLength, offset, bufferLength) {
            if (offset === void 0) { offset = 0; }
            if (bufferLength === void 0) { bufferLength = stripLength - offset; }
            var buffer = sink.slice(0, stripLength);
            sink = sink.slice(stripLength);
            return buffer.slice(offset, bufferLength > 0 ? offset + bufferLength : stripLength + bufferLength);
        };
        var stripByLength = function () {
            var sizeBufferLength = strip(1)[0];
            var sizeBuffer = strip(sizeBufferLength);
            if (sizeBufferLength !== sizeBuffer.length) {
                throw new Error("Incorrect size buffer length: Got ".concat(sizeBuffer.length, " instead of ").concat(sizeBufferLength));
            }
            var size = Number.parseInt(sizeBuffer.toString('hex') || '0', 16);
            var buffer = strip(size);
            if (size !== buffer.length) {
                throw new Error("Incorrect data buffer length: Got ".concat(buffer.length, " instead of ").concat(size));
            }
            return buffer;
        };
        var type = strip(1)[0];
        switch (type) {
            case static_1.Types.ZeroNumber: return 0;
            case static_1.Types.PositiveNumber:
            case static_1.Types.NegativeNumber: return (function () {
                var result = Number.parseInt(sink.toString('hex'), 16);
                return type === static_1.Types.NegativeNumber ? -result : result;
            })();
            case static_1.Types.ZeroBigInteger: return BigInt(0);
            case static_1.Types.NegativeBigInteger:
            case static_1.Types.PositiveBigInteger: return (function () {
                var result = BigInt("0x".concat(sink.toString('hex')));
                return type === static_1.Types.NegativeBigInteger ? -result : result;
            })();
            case static_1.Types.FalseBoolean: return false;
            case static_1.Types.TrueBoolean: return true;
            case static_1.Types.String: return sink.toString('utf-8');
            case static_1.Types.EmptyString: return '';
            case static_1.Types.Undefined: return undefined;
            case static_1.Types.Date: return new Date(Number.parseInt(sink.toString('hex'), 16));
            case static_1.Types.Array: return (function () {
                var values = [];
                while (sink.length) {
                    values.push(_this.deserialize(stripByLength()));
                }
                return values;
            })();
            case static_1.Types.EmptyArray: return [];
            case static_1.Types.Null: return null;
            case static_1.Types.Buffer: return sink;
            case static_1.Types.EmptyBuffer: return Buffer.alloc(0);
            case static_1.Types.Object: return (function () {
                var obj = {};
                var keyPresent = false;
                var key = '';
                while (sink.length) {
                    var buffer = stripByLength();
                    if (buffer[0] === 0) {
                        if (keyPresent) {
                            throw new Error('Key already present, received another key');
                        }
                        keyPresent = true;
                        key = buffer.slice(1).toString('utf-8');
                    }
                    else if (buffer[0] === 1) {
                        if (!keyPresent) {
                            throw new Error('Key is not present, received a value');
                        }
                        keyPresent = false;
                        obj[key] = _this.deserialize(buffer.slice(1));
                    }
                    else {
                        throw new Error("Unknown type: ".concat(buffer[0] != null ? "0x".concat(buffer[0]) : 'undefined'));
                    }
                }
                return obj;
            })();
            case static_1.Types.EmptyObject: return {};
            case static_1.Types.NegativeFloat:
            case static_1.Types.PositiveFloat: return (function () {
                var real = Number.parseInt(stripByLength().toString('hex'), 16);
                var decimal = Number.parseInt(stripByLength().toString('hex'), 16);
                var result = Number("".concat(real, ".").concat(decimal));
                return type === static_1.Types.NegativeFloat ? -result : result;
            })();
            case static_1.Types.ZeroFloat: return 0;
            case static_1.Types.Error: return (function () {
                var deserialized = _this.deserialize(Buffer.concat([Buffer.from([static_1.Types.Object]), sink]));
                var errorOptions = {};
                if ('cause' in deserialized) {
                    errorOptions.cause = deserialized.cause;
                }
                return Object.assign(new Error(deserialized.message, errorOptions), deserialized);
            })();
            case static_1.Types.SingleEntryArray: return [this.deserialize(sink)];
            case static_1.Types.SingleEntryObject: return (function (object) {
                var _a;
                return (_a = {}, _a[object[0]] = object[1], _a);
            })(this.deserialize(Buffer.concat([Buffer.from([static_1.Types.Array]), sink])));
            case static_1.Types.URL: return new URL(sink.toString('utf-8'));
            default: throw new Error("Unknown Type: 0x".concat(type));
        }
    };
    return Serializer;
}());
exports.Serializer = Serializer;
