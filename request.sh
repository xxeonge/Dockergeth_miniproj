#!/bin/bash
# $1 : node 개수 $2 : client 수 $3 : repet
for var in $(seq 1 $3)
do
    bash ./startWithServer.sh $1
    geth=`exit | geth attach http://localhost:8547`
    echo 'Wait Geth'
    while [[ "$geth" =~ "Fatal" ]];
    do
        geth=`exit | geth attach http://localhost:8547` 
        sleep 30s
    done
    python3 RequsetGenerator/main.py $2
    mkdir -p Log/$1/$2//$var
    docker cp ether.log-server.com:/root/go/bin/'file name' Log/$1/$2/$var/~log-sever.log
    for node in $(seq 1 $1)
    do
        docker cp ether.Node$node.com:/home/DATA_STORE/geth.log Log/$1/$2/$var/node$node.log
    done
done