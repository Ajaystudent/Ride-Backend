import express from "express";
const router = express.Router();
import { UserRegister, userLogin, resendOtp } from "./user.js"
import { citiesList, cityById, distanceBetweenCities } from "./cityLocation.js";
import auth from "../utils/auth.js";


router.post("/register", UserRegister);
router.post("/login", userLogin);
router.post("/resendOtp", resendOtp)

router.get("/citiesList", auth, citiesList);
router.get("/cityById/:id", auth, cityById);
router.post("/distance", auth, distanceBetweenCities);



export default router;



