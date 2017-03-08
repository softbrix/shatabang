FROM node:boron
MAINTAINER Andreas Sehr

# Create app directory
RUN mkdir -p /mnt/sorterat/
RUN mkdir -p /mnt/cache
RUN mkdir -p /usr/src/shatabang
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

#Install source
# TODO: git checkout
COPY package.json /usr/src/shatabang
COPY client /usr/src/shatabang/client
COPY modules /usr/src/shatabang/modules
COPY routes /usr/src/shatabang/routes
COPY task_processors /usr/src/shatabang/task_processors
COPY *.js /usr/src/shatabang/
COPY install_scripts/docker_config_server.json /usr/src/shatabang/config_server.json

# Install app dependencies
RUN npm install
RUN npm run build_client

EXPOSE 3001
CMD npm run start && sh
