import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient();


const citiesList = async (req, res) => {
    try {
       const cities = await prisma.cityLocation.findMany({});
        res.status(200).json({ message: 'City data fetched successfully', data: cities });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const cityById = async (req, res) => {
    try {
        const {id} = req.params;
       const cityDetail = await prisma.cityLocation.findFirst({
        where:{
            id: parseInt(id) 
        }
       });
        res.status(200).json({ message: 'City data fetched successfully', data: cityDetail });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const distanceBetweenCities = async (req, res) => {
    try {
        const {lat1, lat2, lon1, lon2} = req.body;
        const lat1Rad = lat1 * (Math.PI / 180);
        const lon1Rad = lon1 * (Math.PI / 180);
        const lat2Rad = lat2 * (Math.PI / 180);
        const lon2Rad = lon2 * (Math.PI / 180);
      
        const deltaLat = lat2Rad - lat1Rad;
        const deltaLon = lon2Rad - lon1Rad;
      
        const haversineLat = Math.sin(deltaLat / 2) ** 2;
        const haversineLon = Math.sin(deltaLon / 2) ** 2;
      
        const a = haversineLat + Math.cos(lat1Rad) * Math.cos(lat2Rad) * haversineLon;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      
        const R = 6371;
      
        const distance = R * c;
        res.status(200).json({ message: 'Distance fetched successfully', data: distance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export {citiesList, cityById, distanceBetweenCities};