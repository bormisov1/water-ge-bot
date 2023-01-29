FROM node:16

# Create app directory
WORKDIR /usr/app

COPY package*.json tsconfig.json .env addresses.txt ./

RUN npm install
# RUN npm i -g ts-node \

CMD [ "npm", "run", "serve" ]
