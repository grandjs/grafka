/// <reference types="node" />
import { EventEmitter } from "events";
import { Constructable, IBroker, IConsumer } from "./types";
declare const Brokers: {
    [key: string]: Broker;
};
declare abstract class Broker implements IBroker {
    topics: string[];
    consumers: IConsumer[];
    EventEmitter: EventEmitter;
    constructor();
}
declare const UseBroker: (ComingBroker: Constructable<Broker>) => void;
declare const Consumer: (BrokerName: string | Constructable<Broker>, topics?: string[], ...args: any[]) => (target: any, key: any) => void;
declare const UseConsumer: (BrokerName: string | Constructable<Broker>, topics: string[], executer: Function, ...args: any[]) => void;
declare const Topic: (topic: string) => (constructor: Constructable<Broker>) => void;
declare const useProducer: (BrokerName: string, topic: string, ...args: any[]) => void;
export { Broker, UseBroker, Consumer, UseConsumer, Brokers, useProducer, useProducer as UseProducer, Topic };
