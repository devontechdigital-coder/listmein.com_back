import mongoose from "mongoose";

const homeSchema = new mongoose.Schema(
    {
        meta_title: {
            type: String,
            default: ""
        },
        meta_description: {
            type: String,
            default: ""
        },
        meta_head: {
            type: String,
            default: ""
        },
        meta_logo: {
            type: String,
            default: ""
        },
        meta_favicon: {
            type: String,
            default: ""
        },
        header: {
            type: Object,
            default: {}
        },
        footer: {
            type: Object,
            default: {}
        },
        footer_credit: {
            type: String,
            default: ""
        },
        phone: {
            type: String,
            default: ""
        },
        email: {
            type: String,
            default: ""
        },
        address: {
            type: String,
            default: ""
        },
        cash: {
            type: String,
            default: ""
        },
        razorpay: {
            type: String,
            default: ""
        },
   keyId: {
          type: String,
            default: ""
        },
          keySecret: {
          type: String,
            default: ""
        },
        hrPrice: {
          type: Number,
            default: 0
        },
        dayPrice: {
          type: Number,
            default: 0
        },
          saleCommission: {
          type: Number,
            default: 0
        },
          userIncome: {
          type: Number,
            default: 0
        },
          bussinessPartnerIncome: {
          type: Number,
            default: 0
        },
          companyPartnerIncome: {
          type: Number,
            default: 0
        },
          wearehousePartnerIncome: {
          type: Number,
            default: 0
        },
         fundPartnerIncome: {
          type: Number,
          default: 0
        },
        
    },
    { timestamps: true }
);

const homeModel = mongoose.model("home", homeSchema);

// Check if data exists, if not, create a new document with default values
const checkOrCreateDefaultData = async () => {
    try {
        const result = await homeModel.findOne({});
        if (!result) {
            // No document found, create a new one with default values
            const newData = new homeModel();
            await newData.save();
            console.log("Blank home data created successfully.");
        }
    } catch (error) {
        console.error("Error checking or creating home data:", error);
    }
};

checkOrCreateDefaultData();

export default homeModel;
