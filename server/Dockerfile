FROM node:lts
LABEL author="Andreas Sehr"

ENV CLIENT_SOURCE https://github.com/softbrix/shatabang-web/releases/download/v0.3.7/shatabang-web--v0.3.7-106.tar.gz
ENV SERVER_SALT 6548ee70d7d258e34eaf4daf9d8c30214bf8163e
ENV ADMIN_HASH 98962591ddd626a5857a82e4ad876975e71e1a9cf586ff4cc4c57eb453d172cd
ENV BASE_URL /
ENV PORT 3000
ENV STORAGE_DIR /mnt/sorted/
ENV CACHE_DIR /mnt/cache/

WORKDIR /usr/src/shatabang

COPY server/*.json /usr/src/shatabang/
COPY server/*.js /usr/src/shatabang/
COPY server/docker_start.sh .
COPY server/routes routes/
COPY server/node_modules_local node_modules_local/
COPY modules common/

# Install app dependencies whitout removing node_modules folder
RUN npm install --only=production && \
# Create empty config
  echo '{}' > config_server.json && \
  chmod +x docker_start.sh && \
# Fetch client
  mkdir client && \
  curl -s -L ${CLIENT_SOURCE} | tar -xvz -C client

# USER node

EXPOSE 3000
CMD ./docker_start.sh && sh
