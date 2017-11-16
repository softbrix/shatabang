FROM node:boron
MAINTAINER Andreas Sehr

WORKDIR /usr/src/shatabang

RUN apt-get update && apt-get install -y --no-install-recommends \
  git \
  libopencv-dev \
  libimage-exiftool-perl \
  libvips-dev \
  libav-tools && \

  # Cleaning APT directory
  rm -rf /var/lib/apt/lists/*  && \

  # Install npm modules
  npm install -g ember-cli && \

  # libav-tools will install avprobe, need to create a symbolic link so it
  # can be use by the node package fluent-ffmpeg.
  ln -s /usr/bin/avprobe /usr/bin/ffprobe && \
  ln -s /usr/bin/avconv /usr/bin/ffmpeg


# Create app directory
RUN mkdir -p /mnt/sorterat/ && \
    mkdir -p /mnt/cache && \
    mkdir -p /usr/src/shatabang/client

#Install source
# TODO: git checkout
COPY package.json /usr/src/shatabang
COPY client/*.json /usr/src/shatabang/client/
COPY client /usr/src/shatabang/client
COPY modules /usr/src/shatabang/modules
COPY routes /usr/src/shatabang/routes
COPY task_processors /usr/src/shatabang/task_processors
COPY *.js /usr/src/shatabang/
COPY install_scripts/docker_config_server.json /usr/src/shatabang/config_server.json


# Install app dependencies
RUN npm install && \
# Build client
    cd /usr/src/shatabang/client && \
    npm install && \
    ember build --environment="production" && \
    ## Cleanup
    npm cache clean

EXPOSE 3001
CMD npm run start && sh
