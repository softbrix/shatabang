# External dependencies:

### Exiftool

To read exif info from images.

### libvips

To resize images.

### ffmpeg

To resize videos.

### redis

A key-value NoSQL database.

## Mac OS X:

sudo brew update  
sudo brew install exiftool redis  

## Ubuntu:

sudo apt-get update  
sudo apt-get install git libimage-exiftool-perl libvips-dev build-essential libav-tools redis-server -y  

curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -  
sudo apt-get install -y nodejs

libav-tools will install avprobe, need to create a symbolic link so it can be use by fluent-ffmpeg.  
ln -s /usr/bin/avprobe /usr/bin/ffprobe  
ln -s /usr/bin/avconv /usr/bin/ffmpeg  


# Docker image
I've added a docker image to package the application with all the necessary
dependencies in one single container.
The docker image is built with the following command:

`` docker build . -t softbrix/shatabang ``

Please use the provided docker-compose.yml to spin up the instance. This will also
start the required redis server which will be used by the task processor.

`` docker-compose up -d ``

# Config
The application needs a config_server.json file with information regarding the
different folders and information about the authentication.
To create the configuration file it simplest if you run the shatabang_config.sh script from the root directory.

`` ./install_scripts/shatabang_config.sh ``
