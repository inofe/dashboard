# Use Node.js LTS Alpine image for smaller size
FROM node:18-alpine

# Production mode for smaller installation
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production || npm install --only=production

# Copy application code
COPY . .

# Expose port (dynamic from ENV)
EXPOSE ${PORT}

# Start the application
CMD ["node", "server.js"]