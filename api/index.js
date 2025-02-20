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
        const url = `${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
        console.log("🔍 Sending request to:", url);

        const response = await axios.post(
            url,
            {
                messaging_product: "whatsapp",
                to: process.env.WHATSAPP_RECIPIENT_PHONE,
                type: "template",
                template: {
                    name: "reminder_6questions",  // Your template name
                    language: { code: "en" }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ Template message sent successfully:", response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error("❌ Error sending message:", error.response.data);
            return error.response.data;
        } else {
            console.error("❌ Error sending message:", error.message);
            return { success: false, error: error.message };
        }
    }
}

// API Route to Trigger WhatsApp Message (Used for cron-job.org)
app.get('/send-message', async (req, res) => {
    console.log(`🔍 Incoming request from: ${req.ip} at ${new Date().toISOString()}`);

    try {
        const result = await sendWhatsAppMessage();
        res.json({ success: true, message: "WhatsApp message sent!", response: result });
    } catch (error) {
        console.error("❌ Error processing request:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the Express Server (Only for local testing, Vercel handles this in deployment)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

// Export the app (Required for Vercel deployment)
module.exports = app;