import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
    createPost,
    updatePost,
    getAllPosts,
    toggleLike,
    deletePost,
} from "../controllers/campusbuzz.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createPost);
router.route("/:id").patch(verifyJWT, updatePost);
router.route("/").get(getAllPosts);
router.route("/:id/like").post(verifyJWT, toggleLike);
router.route("/:id").delete(verifyJWT, deletePost);

export default router;