"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var crypto_1 = tslib_1.__importDefault(require("crypto"));
var index_1 = tslib_1.__importDefault(require("./index"));
var input = {
    positiveNumber: crypto_1.default.randomInt(5),
    zeroNumber: 0,
    negativeNumber: -(crypto_1.default.randomInt(5)),
    positiveBigInteger: BigInt(crypto_1.default.randomInt(Math.pow(2, 32))),
    zeroBigInteger: BigInt(0),
    negativeBigInteger: -(BigInt(crypto_1.default.randomInt(Math.pow(2, 32)))),
    falseBoolean: false,
    trueBoolean: true,
    string: 'Hello World!',
    emptyString: '',
    undefined: undefined,
    date: new Date(),
    array: ['asd'],
    emptyArray: [],
    null: null,
    buffer: crypto_1.default.randomBytes(5),
    emptyBuffer: Buffer.alloc(0),
    object: {
        hello: 'world'
    },
    emptyObject: {},
    positiveFloat: crypto_1.default.randomInt(1000) / 100,
    negativeFloat: -(crypto_1.default.randomInt(1000) / 100),
    error: new Error('test', {
        cause: new Error('test cause')
    }),
    singleEntryArray: ['hello'],
    singleEntryObject: { hello: 'world' },
    url: new URL('https://github.com/')
};
var serialized = index_1.default.serialize(input);
var deserialized = index_1.default.deserialize(serialized);
console.log(input);
console.log(deserialized);
// console.log(Serializer.serialize(['a', 'a']))
// console.log(Serializer.serialize(['ad', 'ad']))
// console.log(Serializer.serialize(new Error('asd', {
//   cause: new Error('b')
// })))
// const buffer = Buffer.from([1, 2])
// console.log(Serializer.deserialize(Serializer.serialize(buffer)))
