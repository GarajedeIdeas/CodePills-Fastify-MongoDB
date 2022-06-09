FROM node:14-alpine AS node

# Builder stage

FROM node AS builder

# Use /app as the CWD
WORKDIR /app       

# We need this to inspect the container with a live session
RUN apk add --no-cache bash

# Copy package.json and package-lock.json to /app
COPY package*.json ./   

# Install all dependencies
RUN npm i               

# Copy the rest of the code
COPY . .                

# Invoke the build script to transpile ts code to js
RUN npm run build    

# Open desired port
EXPOSE 8080

# Final stage

FROM node AS final

# Set node environment to production
ENV NODE_ENV production

# Update the system
RUN apk --no-cache -U upgrade

# Prepare destination directory and ensure user node owns it
RUN mkdir -p /home/node/app/build && chown -R node:node /home/node/app

# Set CWD
WORKDIR /home/node/app

# Install PM2
RUN npm i -g pm2

# Copy package.json, package-lock.json and process.yml
COPY package*.json process.yml ./

# Switch to user node
USER node

# Install libraries as user node
RUN npm i --only=production

# Copy js files and change ownership to user node
COPY --chown=node:node --from=builder /app/build ./build

# Copy dokku configurations
COPY --chown=node:node CHECKS ./CHECKS

# Open desired port
EXPOSE 8080

ENTRYPOINT [ "pm2-runtime", "./process.yml" ]