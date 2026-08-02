import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        branch: {
            type: String,
            required: true,
            enum: ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'CHEM', 'MME', 'BIOTECH'],
            index: true,
        },
        topic: {
            type: String,
            required: true,
            index: true,
        },
        askedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ['Solved', 'Unsolved'],
            default: 'Unsolved',
        },
        upvotes: [
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

export const Question = mongoose.model("Question", questionSchema);