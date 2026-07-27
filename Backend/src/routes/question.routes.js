import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    toggleQuestionUpvote,
    markQuestionSolved,
} from "../controllers/question.controller.js";
import answerRouter from "./answer.routes.js";

const router = Router();

router.route("/").post(verifyJWT, createQuestion);
router.route("/").get(getAllQuestions);
router.route("/:id").get(getQuestionById);
router.route("/:id/upvote").post(verifyJWT, toggleQuestionUpvote);
router.route("/:id/solve").patch(verifyJWT, markQuestionSolved);

router.use("/:questionId/answers", answerRouter);

export default router;