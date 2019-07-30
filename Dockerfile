FROM softbrix/shatabang-base:latest
LABEL author="Andreas Sehr"

ENV CLIENT_SOURCE https://github.com/softbrix/shatabang-web/releases/download/v0.3.7/shatabang-web--v0.3.7-106.tar.gz
ENV SERVER_SALT 6548ee70d7d258e34eaf4daf9d8c30214bf8163e
ENV ADMIN_HASH 98962591ddd626a5857a82e4ad876975e71e1a9cf586ff4cc4c57eb453d172cd
ENV BASE_URL /
ENV PORT 3000

WORKDIR /usr/src/shatabang

COPY *.json /usr/src/shatabang/
COPY *.js /usr/src/shatabang/
COPY docker_start.sh .
COPY modules modules/
COPY task_processors task_processors/
COPY routes routes/
COPY node_modules_local node_modules_local/

# Install app dependencies whitout removing node_modules folder
RUN npm install --only=production && \
# Create empty config
  echo '{}' > config_server.json && \
  chmod +x docker_start.sh && \
# Fetch client
  curl -s -L ${CLIENT_SOURCE} | tar -xvz -C client

# USER node

EXPOSE 3000
CMD ./docker_start.sh && sh
