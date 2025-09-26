# Production image for API
FROM node:20-alpine

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# Install dependencies
COPY package.json ./
RUN pnpm install

# Copy source
COPY tsconfig.json ./tsconfig.json
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client and build
RUN pnpm prisma:generate && pnpm build

EXPOSE 4000
CMD ["node", "dist/index.js"]