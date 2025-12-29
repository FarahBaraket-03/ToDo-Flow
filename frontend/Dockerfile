# Stage 1: build
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies (use npm ci when lockfile present)
COPY package*.json ./
RUN npm ci --silent || npm install --silent

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:alpine

# Use our nginx conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from previous stage (Vite outputs to /dist)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
