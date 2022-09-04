import FS from 'fs'

import { SerializerOptions } from './options'
import { Types } from './static'

export class Serializer {
  private static _serializer?: Serializer
  public static get serializer () {
    return this._serializer || (this._serializer = new Serializer())
  }

  public static serialize (input: any): Buffer {
    return this.serializer.serialize(input)
  }

  public static deserialize (input: Buffer) {
    return this.serializer.deserialize(input)
  }

  public static readFile (path: string) {
    return this.serializer.readFile(path)
  }

  public static writeFile (path: string, data: any) {
    return this.serializer.writeFile(path, data)
  }

  public static readFileSync (path: string) {
    return this.serializer.readFileSync(path)
  }

  public static writeFileSync (path: string, data: any) {
    return this.serializer.writeFileSync(path, data)
  }

  public constructor (options?: Partial<SerializerOptions>) {
    this.options = {
      randomBytesSize: 4,
      ...options
    }
  }

  public readonly options: SerializerOptions

  public async readFile (path: string) {
    return this.deserialize(await FS.promises.readFile(path))
  }

  public async writeFile (path: string, data: any) {
    return await FS.promises.writeFile(path, this.serialize(data))
  }

  public readFileSync (path: string) {
    return this.deserialize(FS.readFileSync(path))
  }

  public writeFileSync (path: string, data: any) {
    return FS.writeFileSync(path, this.serialize(data))
  }

  public serialize (input: any): Buffer {
    try {
      JSON.stringify(input)
    } catch (error: any) {
      if (error?.message?.includes('Converting circular structure to JSON')) {
        throw new Error('Circular structure cannot be converted to LB')
      }
    }

    return Buffer.concat(this._serialize(input))
  }

  private _serialize (input: any): Array<Buffer> {
    const sink: Array<Buffer> = []

    const pushType = (...intArray: Array<number>) => {
      sink.push(Buffer.from(intArray))
    }

    const pushHex = (hex: string) => {
      sink.push(Buffer.from(hex, 'hex'))
    }

    const pushString = (string: string) => {
      sink.push(Buffer.from(string, 'utf-8'))
    }

    const pushLength = (buffer: Buffer) => {
      const lengthBuffer = Buffer.from(((hex) => hex.length % 2 ? `0${hex}` : `${hex}`)(`${buffer.length.toString(16)}`), 'hex')
      if (lengthBuffer.length > 255) {
        throw Object.assign(new Error('Length buffer length too long'), { buffer })
      }

      sink.push(Buffer.concat([Buffer.from([lengthBuffer.length]), lengthBuffer]))
    }

    if (typeof (input) === 'bigint') {
      const hex = input.toString(16)
      if (input === BigInt(0)) {
        pushType(Types.ZeroBigInteger)
      } else if (!hex.indexOf('-')) {
        pushType(Types.NegativeBigInteger)
        pushHex(((hex) => hex.length % 2 ? `0${hex}` : hex)(hex.slice(1)))
      } else {
        pushType(Types.PositiveBigInteger)
        pushHex(hex.length % 2 ? `0${hex}` : hex)
      }
    } else if (typeof (input) === 'number') {
      const hex = input.toString(16)
      if (input === 0) {
        pushType(Types.ZeroNumber)
      } else if ((hex.indexOf('.') > -1) && (!hex.indexOf('-'))) {
        pushType(Types.NegativeFloat)
        sink.push(...this._serialize(-input).slice(1))
      } else if (hex.indexOf('.') > -1) {
        const [real, decimal] = `${input}`.split('.').map((num) => Number(num))
        const realBuffer = Buffer.from(((realHex) => realHex.length % 2 ? `0${realHex}` : realHex)(real.toString(16)), 'hex')
        const decimalBuffer = Buffer.from(((decimalHex) => decimalHex.length % 2 ? `0${decimalHex}` : decimalHex)(decimal.toString(16)), 'hex')

        pushType(Types.PositiveFloat)
        pushLength(realBuffer)
        sink.push(realBuffer)
        pushLength(decimalBuffer)
        sink.push(decimalBuffer)
      } else if (!hex.indexOf('-')) {
        pushType(Types.NegativeNumber)
        pushHex(((hex) => hex.length % 2 ? `0${hex}` : hex)(hex.slice(1)))
      } else {
        pushType(Types.PositiveNumber)
        pushHex(hex.length % 2 ? `0${hex}` : hex)
      }
    } else if (typeof (input) === 'boolean') {
      pushType(input ? Types.TrueBoolean : Types.FalseBoolean)
    } else if (typeof (input) === 'string') {
      if (input.length) {
        pushType(Types.String)
        pushString(input)
      } else {
        pushType(Types.EmptyString)
      }
    } else if (['undefined', 'function'].includes(typeof (input))) {
      pushType(Types.Undefined)
    } else if (typeof (input) === 'object') {
      if (input instanceof URL) {
        pushType(Types.URL)
        sink.push(Buffer.from(input.href, 'utf-8'))
      } else if (input instanceof Error) {
        pushType(Types.Error)
        sink.push(...this._serialize((() => {
          const error: { [key: string]: any } = {
            ...input,

            name: input.name,
            message: input.message,
            stack: input.stack
          }

          if (input.cause != null) {
            error.cause = input.cause
          }

          return error
        })()).slice(1))
      } else if (input instanceof Date) {
        pushType(Types.Date)
        pushHex(((hex) => {
          if (hex.length % 2) {
            hex = `0${hex}`
          }

          return hex
        })(input.getTime().toString(16)))
      } else if (Array.isArray(input)) {
        if (input.length === 1) {
          pushType(Types.SingleEntryArray)
          sink.push(...this._serialize(input[0]))
        } else if (input.length) {
          pushType(Types.Array)
          for (const inputEntry of input) {
            const buffer = this.serialize(inputEntry)

            pushLength(buffer)
            sink.push(buffer)
          }
        } else {
          pushType(Types.EmptyArray)
        }
      } else if (input == null) {
        pushType(Types.Null)
      } else if (
        Buffer.isBuffer(input) ||
        (input instanceof Int8Array) ||
        (input instanceof Int16Array) ||
        (input instanceof Int32Array) ||
        (input instanceof BigInt64Array) ||
        (input instanceof BigUint64Array) ||
        (input instanceof Uint8Array) ||
        (input instanceof Uint16Array) ||
        (input instanceof Uint32Array)
      ) {
        const inputBuffer = Buffer.isBuffer(input) ? input : Buffer.from(input)
        if (inputBuffer.length) {
          pushType(Types.Buffer)
          sink.push(inputBuffer)
        } else {
          pushType(Types.EmptyBuffer)
        }
      } else {
        const inputObj: { [key: string]: any } = ((input) => {
          const newObject: { [key: string]: any } = {}

          for (const inputKey in input) {
            if (
              (input[inputKey] === undefined) ||
              (typeof (input[inputKey]) === 'function')
            ) {
              continue
            }

            newObject[inputKey] = input[inputKey]
          }

          return newObject
        })({ ...input })

        if (!inputObj) {
          pushType(Types.Undefined)
        } else if (Object.keys(inputObj).length === 1) {
          pushType(Types.SingleEntryObject)
          for (const inputObjKey in inputObj) {
            sink.push(this.serialize([inputObjKey, inputObj[inputObjKey]]).slice(1))
          }
        } else if (Object.keys(inputObj).length) {
          pushType(Types.Object)
          for (const inputObjKey in inputObj) {
            const keyBuffer = Buffer.concat([Buffer.from([0]), Buffer.from(inputObjKey, 'utf-8')])
            const valueBuffer = Buffer.concat([Buffer.from([1]), this.serialize(inputObj[inputObjKey])])

            pushLength(keyBuffer)
            sink.push(keyBuffer)
            pushLength(valueBuffer)
            sink.push(valueBuffer)
          }
        } else {
          pushType(Types.EmptyObject)
        }
      }
    }

    return sink
  }

  public deserialize (input: Buffer): any {
    let sink = input

    const strip = (stripLength: number, offset: number = 0, bufferLength: number = stripLength - offset) => {
      const buffer = sink.slice(0, stripLength)
      sink = sink.slice(stripLength)

      return buffer.slice(offset, bufferLength > 0 ? offset + bufferLength : stripLength + bufferLength)
    }

    const stripByLength = () => {
      const sizeBufferLength = strip(1)[0]
      const sizeBuffer = strip(sizeBufferLength)
      if (sizeBufferLength !== sizeBuffer.length) {
        throw new Error(`Incorrect size buffer length: Got ${sizeBuffer.length} instead of ${sizeBufferLength}`)
      }

      const size = Number.parseInt(sizeBuffer.toString('hex') || '0', 16)
      const buffer = strip(size)
      if (size !== buffer.length) {
        throw new Error(`Incorrect data buffer length: Got ${buffer.length} instead of ${size}`)
      }

      return buffer
    }

    const type = strip(1)[0]

    switch (type) {
      case Types.ZeroNumber: return 0
      case Types.PositiveNumber:
      case Types.NegativeNumber: return (() => {
        const result = Number.parseInt(sink.toString('hex'), 16)
        return type === Types.NegativeNumber ? -result : result
      })()

      case Types.ZeroBigInteger: return BigInt(0)
      case Types.NegativeBigInteger:
      case Types.PositiveBigInteger: return (() => {
        const result = BigInt(`0x${sink.toString('hex')}`)
        return type === Types.NegativeBigInteger ? -result : result
      })()

      case Types.FalseBoolean: return false
      case Types.TrueBoolean: return true

      case Types.String: return sink.toString('utf-8')
      case Types.EmptyString: return ''

      case Types.Undefined: return undefined

      case Types.Date: return new Date(Number.parseInt(sink.toString('hex'), 16))

      case Types.Array: return (() => {
        const values: Array<any> = []

        while (sink.length) {
          values.push(this.deserialize(stripByLength()))
        }

        return values
      })()
      case Types.EmptyArray: return []

      case Types.Null: return null

      case Types.Buffer: return sink
      case Types.EmptyBuffer: return Buffer.alloc(0)

      case Types.Object: return (() => {
        const obj: { [key: string]: any } = {}
        let keyPresent = false
        let key: string = ''
        while (sink.length) {
          const buffer = stripByLength()

          if (buffer[0] === 0) {
            if (keyPresent) {
              throw new Error('Key already present, received another key')
            }

            keyPresent = true
            key = buffer.slice(1).toString('utf-8')
          } else if (buffer[0] === 1) {
            if (!keyPresent) {
              throw new Error('Key is not present, received a value')
            }

            keyPresent = false
            obj[key] = this.deserialize(buffer.slice(1))
          } else {
            throw new Error(`Unknown type: ${buffer[0] != null ? `0x${buffer[0]}` : 'undefined'}`)
          }
        }

        return obj
      })()
      case Types.EmptyObject: return {}

      case Types.NegativeFloat:
      case Types.PositiveFloat: return (() => {
        const real = Number.parseInt(stripByLength().toString('hex'), 16)
        const decimal = Number.parseInt(stripByLength().toString('hex'), 16)

        const result = Number(`${real}.${decimal}`)
        return type === Types.NegativeFloat ? -result : result
      })()
      case Types.ZeroFloat: return 0

      case Types.Error: return (() => {
        const deserialized = this.deserialize(Buffer.concat([Buffer.from([Types.Object]), sink]))

        const errorOptions: { cause?: Error } = {}
        if ('cause' in deserialized) {
          errorOptions.cause = deserialized.cause
        }

        return Object.assign(new Error(deserialized.message, errorOptions), deserialized)
      })()

      case Types.SingleEntryArray: return [this.deserialize(sink)]
      case Types.SingleEntryObject: return ((object) => ({ [object[0]]: object[1] }))(this.deserialize(Buffer.concat([Buffer.from([Types.Array]), sink])))

      case Types.URL: return new URL(sink.toString('utf-8'))

      default: throw new Error(`Unknown Type: 0x${type}`)
    }
  }
}
