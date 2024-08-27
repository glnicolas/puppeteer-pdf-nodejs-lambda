# Imagen base de AWS Lambda para Node.js 16
FROM public.ecr.aws/lambda/nodejs:20-x86_64

# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm && \
#     yum install -y google-chrome-stable_current_x86_64.rpm

# Copiar package.json y package-lock.json e instalar dependencias
COPY . .
RUN ls -R /
RUN ls -R .
# WORKDIR .
# COPY package*.json ./

RUN npm install 
# Instalar Chromium usando Puppeteer
# RUN npx puppeteer browsers install chrome

# RUN ls -R /var/task

# Copiar el resto del código de la aplicación
# COPY . .

# Establecer el manejador de la Lambda
CMD ["index.handler"]
