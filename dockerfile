FROM node:18-alpine
RUN mkdir -p /src/app
WORKDIR /src/app
COPY package.json /src/app/package.json
COPY package-lock.json /src/app/package-lock.json
COPY .env  /src/app/.env 
COPY bot.js /src/app/bot.js
RUN npm install
COPY . /src/app
EXPOSE 3000
CMD ["node", "bot.js"]