FROM node:17

WORKDIR "/opt/TwitchPlaneBot/"
COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "start" ]
