#!/bin/bash
docker-compose -f docker-compose.yml down &&
docker-compose -f docker-compose.yml --profile infra build &&
docker-compose -f docker-compose.yml --profile infra up