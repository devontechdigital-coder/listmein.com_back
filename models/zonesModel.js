import mongoose from "mongoose";

const zonesSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: [true, "Name is required"],
        },
        primary: {
            type: String
        },
        cities: {
            type:Array
        },
    
 pincodes: [
      {
        code: {
          type: String,
          required: true,
          trim: true,
          match: /^\d{6}$/, // Indian pincode format
        },
        areas: [{ type: String, trim: true }],
      },
    ],

        status: {
            type: String,
        }
    },
    { timestamps: true }
);

const zonesModel = mongoose.model("Zone", zonesSchema);

export default zonesModel;