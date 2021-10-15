#!/bin/bash

CONTAINER=`docker ps | grep confluentinc/cp-kafka | awk '{print $(NF)}'`
if [ -z "$CONTAINER" ]; then
    echo "OK, starting Kafka"
else 
    echo "Seems like another instance of Kafka is running"
    echo "Did you forget to run test-down.sh?"
    echo ""
    echo "Exiting. If you think this is a mistake"
    echo "edit this file and remove this check"
    exit 1
fi

docker-compose -f test/docker-compose-test-kafka.yml \
    up --build -d

sleep 5 # Small break for Kafka broker initialization

docker-compose -f test/docker-compose-test-kafka.yml \
    exec broker kafka-topics \
    --create --topic testtopic \
    --bootstrap-server broker:9092

echo "Start Notification provider"

KAFKA_BROKERS=broker:29092 KAFKA_TOPIC=testtopic TESTS=yes \
    docker-compose up --build -d

