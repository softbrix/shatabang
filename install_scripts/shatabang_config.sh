#!/bin/bash

#configure config json
read -p "Enter port > " -e port

read -p "Enter storage folder > " -e storage

read -p "Enter cache folder > " -e cache

while [[ -z "${password// /}" ]]
do
  read -p "Enter admin password > " -s p
  echo ""

  read -p "Enter same admin password again > " -s p2
  echo ""

  if [ "$p" != "$p2" ]
  then
    echo "Passwords doesn't match. Try again."
  else
    salt="$(date | shasum | awk '{print $1}')"
    password="$(echo -n -e "$p$salt" | shasum -a 256 | awk '{print $1}')"
  fi
done

config_file="{\n  \"port\" : \"$port\",\n  \"storageDir\" : \"$storage\",\n  \"cacheDir\" : \"$cache\",\n  \"server_salt\" : \"$salt\",\n  \"admin_hash\" : \"$password\"\n}"

echo -e "Writing config file: \n $config_file"

echo -e "$config_file" > config_server.json

upnpc -e 'Shatabang image library' -r $port
