# OmniCore API - WhatsApp CRM Backend

Este es el backend de la plataforma OmniCore, construido con **NestJS**, **Prisma** y **Socket.io**. Se encarga de la integración con la API de WhatsApp Cloud (Meta) y la comunicación en tiempo real con el panel de Angular.

## 🚀 Requisitos previos

- Node.js (versión 18 o superior)
- Una base de datos PostgreSQL (el proyecto está configurado para usar **Neon.tech**)
- Una cuenta de Desarrollador en Meta con la API de WhatsApp configurada.

## 📦 Instalación y Configuración

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Crea o edita el archivo `.env` en la raíz del proyecto:
   ```env
   DATABASE_URL="tu_url_de_postgres"
   PORT=3000
   WHATSAPP_TOKEN="tu_access_token_de_meta"
   WHATSAPP_PHONE_ID="id_de_tu_numero"
   WHATSAPP_VERIFY_TOKEN="omnicore_secreto_2026"
   ```

3. **Preparar Prisma:**
   Genera el cliente de base de datos para habilitar el tipado de TypeScript:
   ```bash
   npx prisma generate
   ```

## 🛠️ Ejecución del proyecto

Para iniciar el servidor en modo desarrollo con recarga automática:

```bash
npm run start:dev
```

El servidor estará escuchando en `http://localhost:3000`.

## 🌐 Exponer el Servidor Local (Webhooks)

Para que WhatsApp (Meta) pueda enviar notificaciones a tu máquina local, necesitas exponer tu `localhost` de forma segura.

1. **Iniciar el túnel con Ngrok:**
   ```bash
   npx ngrok http 3000
   ```

2. **Configurar el Webhook en Meta:**
   - Copia la URL `https://...` generada por ngrok.
   - En el panel de Meta Developer, pega la URL añadiendo `/whatsapp/webhook` al final.
   - Ejemplo: `https://abcdef123.ngrok-free.app/whatsapp/webhook`
   - El **Verify Token** debe ser el mismo que definiste en tu `.env`.

## 📁 Estructura del Proyecto

- `src/whatsapp`: Lógica principal de procesamiento de mensajes y webhooks.
- `src/prisma`: Servicio de conexión y cliente de base de datos.
- `src/websockets`: Gateway para comunicación en tiempo real con el frontend.
- `prisma/schema.prisma`: Definición del modelo de datos (Contactos, Mensajes, Organizaciones).

## 🧪 Tests No para levantar en local

```bash
# Unitarios
npm run test

# E2E
npm run test:e2e
```

---
Desarrollado para OmniCore CRM.
