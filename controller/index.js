import express from "express";
const router = express.Router();
import { UserRegister, userLogin,userHistory, userUpcoming,  resendOtp } from "./user.js"
import { citiesList, cityById, distanceBetweenCities } from "./cityLocation.js";
import {driverRegister, driverLogin, rideCompleted, driverUpcoming, resendOtpDriver, driverHistory, driverStatus, driverLocation, imgUploaderDocument} from "./driver.js"
import { fcmNotification, sendNotification,   rideBooking } from "./userNotification.js";
import auth from "../utils/auth.js";

import {searchDrivers} from "./rideSearch.js"


router.post("/register", UserRegister);
router.post("/login", userLogin);
router.post("/resendOtp", resendOtp)
router.get("/userHistory/:mobileNumber", auth, userHistory);
router.get("/userUpcoming/:mobileNumber", auth, userUpcoming);


router.post("/registerDriver", imgUploaderDocument, driverRegister);
router.post("/loginDriver", driverLogin);
router.post("/resendOtpDriver", resendOtpDriver)
router.post("/driverStatus", driverStatus)
router.post("/driverLocation", auth, driverLocation)
router.get("/driverHistory/:mobileNumber",auth, driverHistory)
router.get("/driverUpcoming/:mobileNumber",auth, driverUpcoming)
router.post("/rideCompleted",auth, rideCompleted)



router.get("/citiesList", auth, citiesList);
router.get("/cityById/:id", auth, cityById);
router.post("/distance", auth, distanceBetweenCities);

router.post("/fcmNotification", auth, fcmNotification);

router.post("/sendNotification", auth, sendNotification);

router.post("/rideBooking", auth, rideBooking);

router.post("/searchDrivers", auth, searchDrivers);






export default router;



