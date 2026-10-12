const admin = require("firebase-admin");

try {

    const serviceAccount = require("./washer-firebase-service-account.json");

    const washerAdmin = admin.initializeApp(
        {
            credential: admin.credential.cert(serviceAccount)
        },
        "washer-app"
    );

    console.log(
        `✅ Washer Firebase initialized successfully for project: ${serviceAccount.project_id}`
    );

    module.exports = washerAdmin;

} catch (error) {

    console.error(
        "❌ Washer Firebase initialization failed:",
        error.message
    );

    process.exit(1);

}