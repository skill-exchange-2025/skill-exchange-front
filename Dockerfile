# Build stage
FROM node:20.13.1 AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Clean npm cache and reinstall to avoid optional dependency issues
RUN npm cache clean --force \
  && rm -rf node_modules package-lock.json \
  && npm install

# Copy source code
COPY . .

# Build the application using Vite
RUN npm run build

# Development stage
FROM node:20.13.1 AS development

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm cache clean --force \
  && rm -rf node_modules package-lock.json \
  && npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Production stage
FROM nginx:alpine

# Copy the built app to nginx (Vite outputs to dist by default)
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add runtime configuration for API URL
RUN echo 'window.RUNTIME_CONFIG = { API_URL: "/api" };' > /usr/share/nginx/html/config.js

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
