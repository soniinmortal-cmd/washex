const admin = require("firebase-admin");

try {

    const serviceAccount = require("./firebase-service-account.json");

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log(
        `✅ Firebase initialized successfully for project: ${serviceAccount.project_id}`
    );

} catch (error) {

    console.error(
        "❌ Firebase initialization failed:",
        error.message
    );

    process.exit(1);
}

module.exports = admin;