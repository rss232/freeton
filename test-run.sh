#!/bin/bash
TEST_MESSAGES=test/messages.txt

CONTAINER=`docker ps | grep confluentinc/cp-kafka | awk '{print $(NF)}'`
if [ -z "$CONTAINER" ]; then
        echo "Can not find Kafka container name, have you run test-up.sh" 
        exit 1
fi

N_MESSAGES=`awk 'END{print NR}' ${TEST_MESSAGES}`

echo "Sending ${N_MESSAGES} messages to Kafka"

docker exec -i  ${CONTAINER} kafka-console-producer \
  --topic testtopic \
  --bootstrap-server broker:9092 \
  --property parse.key=true \
  --property key.separator=":"  < ${TEST_MESSAGES} 


echo "Done, all records sent to Kafka"

echo "test server should receive ${N_MESSAGES}"
docker-compose logs -f testserver
