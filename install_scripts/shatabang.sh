#!/bin/sh

# Run update for debian
sudo apt-get update
sudo apt-get install git miniupnpc libimage-exiftool-perl libvips-dev build-essential libav-tools redis-server -y

curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs

# libav-tools will install avprobe, need to create a symbolic link so it 
# can be use by the node package fluent-ffmpeg.
ln -s /usr/bin/avprobe /usr/bin/ffprobe
ln -s /usr/bin/avconv /usr/bin/ffmpeg


#clone repo
git clone ssh://andreas@h.sehr.se:20022/home/andreas/gitrepos/shatabang.git

#initialize app
cd shatabang
npm install
npm install pm2 -g

pm2 start server.js --name="shatabang"
pm2 start task_processor.js --name="task processor"
