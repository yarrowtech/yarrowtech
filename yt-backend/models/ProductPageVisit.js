import mongoose from "mongoose";

const ProductPageVisitSchema = new mongoose.Schema(
    {
        path: {
            type: String,
            required: true,
            trim: true,
            maxlength: 255,
        },
        title: {
            type: String,
            trim: true,
            maxlength: 200,
            default: "",
        },
        referrer: {
            type: String,
            trim: true,
            maxlength: 255,
            default: "",
        },
        userAgent: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
        durationMs: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.model("ProductPageVisit", ProductPageVisitSchema);
