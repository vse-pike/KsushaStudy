FROM node:19-alpine
WORKDIR /integration-test

COPY ./Integration-tests ./
RUN npm install

ENTRYPOINT ["npm", "test"]
