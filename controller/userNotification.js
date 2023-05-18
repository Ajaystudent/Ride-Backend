import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient();
import FCM from "fcm-node";


const fcmNotification = async (req, res) => {
    try {
        const { id, userType, msgBody } = req.body;
        let deviceId = "";
        if (userType == "User") {
            const user = await prisma.user.findFirst({
                where: {
                    id
                }
            })
            deviceId = user.deviceId;
        }
        if (userType == "Driver") {
            const driver = await prisma.driver.findFirst({
                where: {
                    id
                }
            })
            deviceId = driver.deviceId;
        }
        const serverKey = "AAAAcGbghqQ:APA91bFiAOuSXhgdBCeabJMGceOGk6D-ElOmDfMpWy6SAIGDu3rPdUI4jdnOVXaQhigRq7_oBmda0PJjzQKyoDequQ9GXmngHu8oVkSeEViZNUjYE9BvnTHNlJIuGflOC-n6xRnSiWfA";
        const fcm = new FCM(serverKey);
        const message = {
            to: deviceId,
            collapse_key: "Test",
            notification: {
                title: `Ride`,
                body: msgBody,
            },
            data: {
                message: msgBody,
            },
        };
        fcm.send(message, function (err, response) {
            if (err) {
                console.log("Something has gone wrong!", err);
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });
        res.status(200).json({ message: 'Successfully sent with response', data: msgBody });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export { fcmNotification }
