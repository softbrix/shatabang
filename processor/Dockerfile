FROM softbrix/shatabang-base:latest
LABEL author="Andreas Sehr"

WORKDIR /app

COPY processor/*.json ./

# Install app dependencies whitout removing node_modules folder
RUN npm install --only=production 

COPY processor/*.js ./
COPY processor/modules ./modules
COPY processor/common ./common
COPY processor/workers ./workers

# Create empty config
RUN echo '{"mongoHost":"mongo"}' > config_server.json 

# USER node

CMD node main.js
