# Stage 1: Build ứng dụng
FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_API_GATEWAY_URL
ARG VITE_CHAT_SOCKET_URL
ENV VITE_API_GATEWAY_URL=$VITE_API_GATEWAY_URL
ENV VITE_CHAT_SOCKET_URL=$VITE_CHAT_SOCKET_URL

# Copy package files để cài dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ code và build
COPY . .
RUN npm run build

# Stage 2: Chạy với Nginx
FROM nginx:stable-alpine
# Copy file cấu hình Nginx mới vào
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
