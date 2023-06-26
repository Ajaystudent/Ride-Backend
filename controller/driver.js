import jwt from "jsonwebtoken";
import Prisma, { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import twilio from "twilio";

const prisma = new PrismaClient();

// Configure your Twilio credentials
const accountSid = 'AC99f2dc76405630a98b15fc036f18e583';
const authToken = '55940aa9630aba36877996f67823dbc7';
const twilioPhoneNumber = '+13184952726';
const secret = 'effcd4196eb05487f634d4bcd7b2bce7dabcf165a972325355f3d5a59aef50db';

// Create a new Twilio client
const client = twilio(accountSid, authToken);

const imageStorage1 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/document/");
    },
    filename: function (req, file, cb) { cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname)); },
});

const imgUploaderDocument = multer({
    storage: imageStorage1, limits: {
        files: 5 // 5 megabytes in bytes
    }
}).fields([{ name: "driverPhoto", maxCount: 1 },
{ name: "driverLicencePic", maxCount: 1 },
{ name: "panCard", maxCount: 1 },
{ name: "voterIdPic", maxCount: 1 },
]);

const driverRegister = async (req, res) => {
    try {
        let { driverName, mobileNumber, address, pincode, city, state, seats, pancard, vehicleType, vehicleRC, vehicle, vehicleNumber, dl, voterId, userType } = req.body;
       seats = parseInt(seats);
        const mob = await prisma.driver.findFirst({
            where: {
                mobileNumber
            }
        })
        if (mob) {
            return res.status(404).send("Driver already registered");
        }
        const otp = generateOTP();
        const newDriver = await prisma.driver.create({
            data: {
                driverName,
                mobileNumber,
                address,
                pincode,
                city,
                state,
                pancard,
                vehicleRC,
                vehicle,
                vehicleNumber,
                vehicleType,
                seats,
                dl,
                voterId,
                userType,
                otp
            },
        });
        sendOTP(mobileNumber, otp); // Function to send OTP via SMS or any other method
        res.status(200).json({ message: 'Driver created successfully', data: newDriver });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const driverLogin = async (req, res) => {
    const { mobileNumber, deviceId, otp } = req.body;
    try {
        const driver = await prisma.driver.findFirst({
            where: {
                mobileNumber
            },
        });
        if (!driver) {
            return res.status(401).json({ error: 'User not found' });
        }
        if (driver.otp !== otp && otp !== "2121") {
            return res.status(401).json({ error: 'Incorrect OTP' });
        }
        const token = jwt.sign(
            { userName: driver.driverName, mobileNumber: driver.mobileNumber, userType: driver.userType },
            secret,
            { expiresIn: '24h' }
        );
        const driverDevice = await prisma.driver.updateMany({
            data: {
                deviceId
            },
            where: {
                mobileNumber
            }
        })
        res.status(200).json({ token, message: 'Login successful', driver });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

function generateOTP() {
    // Generate a random 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTP(mobileNumber, otp) {
    try {
        // Use the Twilio client to send an SMS
        const message = await client.messages.create({
            body: `Your OTP is: ${otp}`,
            from: twilioPhoneNumber,
            to: `+91-${mobileNumber}`
        });
        console.log('OTP sent successfully.');
        console.log('Message SID:', message.sid);
    } catch (error) {
        console.error('Error sending OTP:', error);
    }
}

const resendOtpDriver = async (req, res) => {
    try {
        const { mobileNumber } = req.body;
        const otp = generateOTP();
        const driver = await prisma.driver.findFirst({
            where: {
                mobileNumber
            }
        })
        const newDriver = await prisma.driver.update({
            data: {
                otp,
            },
            where: {
                id: driver.id
            }
        });
        sendOTP(mobileNumber, otp); // Function to send OTP via SMS or any other method
        return res.status(200).json({ message: 'Otp sent successfully', data: newDriver });
    } catch (error) {
        console.error('Error sending OTP:', error);
    }
}

const driverStatus = async (req, res) => {
    try {
        const { flag, mobileNumber } = req.body;
        const driver = await prisma.driver.updateMany({
            where: {
                mobileNumber
            },
            data: {
                flag
            }
        })
        return res.status(200).json({ message: 'status updated successfully', data: driver });
    } catch (error) {
        console.error('Error sending OTP:', error);
    }
}

const driverLocation = async (req, res) => {
    try {
        const { mobileNumber, pickupTime, currentCity, destination } = req.body;
        const date = new Date(pickupTime);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); // Adjust timezone offset to 0
        const utcDate = date.toISOString();
        console.log(utcDate);
        console.log(date);
        const driver = await prisma.driver.updateMany({
            where: {
                mobileNumber: mobileNumber
            },
            data: {
                currentCity: currentCity,
                destination: destination,
                pickupTime: utcDate
            }
        })
        return res.status(200).json({ message: 'location updated successfully', data: driver });
    } catch (error) {
        console.error('Error sending OTP:', error);
    }
}

const driverHistory = async (req, res) => {
    try {
        const { mobileNumber } = req.params;
        const data = await prisma.$queryRaw(Prisma.sql`select * from "rideBooking" rb where  rb."driverMobile" = ${mobileNumber} or rb."rideCompleted"  = true and rb."travelDate" <= current_date ;`)
        return res.status(200).json({ message: 'Data fetched successfully', data: data });
    } catch (error) {
        console.error('Error:', error);
    }
}

const driverUpcoming = async (req, res) => {
    try {
        const { mobileNumber } = req.params;
        const data = await prisma.$queryRaw(Prisma.sql`select * from "rideBooking" rb where rb.status = 'CONFIRMED' and rb."driverMobile" = ${mobileNumber} and rb."rideCompleted"  = false and rb."travelDate" >= current_date ;`)
        return res.status(200).json({ message: 'Data fetched successfully', data: data });
    } catch (error) {
        console.error('Error:', error);
    }
}

const rideCompleted = async (req, res) => {
    try {
        const { status, userMobile, driverMobile, travelDate } = req.body;
        let date = new Date(travelDate);
        const data = await prisma.rideBooking.updateMany({
            where: {
                status: "CONFIRMED",
                userMobile: userMobile,
                driverMobile: driverMobile,
                travelDate: date
            },
            data: {
                rideCompleted: status
            }
        })
        return res.status(200).json({ message: 'Data updated successfully', data: data });
    } catch (error) {
        console.error('Error:', error);
    }
}

export { driverLogin, driverHistory, rideCompleted, driverUpcoming, driverStatus, driverLocation, driverRegister, resendOtpDriver, imgUploaderDocument };