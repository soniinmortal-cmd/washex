const axios = require("axios");

const sendWhatsappOtp = async (mobileNumber, otp) => {
    console.log("whatsapp service called from inside");
    const message = `Welcome to Washex! Your one-time password (OTP) is ${otp}. It is valid for 10 minutes. Keep this code confidential`;

    try {
        const response = await axios.get(
            "http://wa.azmobia.com/api/http-authkey.php",
            {
                params: {
                    authkey: process.env.WHATSAPP_AUTHKEY,
                    route: 2,
                    number: mobileNumber,
                    message
                }
            }
        );
        console.log("Sending to:", mobileNumber);

        console.log("WhatsApp Response:", response.data);
        console.log("Status:", response.status);

        return response.data;
    } catch (error) {
        console.log("WhatsApp Error:");

        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }

        throw error;
    }
};

const sendSmsOtp = async (mobileNumber, otp) => {
    console.log("SMS service called from inside");

    const message = `Dear User, ${otp} is your one-time password (OTP) to log in to your www.washex.in account. Please do not share this OTP - Washex Hospitality Solutions`;

    try {
        const response = await axios.get(
            "http://sms.azmobia.com/http-tokenkeyapi.php",
            {
                params: {
                    "authentic-key": process.env.AZMOBIA_AUTH_KEY,
                    senderid: "WSHX",
                    route: 1,
                    number: mobileNumber,
                    message,
                    templateid: "1777178653740753812"
                }
            }
        );

        console.log("Sending SMS to:", mobileNumber);
        console.log("SMS Response:", response.data);
        console.log("Status:", response.status);

        return response.data;

    } catch (error) {
        console.log("SMS Error:");

        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        } else {
            console.log(error.message);
        }

        throw error;
    }
};



module.exports = {
    sendSmsOtp,
    sendWhatsappOtp
};