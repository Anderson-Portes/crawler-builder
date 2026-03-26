FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
# Instalação de dependências do sistema caso precisemos compilar pacotes ou psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libxfixes3 \
    libxrender1 \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*
# Copiando apenas requirements primeiro para build em cache
COPY requirements.txt .
# Instala dependências do Python confiando nos hosts para evitar erros de SSL do proxy
RUN pip install --no-cache-dir \
    --trusted-host pypi.org \
    --trusted-host files.pythonhosted.org \
    --trusted-host pypi.python.org \
    -r requirements.txt
# Instalação do Playwright e navegadores necessário
# NODE_TLS_REJECT_UNAUTHORIZED=0 é usado para ignorar erros de SSL do proxy durante o download
RUN NODE_TLS_REJECT_UNAUTHORIZED=0 playwright install chromium
# Copiando aplicação (no docker-compose.yml é mapeado com volume para dev, mas bom manter aqui)
COPY . .
# O app usa a variável de ambiente PORT definida no runtime
CMD ["python", "run.py"]