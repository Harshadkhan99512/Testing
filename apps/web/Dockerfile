# Production image for Web
FROM node:20-alpine

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# Install deps
COPY package.json ./
RUN pnpm install

# Copy source
COPY . .

# Build
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]