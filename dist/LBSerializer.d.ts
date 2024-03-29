import { Serializer } from './core/serializer';
export * from './core/static';
export * from './core/options';
export * from './core/serializer';
export declare const serialize: typeof Serializer.serialize;
export declare const deserialize: typeof Serializer.deserialize;
export declare const readFile: typeof Serializer.readFile;
export declare const writeFile: typeof Serializer.writeFile;
export declare const readFileSync: typeof Serializer.readFileSync;
export declare const writeFileSync: typeof Serializer.writeFileSync;
