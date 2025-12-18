import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: [true, "Name is required"],
        },
        price: {
            type: Number,
            require: [true, "price is required"],
        },
        validity: {
            type: Number,
            require: [true, "price is required"],
        },
      
    },
    { timestamps: true }
);

const planModelAds = mongoose.model("planads", planSchema);

export default planModelAds;