sed -i -e "s#/replacemeurl/#$BASE_URL#g" client/dist/index.html && \
echo "Starting with root url: $BASE_URL" && \
npm run start
