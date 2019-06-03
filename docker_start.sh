sed -i -e "s#/replacemeurl/#$BASE_URL#g" client/dist/index.html && \
echo "Starting with root url: $BASE_URL" && \
node server.js &
node task_processor.js
