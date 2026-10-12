const { randomUUID } = require("crypto");

const LoggedOutUser = require("../models/index").LoggedOutUser;

const loggedOut=async(userId)=>{
    if(!userId){
        throw new Error("user id required");
    }

    await LoggedOutUser.upsert({
        userId : userId,
        isLoggedOut : '0'
    })

    return;
}

const loggedIn=async(userId)=>{
    if(!userId){
        throw new Error("user id required");
    }

    for (let i = 0; i < 3; i++) {
        try {
            const sessionId = randomUUID();

            await LoggedOutUser.upsert({
                userId,
                sessionId,
                isLoggedOut: "1"
            });

            return sessionId;
        } catch (err) {
            if (err.name !== "SequelizeUniqueConstraintError") {
                throw err;
            }
        }
    }

    throw new Error("Unable to generate unique session ID");

    await LoggedOutUser.upsert({
        userId : userId,
        isLoggedOut : '1',
        sessionId
    })

    return sessionId;
}

module.exports={
    loggedOut,
    loggedIn
}