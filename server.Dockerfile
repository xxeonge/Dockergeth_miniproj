FROM node
ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /home/back/

RUN rm -rf /var/lib/apt/lists/*
RUN apt-get update

COPY ./back /home/back
RUN npm install

