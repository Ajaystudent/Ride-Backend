import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient();
import FCM from "fcm-node";


const fcmNotification = async (req, res) => {
    try {
        const { mobileNumber, userType, msgBody } = req.body;
        let deviceId = "";
        if (userType == "User") {
            const user = await prisma.user.findFirst({
                where: {
                    mobileNumber
                }
            })
            deviceId = user.deviceId;
        }
        if (userType == "Driver") {
            const driver = await prisma.driver.findFirst({
                where: {
                    mobileNumber
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

const sendNotification = async (req, res) => {
    try {
        const { city, vehicleType, msgBody } = req.body;
        const driver = await prisma.driver.findMany({
            where: {
                city,
                vehicleType
            }
        })
        console.log(driver)
        for (let i = 0; i < driver.length; i++) {
            const serverKey = "AAAAcGbghqQ:APA91bFiAOuSXhgdBCeabJMGceOGk6D-ElOmDfMpWy6SAIGDu3rPdUI4jdnOVXaQhigRq7_oBmda0PJjzQKyoDequQ9GXmngHu8oVkSeEViZNUjYE9BvnTHNlJIuGflOC-n6xRnSiWfA";
            const fcm = new FCM(serverKey);
            const message = {
                to: driver[i].deviceId,
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
        }
        res.status(200).json({ message: 'Successfully sent with response', data: msgBody });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const rideBooking = async (req, res) => {
    try {
        const { userMobile, driverMobile, currentCity, pickupTime, destinationCity, travelDate,status } = req.body;
        const driver = await prisma.driver.findMany({
            where: {
                mobileNumber: driverMobile
            }
        })
        const user = await prisma.user.findMany({
            where: {
                mobileNumber: userMobile
            }
        })
        const date = new Date(travelDate)
        const pickup = new Date(pickupTime);
        const booking = await prisma.rideBooking.create({
            data:{
                userMobile:userMobile,
                driverMobile:driverMobile,
                userName:user[0].userName,
                driverName:driver[0].driverName,
                currentCity:currentCity,
                destinationCity:destinationCity,
                travelDate:date,
                pickupTime:pickup,
                status:status
            }
        })
        res.status(200).json({ message: 'Successfully sent with response', data: booking });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}



export { fcmNotification, rideBooking, sendNotification }
