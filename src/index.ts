import {EventEmitter} from "events";
import {Constructable, OptionalObject, IBroker, IConsumer} from "./types";
const Brokers: {[key:string]:Broker} = {}

// define broker abstracted class
abstract class Broker implements IBroker{
    topics:string[]
    consumers:IConsumer[]
    EventEmitter:EventEmitter
    constructor() {
        this.consumers = this.consumers || [];
        this.topics = this.topics || []
        this.EventEmitter = this.EventEmitter || new EventEmitter();
    }
}

// method to add broker to brokers
const UseBroker = (ComingBroker:Constructable<Broker>) => {
    let BrokerName = ComingBroker.name;
    Brokers[BrokerName] = new ComingBroker();
}

// decorator to inject consumer into a broker
const Consumer = (BrokerName:string | Constructable<Broker>, topics:string[] = [], ...args) => {
    return (target:any, key) => {
        let executer = target[key];
        let consumer:IConsumer = {
            topics,
            executer,
            arguments:args || []
        }
        let BrokerConstructor = typeof BrokerName !== "string" ? BrokerName : null;
        BrokerName = BrokerConstructor ? BrokerConstructor.name : BrokerName;
        
        let broker = typeof BrokerName === "string" ? target instanceof Broker ? target: Brokers[<string>BrokerName]
        :
        BrokerConstructor.prototype
        ;
        setConsumer(<string>BrokerName, topics, executer, broker, ...args);
    }
}
// set consumer internal method to use for UseConsumer function and Consumer decorator
const setConsumer = (BrokerName:string, topics:string[], executer, broker:Broker,  ...args) => {
    let consumer:IConsumer = {
        topics,
        executer,
        arguments:args || []
    }
    if(broker) {
        broker.consumers = broker.consumers || [];
        broker.topics = broker.topics || [];
        broker.EventEmitter = broker.EventEmitter || new EventEmitter();
        broker.consumers.push(consumer)
        topics.map(topic => {
            let foundTopic = broker.topics.find(item => item === topic)
            if(!foundTopic) {
             broker.topics.push(topic);
            }
        })
        createTopicEvent(broker)
    }

}
// use consumer method to inject a consumer in a broker
const UseConsumer = (BrokerName:string | Constructable<Broker>, topics:string[] = [], executer:Function, ...args) => {
    let BrokerConstructor = typeof BrokerName !== "string" ? BrokerName : null;
    BrokerName = BrokerConstructor ? BrokerConstructor.name : BrokerName;
    let foundBroker = BrokerConstructor ? Brokers[<string>BrokerName] : Brokers[<string>BrokerName];
    let broker =Brokers[<string>BrokerName] || BrokerConstructor?.prototype
    // call set consumer
    setConsumer(<string>BrokerName, topics, executer, broker, ...args)
}

// topic decorator to add a topic path to a broker
const Topic = (topic:string) => {
    return (constructor:Constructable<Broker>) => {
        constructor.prototype.topics = constructor.prototype.topic || [];
        constructor.prototype.EventEmitter = constructor.prototype.EventEmitter || new EventEmitter();
        let topics:string[] = constructor.prototype.topics;
        let foundTopic = topics.find(item => item === topic)
        if(!foundTopic) {
         topics.push(topic);
        }
        createTopicEvent(constructor.prototype)
    }
}

// create topic event internal method
const createTopicEvent = (broker:Broker) => {
    let topics = broker.topics;
    topics.map((topic:string) => {
        if(broker.EventEmitter.eventNames().includes(topic)) {
            broker.EventEmitter.removeAllListeners(topic);
        }
        broker.EventEmitter.on(topic,(...args) => {
            let customers = broker.consumers.filter(obj => obj.topics.includes(topic));
            Promise.all(customers.map(async (obj) => obj.executer(...obj.arguments, ...args)))  
        })
        Promise.all(broker.consumers.map(async(obj) => {
            if(obj.topics.includes(topic)) {
            }
        }))
    })
}

// use producer method to trigger an event
const useProducer = (BrokerName:string, topic:string, ...args) => {
    let broker = Brokers[BrokerName];
        if(broker) {
            broker.EventEmitter.emit(topic, ...args)
        }
}


export {Broker, UseBroker, Consumer, UseConsumer, Brokers, useProducer, useProducer as UseProducer, Topic};

