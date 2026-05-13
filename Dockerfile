FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server.js ./
COPY scripts ./scripts
COPY public ./public

RUN mkdir -p /app/sites /app/uploads \
 && echo '{"sites":[]}' > /app/sites.json

ENV PORT=3000
EXPOSE 3000

VOLUME ["/app/sites", "/app/uploads"]

CMD ["node", "server.js"]
