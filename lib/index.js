"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topic = exports.UseProducer = exports.useProducer = exports.Brokers = exports.UseConsumer = exports.Consumer = exports.UseBroker = exports.Broker = void 0;
const events_1 = require("events");
const Brokers = {};
exports.Brokers = Brokers;
// define broker abstracted class
class Broker {
    constructor() {
        this.consumers = this.consumers || [];
        this.topics = this.topics || [];
        this.EventEmitter = this.EventEmitter || new events_1.EventEmitter();
    }
}
exports.Broker = Broker;
// method to add broker to brokers
const UseBroker = (ComingBroker) => {
    let BrokerName = ComingBroker.name;
    Brokers[BrokerName] = new ComingBroker();
};
exports.UseBroker = UseBroker;
// decorator to inject consumer into a broker
const Consumer = (BrokerName, topics = [], ...args) => {
    return (target, key) => {
        let executer = target[key];
        let consumer = {
            topics,
            executer,
            arguments: args || []
        };
        let BrokerConstructor = typeof BrokerName !== "string" ? BrokerName : null;
        BrokerName = BrokerConstructor ? BrokerConstructor.name : BrokerName;
        let broker = typeof BrokerName === "string" ? target instanceof Broker ? target : Brokers[BrokerName]
            :
                BrokerConstructor.prototype;
        setConsumer(BrokerName, topics, executer, broker, ...args);
    };
};
exports.Consumer = Consumer;
// set consumer internal method to use for UseConsumer function and Consumer decorator
const setConsumer = (BrokerName, topics, executer, broker, ...args) => {
    let consumer = {
        topics,
        executer,
        arguments: args || []
    };
    if (broker) {
        broker.consumers = broker.consumers || [];
        broker.topics = broker.topics || [];
        broker.EventEmitter = broker.EventEmitter || new events_1.EventEmitter();
        broker.consumers.push(consumer);
        topics.map(topic => {
            let foundTopic = broker.topics.find(item => item === topic);
            if (!foundTopic) {
                broker.topics.push(topic);
            }
        });
        createTopicEvent(broker);
    }
};
// use consumer method to inject a consumer in a broker
const UseConsumer = (BrokerName, topics = [], executer, ...args) => {
    let BrokerConstructor = typeof BrokerName !== "string" ? BrokerName : null;
    BrokerName = BrokerConstructor ? BrokerConstructor.name : BrokerName;
    let foundBroker = BrokerConstructor ? Brokers[BrokerName] : Brokers[BrokerName];
    let broker = Brokers[BrokerName] || (BrokerConstructor === null || BrokerConstructor === void 0 ? void 0 : BrokerConstructor.prototype);
    // call set consumer
    setConsumer(BrokerName, topics, executer, broker, ...args);
};
exports.UseConsumer = UseConsumer;
// topic decorator to add a topic path to a broker
const Topic = (topic) => {
    return (constructor) => {
        constructor.prototype.topics = constructor.prototype.topics || [];
        constructor.prototype.consumers = constructor.prototype.consumers || [];
        constructor.prototype.EventEmitter = constructor.prototype.EventEmitter || new events_1.EventEmitter();
        let topics = constructor.prototype.topics;
        let foundTopic = topics.find(item => item === topic);
        if (!foundTopic) {
            topics.push(topic);
        }
        createTopicEvent(constructor.prototype);
    };
};
exports.Topic = Topic;
// create topic event internal method
const createTopicEvent = (broker) => {
    let topics = broker.topics || [];
    topics = Array.from(topics);
    if (topics) {
        topics.forEach((topic) => {
            if (broker.EventEmitter.eventNames().includes(topic)) {
                broker.EventEmitter.removeAllListeners(topic);
            }
            broker.EventEmitter.on(topic, (...args) => {
                let consumers = broker.consumers.filter(obj => obj.topics.includes(topic));
                Promise.all(consumers.map((obj) => __awaiter(void 0, void 0, void 0, function* () { return obj.executer(...obj.arguments, ...args); })));
            });
        });
    }
};
// use producer method to trigger an event
const useProducer = (BrokerName, topic, ...args) => {
    let broker = Brokers[BrokerName];
    if (broker && broker.topics.includes(topic)) {
        broker.EventEmitter.emit(topic, ...args);
    }
};
exports.useProducer = useProducer;
exports.UseProducer = useProducer;
