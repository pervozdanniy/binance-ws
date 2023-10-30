FROM node:20-alpine

WORKDIR /usr/src

COPY package*.json ./
COPY prisma/ prisma/
RUN npm install

EXPOSE 3000

ENTRYPOINT [ "node_modules/.bin/nest" ]
