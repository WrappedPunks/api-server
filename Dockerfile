#
# Base stage.
# This state install dependencies
#
FROM node:16.17.0-alpine3.16 AS builder

ENV BUILD_DIR=/usr/local/srv/build

RUN mkdir -p ${BUILD_DIR}
WORKDIR ${BUILD_DIR}

COPY . .

RUN npm install

#
# Production stage.
# This state copies JavaScript code from builder stage for production environment
#
FROM node:16.17.0-alpine3.16 AS runner

ENV APP_DIR=/usr/local/srv/app
ENV BUILD_DIR=/usr/local/srv/build
ENV PORT=8080

WORKDIR ${APP_DIR}

COPY --from=builder ${BUILD_DIR}/src ./src
COPY --from=builder ${BUILD_DIR}/index.js ./index.js
COPY --from=builder ${BUILD_DIR}/tsconfig.json ./tsconfig.json
COPY --from=builder ${BUILD_DIR}/node_modules ./node_modules

RUN ls -la

ENTRYPOINT [ "node", "./index.js" ]
