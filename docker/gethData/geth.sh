#!/bin/bash

#for var in {0..110}
for var in {0..11}
do
	echo -e "pwd" >> ./password
done

geth --datadir /home/DATA_STORE init /home/DATA_STORE/genesis.json

while read account; do
	echo $account > keyfile
	geth account import --datadir /home/DATA_STORE --password password keyfile
done < /home/data/private_keys


# geth --networkid 7402 --bootnodes 'enode://47c9b96dfa632ec90c644553bc3e8c048d1aac65aaf16e585a30205d34e0afc0802b8d767aa7ec6d587800b2b7732aaa19ca8582e5faeb3eb4134fa11555fd47@172.18.0.12:30301' --datadir /home/DATA_STORE --port $PORT --http --http.addr 0.0.0.0  --http.port $HTTPPORT --http.corsdomain "*"  --http.api="eth,net,web3,personal,web3,miner,admin,debug" --unlock "0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109" --password ./password  --allow-insecure-unlock --verbosity 6 --log.debug --vmodule */*=6 console 2>> /home/DATA_STORE/geth.log

geth --networkid 7402 --bootnodes 'enode://47c9b96dfa632ec90c644553bc3e8c048d1aac65aaf16e585a30205d34e0afc0802b8d767aa7ec6d587800b2b7732aaa19ca8582e5faeb3eb4134fa11555fd47@172.18.0.12:30301' --datadir /home/DATA_STORE --port $PORT --http --http.addr 0.0.0.0  --http.port $HTTPPORT --http.corsdomain "*"  --http.api="eth,net,web3,personal,web3,miner,admin,debug" --unlock "0,1,2,3,4,5,6,7,8,9" --password ./password  --allow-insecure-unlock --verbosity 6 --log.debug --vmodule */*=6 console 2>> /home/DATA_STORE/geth.log

