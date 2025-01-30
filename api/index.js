require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4000;

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
    } catch (error) {
        console.error("❌ Error sending message:", error.response ? error.response.data : error.message);
    }
}

// API Endpoint to Trigger WhatsApp Message
app.get('/send-message', async (req, res) => {
    await sendWhatsAppMessage();
    res.send("WhatsApp message sent!");
});

// Start the Express Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));