import { PrismaClient, Prisma } from "@prisma/client"
const prisma = new PrismaClient();
import FCM from "fcm-node";


const searchDrivers = async (req, res) => {
    try {
        const { currentCity, destination, pickupTime, seats } = req.body;
        const date = new Date(pickupTime);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); // Adjust timezone offset to 0
        const pickup = date.toISOString();
        const driverList = await prisma.$queryRaw(
            Prisma.sql`SELECT * FROM "Driver" d
                  WHERE d."currentCity" = ${currentCity}
                    AND d.destination = ${destination}
                    AND d."pickupTime" BETWEEN (${pickup}::timestamp - INTERVAL '30 minutes') AND (${pickup}::timestamp + INTERVAL '30 minutes')
                    AND d.seats > ${seats - 1}`
        );
        res.status(200).json({ message: 'Successfully sent with response', data: driverList });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};





export { searchDrivers }