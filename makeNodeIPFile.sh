#!/bin/bash

result="./back/routes/nodeIPAddress.js"
address=()

for ((i=1; i<= $1; i++));
do
 tmp="\"http://172.18.0.$((12+i)):$((8546+i))\""
 address+=($tmp)
done

a="var address = ["
for ((i=0; i<$1-1; i++));
do
 a+="${address[$((i))]},"
done
a+="${address[($(1)-1)]}] \nmodule.exports = address;"
echo -e "$a" > "$result"
