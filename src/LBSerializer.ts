import { Serializer } from './core/serializer'

export * from './core/static'
export * from './core/options'
export * from './core/serializer'

export const serialize = Serializer.serialize.bind(Serializer)
export const deserialize = Serializer.deserialize.bind(Serializer)
export const readFile = Serializer.readFile.bind(Serializer)
export const writeFile = Serializer.writeFile.bind(Serializer)
export const readFileSync = Serializer.readFileSync.bind(Serializer)
export const writeFileSync = Serializer.writeFileSync.bind(Serializer)
