#!/bin/bash

docker-compose -f test/docker-compose-test-kafka.yml down
docker-compose down
echo "All systems stopped"
