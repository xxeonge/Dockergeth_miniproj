#!/bin/bash

docker stop $(docker ps -qa)
docker rm $(docker ps -qa)

docker network rm eth
docker network create --gateway 172.18.0.1 --subnet 172.18.0.0/16 eth

./makeComposeFile.sh $1
./makeNodeIPFile.sh $1

#docker build -t ethereum . -f geth.Dockerfile --no-cache=true 
#docker build -t server . -f server.Dockerfile --no-cache=true 
docker-compose  -f server.docker-compose.yml up -d 
docker-compose -f geth.docker-compose.yml up
