FROM node:12

WORKDIR /app

# Set timezone
ENV TZ=Europe/Madrid
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

ENV PATH /app/node_modules/.bin:$PATH

# Install app dependencies
COPY package*.json /app/

RUN npm install
RUN npm install react-scripts@3.0.1 -g

# CMD ["npm", "start"]
CMD ["npm", "run", "server"]
