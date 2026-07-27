import mongoose, { Schema } from "mongoose";

const documentSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        courseCode: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        branch: {
            type: String,
            required: true,
            enum: ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'CHEM', 'MME', 'BIOTECH']
        },
        fileUrl: {
            type: String,
            required: true,
        },
        filePublicId: {
            type: String,
            required: true, // needed later to delete from Cloudinary
        },
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    {
        timestamps: true
    }
);

export const Document = mongoose.model("Document", documentSchema);