# gopher

A gopher server implementation in node

### Development

This project uses node version 12, if using nvm, run `nvm use 12`

Run `yarn build:watch` and then in another tab run `yarn start`

Change the port variable in the env file to serve on a specific port

### Production

Run `export NODE_ENV=production` before starting the node process.
Make sure that the "HOST" and "PORT" environment variables have been set in the .env file.
HOST should be something like gopher.koryporter.com or an IP address
To start the server on the EC2 instance: `pm2 start 2 --node-args="-r dotenv/config"`