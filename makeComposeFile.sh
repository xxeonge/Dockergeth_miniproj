#!/bin/bash

basic=`cat ./docker-compose-basic`
before=`cat ./docker-compose-node`
result="./geth.docker-compose.yml"

for ((i=1; i<= $1; i++));
do

 after=`echo "$before" | sed s/httpport/$((8546+i))/g`
 after=`echo "$after" | sed s/Node/Node$i/g`
 after=`echo "$after" | sed s/rpcport/$((30301+i))/g`
 after=`echo "$after" | sed s/IP/172.18.0.$((12+i))/g`
 basic+=$after
done

echo "$basic" > "$result"


