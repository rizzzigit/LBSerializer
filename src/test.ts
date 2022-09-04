import Crypto from 'crypto'
import Serializer from './index'

const input = {
  positiveNumber: Crypto.randomInt(5),
  zeroNumber: 0,
  negativeNumber: -(Crypto.randomInt(5)),

  positiveBigInteger: BigInt(Crypto.randomInt(2 ** 32)),
  zeroBigInteger: BigInt(0),
  negativeBigInteger: -(BigInt(Crypto.randomInt(2 ** 32))),

  falseBoolean: false,
  trueBoolean: true,

  string: 'Hello World!',
  emptyString: '',

  undefined,

  date: new Date(),

  array: ['asd'],
  emptyArray: [],

  null: null,

  buffer: Crypto.randomBytes(5),

  emptyBuffer: Buffer.alloc(0),

  object: {
    hello: 'world'
  },

  emptyObject: {},

  positiveFloat: Crypto.randomInt(1000) / 100,
  negativeFloat: -(Crypto.randomInt(1000) / 100),

  error: new Error('test', {
    cause: new Error('test cause')
  }),

  singleEntryArray: ['hello'],
  singleEntryObject: { hello: 'world' },

  url: new URL('https://github.com/')
}

const serialized = Serializer.serialize(input)
const deserialized = Serializer.deserialize(serialized)
console.log(input)
console.log(deserialized)

// console.log(Serializer.serialize(['a', 'a']))
// console.log(Serializer.serialize(['ad', 'ad']))

// console.log(Serializer.serialize(new Error('asd', {
//   cause: new Error('b')
// })))

// const buffer = Buffer.from([1, 2])
// console.log(Serializer.deserialize(Serializer.serialize(buffer)))
