import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
    createAnswer,
    getAnswersForQuestion,
    toggleAnswerUpvote,
    deleteAnswer,
} from "../controllers/answer.controller.js";

const router = Router({ mergeParams: true }); // needed to access :questionId from the parent router
// Router({ mergeParams: true }) — without this, the nested router can't see :questionId from the parent path. Easy to forget and a classic silent bug (route "works" but req.params.questionId is undefined).

router.route("/").post(verifyJWT, createAnswer);
router.route("/").get(getAnswersForQuestion);
router.route("/:id/upvote").post(verifyJWT, toggleAnswerUpvote);
router.route("/:id").delete(verifyJWT, deleteAnswer);

export default router;