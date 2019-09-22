FROM node:12

WORKDIR /app

COPY . .

RUN yarn
RUN yarn build-server
CMD ["yarn", "start-server:prod"]
