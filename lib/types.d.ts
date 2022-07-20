/// <reference types="node" />
import { EventEmitter } from "events";
export interface Constructable<T> {
    new (...args: any): T;
}
export interface OptionalObject {
    [key: string]: any;
}
export interface IConsumer {
    topics: string[];
    executer: Function;
    arguments: any[];
}
export interface IBroker {
    topics: string[];
    consumers: IConsumer[];
    EventEmitter: EventEmitter;
}
