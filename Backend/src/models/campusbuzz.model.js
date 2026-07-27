import mongoose, { Schema } from "mongoose";

const campusBuzzSchema = new Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: [500, 'campusBuzz cannot exceed 500 characters'],
        },
        postedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            select: false, // excluded from queries by default — never sent to frontend
        },
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            }
        ],
    },
    {
        timestamps: true
    }
);

export const campusBuzz = mongoose.model("campusBuzz", campusBuzzSchema);