# HTTP Notification Provider

Simple, with a tiny codebase service, on top of the most reliable Redis-based queue, that is easy to maintain and scale. 

## Main features
 - Messages are batched by URL for high throughput
 - Easy to apply different backoff strategies 
 - Rate limiting

This service consists of several microservices, connected throw a message queue

## Technology stack
 - Redis   - Сache and message queue
 - Kafka-connectors - node.js microservice(s)
 - HTTP-senders - node.js microservices
 - MongoDb - Store user configuration and statistics

We are using Bull.js. You can read more about here: [Bull.js](https://optimalbits.github.io/bull/)
  
## Scaling
Depending on the volume of the load, you can choose the following scaling methods:
 - Add more HTTP-senders, it is quite possible that you will need this in the first place 
 - Add more Kafka connectors, assuming that the data source has enough partitions.  
 - Place another Redis server next to the existing one, completely separate, share nothing. 
   In this case, you need to split messages by URL between Redis servers to control rate limit, but this is 
  definitely easy to do 
 - You hardly ever need to scale MongoDb. It is only used for statistics and it would be nice not to store it for a long time. 

## User Interaction
 - Step 1
   The user selects `RSS` provider from the menu

 - Step 2
   User submits their URL for notifications. In response, he receives HTML-code, which must be saved on his site. 
   This is the easiest and most familiar way to verify ownership of a website.

  ```
  Please follow the instructions:
  1. Create a file 6361-41ed-427b-98d4-578e.html in the webroot with the following content:
  <html>
     <head>
           <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
       </head>
       <body>Verification: 63361-41ed-427b-98d4-52578e </body>
  </html>
  Call DeBot again and send us just a blank line, after that we confirm your endpoint. 
  ```

 - Step 3
   The user selects `RSS` provider again from the menu and this time just sends him an empty string. This is a signal that he has completed step 2.
   
 - Step 4.
  The service informs the user about the result of the check and gives him a unique link by which the user can perform some actions that require authorization, for example, get statistics
  ```
  https://your.site.com/webhooks 
  URL confirmed, use this link to get your statistics:
  https://toncontest.tmweb.ru/stats?token=5024fa-486e-df83-02a822
  ```

## Statistics
Using the access token you got when registering your webhook (see above), you can get the number of successful POST requests to your URL with a one minute resolution. The maximum date range for each request is one month, so no pagination is required.

```
GET https://toncontest.tmweb.ru/stats?token=<your_token>&from=<YYYY-MM-DD>&to<YYYY-MM-DD>
```

Result contains an array: `[unix_time_stamp, number_of_notifications]`

```
{
  "from":"2021-10-17",
  "to":"2021-10-20",
  "url":"https://your.site.ru/webhook",
  "data":[[1634479320,5],[1634479380,7],[1634479440,4],[1634479500,5]
}
```

## Testing

### Prerequisites:
 - npm installed
 - docker installed
 
```
[freeton]$ npm i
[freeton]$ ./start_up.sh
[freeton]$ ./test-run.sh
```
```
Sending 50 messages to Kafka
Done, all records sent to Kafka

test server should receive 50

Attaching to testserver
testserver       | Test webhook server  listening at http://localhost:3000
testserver       | 30% of request aprox will be failed with HTTP status 500
testserver       | Requests          Messages          Total size
testserver       | 1                 3                 7311
testserver       | 2                 6                 14622
testserver       | 3                 9                 21933
testserver       | HTTP status 500 sent
testserver       | 4                 12                29244
testserver       | 5                 15                36555
testserver       | HTTP status 500 sent
testserver       | 6                 18                43866
testserver       | 7                 21                51177
testserver       | 8                 24                58488
testserver       | HTTP status 500 sent
testserver       | 9                 27                65799
testserver       | 10                30                73110
testserver       | HTTP status 500 sent
testserver       | 11                33                80421
testserver       | 12                36                87732
testserver       | 13                38                92606
testserver       | HTTP status 500 sent
testserver       | HTTP status 500 sent
testserver       | HTTP status 500 sent
testserver       | 14                41                99917
testserver       | 15                44                107228
testserver       | 16                47                114539
testserver       | 17                50                121850
^C: Aborting.
[freeton]$
```

## Monitoring & Alerting

- With Prometheus [Bull Queue Exporter](https://github.com/UpHabit/bull_exporter)

