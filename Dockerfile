FROM ghcr.io/puppeteer/puppeteer:22.4.0

ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/user/bin/google-chrome-stable

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["node", "index.js"]