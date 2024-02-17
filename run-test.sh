#!/bin/bash

docker-compose -f docker-compose.yml --profile test build &&
docker-compose -f docker-compose.yml --profile test up --exit-code-from=test
exit $?