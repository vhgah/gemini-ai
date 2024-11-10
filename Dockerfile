FROM node:18.20-alpine

WORKDIR /var/www/html

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start:dev" ]
