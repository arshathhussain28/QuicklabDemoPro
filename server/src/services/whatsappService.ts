import axios from 'axios';

// Placeholder for WhatsApp Business API
// You need a Meta Developer Account and System User Token
export const sendWhatsAppNotification = async (to: string, templateName: string, parameters: any[]) => {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneId) {
        console.warn("WhatsApp credentials missing. Skipping notification.");
        return;
    }

    try {
        await axios.post(
            `https://graph.facebook.com/v17.0/${phoneId}/messages`,
            {
                messaging_product: 'whatsapp',
                to: to,
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: 'en_US' },
                    components: [
                        {
                            type: 'body',
                            parameters: parameters
                        }
                    ]
                }
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`WhatsApp sent to ${to}`);
    } catch (error: any) {
        console.error("WhatsApp Send Failed:", error.response?.data || error.message);
    }
};
