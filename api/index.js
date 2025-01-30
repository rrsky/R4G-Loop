require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4000;

// Root Route - Shows a friendly message instead of "Cannot GET /"
app.get("/", (req, res) => {
    res.send("🚀 WhatsApp API is running on Vercel!");
});

// Function to send WhatsApp message
async function sendWhatsAppMessage() {
    try {
        const response = await axios.post(
            `${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: process.env.WHATSAPP_RECIPIENT_PHONE,
                type: "text",
                text: { body: "Hello! This is a test message from WhatsApp Cloud API 🚀" }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );
        console.log("✅ Message sent successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error sending message:", error.response ? error.response.data : error.message);
        throw error;
    }
}

// API Route to Trigger WhatsApp Message
app.get('/send-message', async (req, res) => {
    try {
        const result = await sendWhatsAppMessage();
        res.json({ success: true, message: "WhatsApp message sent!", response: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Export the app (Vercel will use this)
module.exports = app;