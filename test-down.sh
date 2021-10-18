#!/bin/bash

DB_FILES=volumes/mongodb/data/ 
REDIS_FILES=volumes/redis/data/ 

docker-compose -f test/docker-compose-test-kafka.yml down
docker-compose down && echo "All systems stopped"
echo -e "\nIf you need to repeat the test from its initial state, REMOVE $DB_FILES $REDIS_FILES\n"
