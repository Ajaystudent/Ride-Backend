import express from "express";
const router = express.Router();
import { UserRegister, userLogin, resendOtp } from "./user.js"
import { citiesList, cityById, distanceBetweenCities } from "./cityLocation.js";
import {driverRegister, driverLogin, resendOtpDriver, imgUploaderDocument} from "./driver.js"
import { fcmNotification } from "./userNotification.js";
import auth from "../utils/auth.js";


router.post("/register", UserRegister);
router.post("/login", userLogin);
router.post("/resendOtp", resendOtp)

router.post("/registerDriver", imgUploaderDocument, driverRegister);
router.post("/loginDriver", driverLogin);
router.post("/resendOtpDriver", resendOtpDriver)

router.get("/citiesList", auth, citiesList);
router.get("/cityById/:id", auth, cityById);
router.post("/distance", auth, distanceBetweenCities);

router.post("/fcmNotification", auth, fcmNotification);



export default router;



