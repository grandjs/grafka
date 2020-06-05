import {EventEmitter} from "events";

// define constructoable interface
export interface Constructable<T> {
    new(...args: any) : T;
}
// define optional object interface
export interface OptionalObject{
    [key:string]:any
}
// define consumer interface
export interface IConsumer{
    topics:string[]
    executer:Function,
    arguments:any[]
}
// define broker interface
export interface IBroker{
    topics:string[]
    consumers:IConsumer[]
    EventEmitter:EventEmitter
}