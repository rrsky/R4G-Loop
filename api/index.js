require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4000;

// Root Route - Shows a friendly message instead of "Cannot GET /"
app.get("/", (req, res) => {
    res.send("🚀 WhatsApp API is running on Vercel!");
});

// Function to send WhatsApp message based on recipient group
async function sendWhatsAppMessage(recipientGroup = "EU") {
    const euRecipients = [
        { key: "RR", phone: process.env.WHATSAPP_RECIPIENT_PHONE_RR, url: process.env.WHATSAPP_PERSONALIZED_URL_RR },
        { key: "DC", phone: process.env.WHATSAPP_RECIPIENT_PHONE_DC, url: process.env.WHATSAPP_PERSONALIZED_URL_DC },
        { key: "DC2", phone: process.env.WHATSAPP_RECIPIENT_PHONE_DC2, url: process.env.WHATSAPP_PERSONALIZED_URL_DC2 },
        { key: "MR", phone: process.env.WHATSAPP_RECIPIENT_PHONE_DC3, url: process.env.WHATSAPP_PERSONALIZED_URL_MR }
    ];

    const usRecipients = [
        { key: "VA", phone: process.env.WHATSAPP_RECIPIENT_PHONE_VA, url: process.env.WHATSAPP_PERSONALIZED_URL_VA }
    ];

    // Determine recipients based on the group
    let recipients = [];
    if (recipientGroup.toUpperCase() === "EU") {
        recipients = euRecipients; 
    } else if (recipientGroup.toUpperCase() === "US") {
        recipients = usRecipients; 
    }

    if (recipients.length === 0) {
        console.log(`❌ No recipients found for group: ${recipientGroup}`);
        return { success: false, error: `No recipients found for group: ${recipientGroup}` };
    }

    for (const recipient of recipients) {
        try {
            const url = `${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
            console.log(`🔍 Sending request to ${recipient.phone} with URL: ${recipient.url}`);

            const response = await axios.post(
                url,
                {
                    messaging_product: "whatsapp",
                    to: recipient.phone,
                    type: "template",
                    template: {
                        name: "6questions_multirecipient",
                        language: { code: "en" },
                        components: [
                            {
                                type: "body",
                                parameters: [
                                    { type: "text", text: recipient.url }
                                ]
                            }
                        ]
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log(`✅ Message sent successfully to ${recipient.phone}:`, response.data);
        } catch (error) {
            console.error(`❌ Error sending message to ${recipient.phone}:`, error.response ? error.response.data : error.message);
        }
    }
}

// API Route to Trigger WhatsApp Messages Based on Group
app.get('/send-message', async (req, res) => {
    console.log(`🔍 Incoming request from: ${req.ip} at ${new Date().toISOString()}`);

    const recipientGroup = req.query.recipient || "EU"; // Default to EU

    try {
        const results = await sendWhatsAppMessage(recipientGroup);
        res.json({ success: true, message: `WhatsApp messages sent to: ${recipientGroup}`, results });
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