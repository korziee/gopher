FROM node:12

WORKDIR /app
COPY . .

RUN yarn
RUN yarn build
CMD ["yarn", "start:prod"]
