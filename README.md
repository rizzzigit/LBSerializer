# LBSerializer
Serializer for LBComms. It takes a JavaScript object and turn it into a buffer and vice-versa. Alternative to JSON.

## Supported Data Types
* Buffer and IntArray
* String
* Number
* BigInteger
* Boolean
* Date
* Array
* Object
* Undefined
* Null
* Error

## Installation
```shell
$ npm i github:rizzzigit/LBSerializer
```

## Usage
```typescript
import LBSerializer from '@rizzzi/lb-serializer'

const input = 'Hello World!11!!11'
const serialized = LBSerializer.serialize(input)

console.log(serialized) // <Buffer 08 48 65 6c 6c 6f 20 57 6f 72 6c 64 21 31 31 21 21 31 31>
console.log(LBSerializer.deserialize(serialized)) // Hello World!11!!11
```
