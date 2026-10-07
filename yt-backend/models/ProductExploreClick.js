import mongoose from "mongoose";

const ProductExploreClickSchema = new mongoose.Schema(
    {
        // Unique per click event so retries never create duplicate records.
        eventId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 80,
        },
        productSlug: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        productTitle: {
            type: String,
            trim: true,
            maxlength: 200,
            default: "",
        },
        targetUrl: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
        visitorId: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80,
        },
        // Visitor timezone (e.g. "Asia/Kolkata") used as a privacy-friendly location signal.
        location: {
            type: String,
            trim: true,
            maxlength: 120,
            default: "Unknown",
        },
        referrer: {
            type: String,
            trim: true,
            maxlength: 255,
            default: "",
        },
    },
    { timestamps: true }
);

export default mongoose.model("ProductExploreClick", ProductExploreClickSchema);
