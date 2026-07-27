import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
    uploadDocument,
    getAllDocuments,
    deleteDocument,
} from "../controllers/document.controller.js";

const router = Router();

router.route("/upload").post(
    verifyJWT,
    upload.single("file"),
    uploadDocument
);

router.route("/:id").delete(
    verifyJWT,
    deleteDocument
);

router.route("/").get(getAllDocuments);

export default router;