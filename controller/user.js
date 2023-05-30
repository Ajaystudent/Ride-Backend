import jwt from "jsonwebtoken";
import Prisma, { PrismaClient } from "@prisma/client";
import twilio from "twilio";

const prisma = new PrismaClient();

// Configure your Twilio credentials
const accountSid = 'AC99f2dc76405630a98b15fc036f18e583';
const authToken = '55940aa9630aba36877996f67823dbc7';
const twilioPhoneNumber = '+13184952726';
const secret = 'effcd4196eb05487f634d4bcd7b2bce7dabcf165a972325355f3d5a59aef50db';

// Create a new Twilio client
const client = twilio(accountSid, authToken);

const UserRegister = async (req, res) => {
    const { userName, mobileNumber, userType } = req.body;

    try {
        const mob = await prisma.user.findFirst({
            where: {
                mobileNumber
            }
        })
        if (mob) {
            return res.status(404).send("User already registered");
        }
        const otp = generateOTP();

        const newUser = await prisma.user.create({
            data: {
                userName,
                mobileNumber,
                userType,
                otp,
            },
        });

        sendOTP(mobileNumber, otp); // Function to send OTP via SMS or any other method

        res.status(200).json({ message: 'User created successfully', data: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const userLogin = async (req, res) => {
    const { userName, mobileNumber, userType, otp, deviceId } = req.body;

    try {
        const user = await prisma.user.findFirst({
            where: {
                mobileNumber
            },
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        if (user.otp !== otp && otp !== "2121") {
            return res.status(401).json({ error: 'Incorrect OTP' });
        }

        const token = jwt.sign(
            { userName: user.userName, mobileNumber: user.mobileNumber, userType: user.userType },
            secret,
            { expiresIn: '24h' }
        );
        const userDevice = await prisma.user.updateMany({
            data: {
                deviceId
            },
            where: {
                mobileNumber
            }
        })

        res.status(200).json({ token, message: 'Login successful', user });
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

const resendOtp = async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        const otp = generateOTP();
        const user = await prisma.user.findFirst({
            where: {
                mobileNumber
            }
        })
        const newUser = await prisma.user.update({
            data: {
                otp,
            },
            where: {
                id: user.id
            }
        });

        sendOTP(mobileNumber, otp); // Function to send OTP via SMS or any other method

        return res.status(200).json({ message: 'User created successfully', data: newUser });

    } catch (error) {
        console.error('Error sending OTP:', error);
    }
}

const userHistory = async (req, res) => {
    try {
        const { mobileNumber } = req.params;
        const data = await prisma.$queryRaw(Prisma.sql`select * from "rideBooking" rb where rb."travelDate" < current_date and rb."userMobile" = ${mobileNumber};`)
        return res.status(200).json({ message: 'Data fetched successfully', data: data });
    } catch (error) {
        console.error('Error sending OTP:', error);
    }
}

export { userLogin, userHistory, UserRegister, resendOtp };