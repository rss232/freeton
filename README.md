# HTTP Notification Service

Simple, with a tiny codebase, service on top of the most reliable, Redis-based queue for Node, that is easy to maintain and scale. 

## Main features
 - Posts per URL are batched for high throughput
 - Rate limit 
 - If the message is not accepted by the recipient, then the backoff is applied to all messages to this URL

This service consists of several microservices, connected throw a message queue

## Technology stack
 - Redis   - Сache and message queue
 - Kafka-connectors - node.js microservice(s)
 - HTTP-senders - node.js microservices
 - MongoDb - Store user configuration and statistics

  
## Scaling
Depending on the volume of the load, you can choose the following scaling methods:
- Add more HTTP-senders, it is quite possible that you will need this in the first place 
- Add more Kafka connectors, assuming that the data source has enough partitions.  
- Place another Redis server next to the existing one, completely separate, share nothing. 
  In this case, you need to split messages by URL between Redis servers,to control rate limit, but this is 
  definitely easy to do 
- You hardly ever need to scale MongoDb. It is only used for statistics and it would be nice not to store it for a long time. 

## Configurable parameters:
  
  - see src/config.js 
