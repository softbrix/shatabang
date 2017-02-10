FROM node:boron
MAINTAINER Andreas Sehr

# Create app directory
RUN mkdir -p /mnt/sorterat/
RUN mkdir -p /mnt/cache
RUN mkdir -p /usr/src/shatabang
WORKDIR /usr/src/shatabang

RUN apt-get update && apt-get install -y \
# RUN apk update && apk add \
  git \
  libopencv-dev \
  libimage-exiftool-perl \
  libvips-dev \
  libav-tools \
  redis-server

# libav-tools will install avprobe, need to create a symbolic link so it
# can be use by the node package fluent-ffmpeg.
RUN ls /usr/bin/av*
RUN ls /usr/bin/ff*
RUN ln -s /usr/bin/avprobe /usr/bin/ffprobe
RUN ln -s /usr/bin/avconv /usr/bin/ffmpeg

#Install source
# TODO: git checkout
COPY package.json /usr/src/shatabang

# Install app dependencies
RUN npm install
RUN npm install pm2 -g

COPY . /usr/src/shatabang

# Start the redis server
RUN service redis-server start

EXPOSE 3001
CMD ./start.sh && sh
