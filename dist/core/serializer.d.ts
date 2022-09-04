/// <reference types="node" />
import { SerializerOptions } from './options';
export declare class Serializer {
    private static _serializer?;
    static get serializer(): Serializer;
    static serialize(input: any): Buffer;
    static deserialize(input: Buffer): any;
    static readFile(path: string): Promise<any>;
    static writeFile(path: string, data: any): Promise<void>;
    static readFileSync(path: string): any;
    static writeFileSync(path: string, data: any): void;
    constructor(options?: Partial<SerializerOptions>);
    readonly options: SerializerOptions;
    readFile(path: string): Promise<any>;
    writeFile(path: string, data: any): Promise<void>;
    readFileSync(path: string): any;
    writeFileSync(path: string, data: any): void;
    serialize(input: any): Buffer;
    private _serialize;
    deserialize(input: Buffer): any;
}
