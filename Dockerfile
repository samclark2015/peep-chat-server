FROM node

WORKDIR /app

ADD . /app

RUN npm install

EXPOSE 8080

CMD ["nodemon", "app.js"]
