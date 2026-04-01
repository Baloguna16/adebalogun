# Start from a base image with Node.js and Yarn installed
FROM node:18.12.0 as build

WORKDIR /app
COPY . /app

RUN npm install -g typescript
RUN yarn install --production
RUN yarn build

FROM nginx:alpine

RUN apk add --no-cache nginx-module-njs

COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/nginx/og_inject.js /etc/nginx/og_inject.js

# Load njs module
RUN echo 'load_module modules/ngx_http_js_module.so;' | cat - /etc/nginx/nginx.conf > /tmp/nginx.conf && mv /tmp/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]