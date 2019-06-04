#!/bin/sh

# Replacing rootUrl variable in index.html with value from docker environment
BASE_URL_ENCODED=$(echo $BASE_URL | sed -e 's:/:%2F:g' -e 's^:^%3A^g') && \
sed -i -e "s#/replacemeurl/#$BASE_URL#g" client/dist/index.html && \
sed -i -e "s#%2Freplacemeurl%2F#$BASE_URL_ENCODED#g" client/dist/index.html && \

echo "Starting with root url: $BASE_URL" && \

node server.js &
node task_processor.js
