# ==========================================
# Stage 1: Build & Compile the Application
# ==========================================
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package management files to cache dependency layers
COPY package*.json ./

# Install ALL dependencies (including TypeScript/build tools)
RUN npm ci

# Copy the rest of your application source code
COPY . .

# Compile your code into production assets (e.g., outputs to a /dist folder)
RUN npm run build

# ==========================================
# Stage 2: Tiny Production Runtime Layer
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Enforce production optimization flags
ENV NODE_ENV=production

# Copy package files again to install only production blocks
COPY package*.json ./

# Install ONLY production dependencies (ignores devDependencies like build tools)
RUN npm ci --only=production

# Copy only the compiled JavaScript assets from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the internal port your Express server listens on (e.g., 5000)
EXPOSE 5000

# Run the compiled server executable
CMD ["node", "dist/server.js"]