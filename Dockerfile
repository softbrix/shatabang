FROM node:boron
MAINTAINER Andreas Sehr

# Create app directory
RUN mkdir -p /mnt/sorterat/
RUN mkdir -p /mnt/cache
RUN mkdir -p /usr/src/shatabang/client
WORKDIR /usr/src/shatabang

RUN apt-get update && apt-get install -y --no-install-recommends \
  git \
  libopencv-dev \
  libimage-exiftool-perl \
  libvips-dev \
  libav-tools

# libav-tools will install avprobe, need to create a symbolic link so it
# can be use by the node package fluent-ffmpeg.
RUN ls /usr/bin/av*
RUN ls /usr/bin/ff*
RUN ln -s /usr/bin/avprobe /usr/bin/ffprobe
RUN ln -s /usr/bin/avconv /usr/bin/ffmpeg

RUN npm install -g ember-cli && \
    npm install -g bower

# Install app dependencies
COPY package.json /usr/src/shatabang
RUN npm install

COPY client/*.json /usr/src/shatabang/client/
RUN cd /usr/src/shatabang/client && \
    npm install && \
    bower install --allow-root

#Install source
# TODO: git checkout
COPY client /usr/src/shatabang/client
COPY modules /usr/src/shatabang/modules
COPY routes /usr/src/shatabang/routes
COPY task_processors /usr/src/shatabang/task_processors
COPY *.js /usr/src/shatabang/
COPY install_scripts/docker_config_server.json /usr/src/shatabang/config_server.json

# Build client
RUN cd /usr/src/shatabang/client && \
    ember build --environment="production"

EXPOSE 3001
CMD npm run start && sh
