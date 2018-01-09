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

brew tap homebrew/science
sudo brew install exiftool redis opencv@2
brew link --force opencv@2

## Debian ( >= 9):

sudo apt-get update  
sudo apt-get install git libimage-exiftool-perl libvips-dev build-essential ffmpeg redis-server -y  

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -  
sudo apt-get install -y nodejs

## Debian ( < 9):

sudo apt-get update  
sudo apt-get install git libimage-exiftool-perl libvips-dev build-essential libav-tools redis-server -y  

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -  
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

The application can use a configured with a file or with environment variables.
The environment variables will be used primarily and the config values in the
file if not configured in the context.
Configurable settings is regarding the different folders and settings about the
 authentication.

 | Env       | Config file  | Default value | Description                          |
 | --------- | -------------| ------------- | ------------------------------------ |
 | BASE_URL  | baseUrl      | '/'           | The url this application is served at, needs to be configured if using authentication with redirection or if the application is not in the root of the server context |
 | PORT      | port         | 3000          | The port number the server is exposing |
 | SERVER_SALT | serverSalt | -             | This should be a unique hash for the server |
 | ADMIN_HASH  | adminHash  | -             | The unique hash for the admin password |
 | STORAGE_DIR | storageDir | -             | The path to the root for the media storage |
 | CACHE_DIR   | cacheDir   | -             | The path to the root for the media cache |
 | REDIS_PORT_6379_TCP_ADDR | redisHost | '127.0.0.1' | The host to the redis server |
 | REDIS_PORT_6379_TCP_PORT | redisPort | 6379 | The port to the redis server |
 | GOOGLE_AUTH       | google_auth object | - | Read more in the [following chapter](#google-authentication) |
 | GOOGLE_AUTH_ALLOW | google_auth.allowed_ids | - | ^^|

## by Environment variables
The docker compose file will list all configurable variables with a leading underscore.

Set the environment variable before starting the application.

## by File

To create the configuration file it simplest if you run the shatabang_config.sh script from the root directory.

`` ./install_scripts/shatabang_config.sh ``

This will ask you all the necessary questions and write the answers to a
**config_server.json** file.

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

# Index information

The following properties are indexed for each media file.

- a, aspect ratio
- b, blur
- r, rating
- s, file size

# Why Shatabang
Now days it's hard to come up with a unique name both on companies and products.
One morning during the summer of 2016 I shouted "Shatabang" when I solved one
of the problems I was working with. I guess it was some what inspired by Alkimedes
who shouted Eureka when he found Archimedes' principle. Although heureka already
had a meaning (I have found (it)), the meaning of Shatabang is still to be defined.

My personal definition of Shatabang is: _I have solved it!_
