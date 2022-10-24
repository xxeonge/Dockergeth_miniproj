FROM node
ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /home/back/

RUN apt-get update

COPY ./back /home/back
RUN npm install
