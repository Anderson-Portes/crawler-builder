FROM node:20-alpine AS base
WORKDIR /app
# Instalar dependências necessárias para bibliotecas Node
RUN apk add --no-cache libc6-compat
# Copiar arquivos de package
COPY package.json package-lock.json ./
# Instalar dependências
RUN npm ci
# Copiar resto do projeto
COPY . .
# Desabilita telemetria do next
ENV NEXT_TELEMETRY_DISABLED 1
# O Next.js respeita a variável de ambiente PORT
# Executar desenvolvimento
CMD ["npm", "run", "dev"]