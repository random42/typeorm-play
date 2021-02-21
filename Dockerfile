FROM node:15.9.0-alpine3.10

WORKDIR "/app"
# USER node
COPY . .
# EXPOSE 4000

ENV NODE_ENV="development"
ENV TZ="UTC"

RUN npm i && chmod -R u+x bin/
CMD ["npm", "run", "dev"]
