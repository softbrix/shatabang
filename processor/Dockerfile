FROM softbrix/shatabang-base:latest
LABEL author="Andreas Sehr"

WORKDIR /usr/src/shatabang

COPY processor/*.json ./
COPY processor/*.js ./
COPY processor/modules ./modules
COPY processor/common ./common
COPY processor/workers ./workers

# Install app dependencies whitout removing node_modules folder
RUN cat package.json
RUN npm install --only=production 
# && \
# Create empty config
RUN echo '{}' > config_server.json 
RUN ls -la *

# &&

# USER node

CMD node main.js
