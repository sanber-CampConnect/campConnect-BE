import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import router from "./routes/router.js";
import errorHandler from "./middlewares/errorHandler.js";
import logger from "./middlewares/logger.js";

dotenv.config();
const APP = express();
const PORT = process.env.PORT || 3000;

APP.use(cors()); // TODO: Configure this later on
APP.use(logger);
APP.use(express.json());
APP.use(bodyParser.urlencoded({extended: true}));
APP.use(router);
APP.use(errorHandler);

APP.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
})