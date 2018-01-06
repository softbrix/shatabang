FROM node:carbon-stretch
MAINTAINER Andreas Sehr

ENV STORAGE_DIR /mnt/sorterat/
ENV CACHE_DIR /mnt/cache/
ENV SERVER_SALT 6548ee70d7d258e34eaf4daf9d8c30214bf8163e
ENV ADMIN_HASH 98962591ddd626a5857a82e4ad876975e71e1a9cf586ff4cc4c57eb453d172cd

RUN apt-get update && apt-get install -y --no-install-recommends \
  git \
  libopencv-dev \
  libimage-exiftool-perl \
  libvips-dev \
  ffmpeg \
  yarn && \
# Cleaning APT directory
  rm -rf /var/lib/apt/lists/*  && \
# Install npm modules
  npm install -g ember-cli && \
# Create app directory
  mkdir -p /mnt/sorterat/ && \
  mkdir -p /mnt/cache && \
  mkdir -p /usr/src/shatabang/client

#Install source
# TODO: git checkout
COPY *.json /usr/src/shatabang/
COPY *.lock /usr/src/shatabang/
COPY client/*.json /usr/src/shatabang/client/
#COPY client /usr/src/shatabang/client

WORKDIR /usr/src/shatabang

# Install app dependencies
RUN yarn install --production --non-interactive --pure-lockfile && \
    # Build client
    cd client && \
    npm install

COPY . .
#COPY modules /usr/src/shatabang/modules
#COPY routes /usr/src/shatabang/routes
#COPY task_processors /usr/src/shatabang/task_processors
#COPY *.js /usr/src/shatabang/
#COPY install_scripts/docker_config_server.json /usr/src/shatabang/config_server.json

# Create empty config
RUN echo '{}' > config_server.json && \
# Build client
    cd client && \
    ember build --environment="production"

# USER node

EXPOSE 3001
CMD npm run start && sh
