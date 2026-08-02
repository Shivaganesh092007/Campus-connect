import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema=new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
        },
        password: {
            type:String,
            required: [true,  'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false // Prevents returning password in DB queries by default
        },
        branch: {
            type: String,
            required: true,
            enum: ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'CHEM', 'MME', 'BIOTECH']
        },
        avatarImage: {
            type: String, 
        },
        refreshToken: {
            type: String,
            select: false
        }
    },
    {
        timestamps: true 
    }
)

userSchema.pre("save", async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User",userSchema);