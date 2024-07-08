FROM node:alpine

RUN apt-get update \
    && apt-get install -y ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --ommit=dev

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
