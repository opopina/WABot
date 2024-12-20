const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');
require('dotenv').config();

// Inicializar Express
const app = express();
app.use(express.json());

// Inicializar el cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "whatsapp-bot",
        dataPath: "/root/WaAPI/.wwebjs_auth"
    }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: '/usr/bin/chromium-browser'
    }
});

// Manejar la generación del código QR
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Escanea el código QR con WhatsApp');
});

client.on('ready', () => {
    console.log('Cliente WhatsApp conectado!');
});

// Manejar mensajes entrantes
client.on('message', async msg => {
    console.log('=== Nuevo Mensaje ===');
    console.log({
        tipo: msg.type,
        origen: msg.from,
        esGrupo: msg.isGroup,
        nombre: msg._data.notifyName,
        cuerpo: msg.body,
        hora: new Date(msg.timestamp * 1000).toLocaleString()
    });
    
    // Ignorar mensajes de estados/historias
    if (msg.from === 'status@broadcast') {
        console.log('❌ Mensaje ignorado: Es un estado/historia');
        return;
    }

    try {
        await axios.post(`${process.env.N8N_WEBHOOK_URL}`, {
            message: msg.body,
            from: msg.from,
            fromName: msg._data.notifyName,
            timestamp: msg.timestamp,
            type: msg.type,
            isGroup: msg.isGroup
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.SECURITY_TOKEN}`
            }
        });
        console.log('✅ Mensaje enviado a n8n exitosamente');
    } catch (error) {
        console.error('❌ Error al enviar mensaje a n8n:', error.message);
    }
    
    console.log('==================\n');
});

// Endpoint para recibir mensajes desde n8n (múltiples rutas)
app.post(['/send-message', '/webhook', '/webhook-test', '/send-message/webhook', '/send-message/webhook-test'], async (req, res) => {
    const { to, message } = req.body;
    const authToken = req.headers.authorization?.split(' ')[1];

    if (authToken !== process.env.SECURITY_TOKEN) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    try {
        await client.sendMessage(to, message);
        res.json({ success: true });
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        res.status(500).json({ error: 'Error al enviar mensaje' });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});

// Iniciar el cliente de WhatsApp
client.initialize(); 