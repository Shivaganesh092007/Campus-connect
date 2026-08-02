import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from './routes/user.routes.js';
import express from 'express'
import documentRouter from "./routes/document.routes.js";
import questionRouter from "./routes/question.routes.js";
import campusBuzzRouter from "./routes/campusbuzz.routes.js";

const app=express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v2/users",userRouter);
app.use("/api/documents", documentRouter);
app.use("/api/questions", questionRouter);
app.use("/api/whispers", campusBuzzRouter);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        statusCode,
        success: false,
        message,
        errors: err.errors || [],
        data: null
    });
});

export default app;