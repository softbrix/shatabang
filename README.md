# The Shatabang
This repository contains the source code for the Shatabang web application.
The application has been developed to solve a one of my own problems and
is supposed to be used to maintain an image and video library. The web
application is the core of the platform and the web client is supposed to use
modern frameworks and be platform independent. It includes several external tools
which you can read about further down in this document.

The Shatabang image and video library orders all imported media files in
chronological order, and include the following features:
 - Exif information extraction
 - Resize to web optimal size
 - Download the original file from the server
 - Detect and block import of image duplicates
 - Face detection
 - Authentication with basic or Google
 - Infinite image scroll in web client
 - Responsive web interface which suits desktop, pads as well as mobile screens.

The following features are under development:
 - Search and filter based on
  - the exif/meta information
  - the date
  - the location
 - Add/Edit/delete meta information on single and multiple images  
 - Face identification with Eigen-faces or similar
 - Manage the trash bin
 - Create public gallery
 - Group similar images
 - Other authentication methods
 - Authorization of media files between users


## External library dependencies

This is a list of all the external library dependencies which must be installed on the machine for the the application to work properly.

#### Node js

The platform upon which the application is built.

#### Exiftool

To read exif info from images.

#### libvips

One of the fastest libraries to resize and transform images.

#### ffmpeg

To resize videos and extract images from different time frames.

#### Open CV

To identify objects in the images.

#### Redis

A key-value in memory NoSQL database used by the session and task processor.

### Install the external dependencies

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

## Google authentication

It is possible to configure the application in two ways. Either with the
config_server.json or with environment variables. The configuration file is
preferred and the environment variable support is mainly for docker container.

You can configure the google oauth2 credentials at
https://console.developers.google.com/apis/credentials.

### config_server.json

Add a new key called "google_auth" and add the following variables in an object:

- "clientID", the unique application ID
- "clientSecret", the unique application client secret
- "callbackURL", the url a successful sign in should return to. This should be your applications hostname.
- "allowed_ids", an array with either valid user id's or user emails.

### Environment variables

Add the following environment variables
- GOOGLE_AUTH with the clientID and clientSecret joined with a ':', ie clientID:clientSecret.
- GOOGLE_AUTH_CALLBACK with the url a successful authentication should return to.
- GOOGLE_AUTH_ALLOW with a comma separated list of either user id's or emails.

# Why Shatabang
Now days it's hard to come up with a unique name both on companies and products.
One morning during the summer of 2016 I shouted "Shatabang" when I solved one
of the problems I was working with. I guess it was some what inspired by Alkimedes
who shouted Eureka when he found Archimedes' principle. Although heureka already
had a meaning (I have found (it)), the meaning of Shatabang is still to be defined.

My personal definition of Shatabang is: _I have solved it!_
