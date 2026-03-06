FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

EXPOSE 3001

ENV NODE_ENV=production

CMD ["npm", "start"]
