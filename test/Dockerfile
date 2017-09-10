FROM node:boron
MAINTAINER Andreas Sehr

WORKDIR /usr/src/shatabang

# Install app dependencies
RUN npm install node-sha1 sharp ascii85 imghash image-hash canvas-phash sharp-phash jimp && \
    npm cache clean

#Install source
COPY img_finger.js /usr/src/shatabang
COPY data /usr/src/shatabang/data

EXPOSE 3001
CMD node img_finger.js
