import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import router from "./routes/router.js";

dotenv.config();
const APP = express();
const PORT = {
  "DEVEL": process.env.DEVEL_PORT,
  "STAGING": process.env.STAGING_PORT,
  "PRODUCTION": process.env.PRODUCTION_PORT,
}[process.env.NODE_ENV];

// APP.use(logger);
APP.use(express.json());
APP.use(bodyParser.urlencoded({extended: true}));
APP.use(router);
// APP.use(errorHandler);

APP.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
})