FROM node:24-alpine3.21

WORKDIR /app

RUN apk update && \
    apk add --no-cache tzdata

CMD ["date"]

COPY ./package.json .

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]