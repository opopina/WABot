# WhatsApp Bot API

Bot de WhatsApp que se integra con n8n para el manejo de mensajes.

## Requisitos
- Node.js
- Chromium Browser
- npm

## Instalación
1. Clona el repositorio
2. Ejecuta `npm install`
3. Crea un archivo `.env` con las variables necesarias
4. Ejecuta `npm start`

## Variables de Entorno 
PORT=3000
N8N_WEBHOOK_URL=https://tu-instancia-n8n.com/webhook/...
SECURITY_TOKEN=tu-token-secreto

## Ejemplos de uso con curl

### Enviar mensaje
curl -X POST http://localhost:3000/send-message \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer tu-security-token" \\
-d '{
    "to": "5511999999999@c.us",
    "message": "Hola, esto es una prueba"
}'