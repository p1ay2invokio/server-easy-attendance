FROM node:24-alpine3.21

WORKDIR /app

COPY ./package.json .

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "start"]