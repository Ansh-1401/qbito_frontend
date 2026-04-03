# Stage 1: Build the React Application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package maps
COPY package.json package-lock.json ./
RUN npm install

# Copy source and build
COPY . .
# When rendering the build, ensure the environment variables are injected physically (usually done via CI/CD pipelines)
RUN npm run build 

# Stage 2: Serve the App using Nginx
FROM nginx:alpine
# Copy the custom react-router config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled dist folder
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
