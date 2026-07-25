FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install -g npm@11
RUN NODE_ENV=development npm ci --include=dev --no-audit --no-fund


COPY . .

RUN NODE_ENV=development npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
