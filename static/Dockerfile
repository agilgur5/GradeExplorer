FROM node:5.4

# install node requirements
WORKDIR /code
COPY ./package.json ./package.json
RUN npm install -qq

# add source code
COPY ./ ./

# run watch script
CMD npm run watch
