FROM ubuntu:22.04
ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /home/go-ethereum/

RUN rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y --no-install-recommends apt-utils
RUN apt-get install -y build-essential libgmp3-dev golang git pcscd

RUN service pcscd start

WORKDIR /
#RUN git clone -b addTime https://github.com/AMKNSEC-LAB/GDCPEA

COPY ./GDCPEA-main /GDCPEA/

WORKDIR /
COPY ./gethData/ambassador.go /GDCPEA/ambassador/ambassador.go

WORKDIR /GDCPEA/GDCPEA-Geth-example

RUN go mod tidy
RUN go install ./...

WORKDIR /root/go
RUN cp -r /root/go/bin/* /usr/local/bin

WORKDIR /home/DATA_STORE
COPY ./gethData/genesis.json /home/DATA_STORE

WORKDIR /home/data
COPY ./gethData/boot.key /home/data
COPY ./gethData/geth.sh /home/data
COPY ./gethData/gethNode1.sh /home/data
COPY ./gethData/private_keys /home/data
COPY ./gethData/public_keys /home/data
RUN chmod +x /home/data/geth.sh
RUN chmod +x /home/data/gethNode1.sh
