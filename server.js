import express from "express";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import dotenv from "dotenv";
import path from "path";
const __dirname = path.resolve();
import cors from "cors";
import apis from "../Ride/controller/index.js"
import bodyParser from "body-parser";

const app = express();

const PORT = 3008;

const corsOptions = {
    origin: "*",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }))

app.get("/", (req, res) => {
    res.send("hello")
})

app.use("/api", apis);

app.use(cors());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });

app.use(express.json());



app.listen(PORT, () => {
    console.log("server start")
})