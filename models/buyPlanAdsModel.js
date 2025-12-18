import mongoose from "mongoose";

const buyplanadsSchema = new mongoose.Schema(
    {
        paymentId: {
            type: Number,
          },
          razorpay_order_id: {
            type: String,
          },
      
          razorpay_payment_id: {
            type: String,
          },
      
          razorpay_signature: {
            type: String,
          },
          note: {
            type: String,
          },
          img: {
            type: String,
          },
      
          totalAmount: {
            required: [true, "Total Amount is required"],
            type: Number,
          },
      
          userId: {
            // Changed field name to plural and set type as an array of ObjectIds
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
           
          payment: {
            type: Number,
            default: 0,
          },
       
          Local: {
            type: Number,
          },
         coverage: {
            type: Object,
        },
        adslink: {
            type: String,
          },
             thumbnail: {
            type: String,
          },
      type: {
            type: Number,
          },
                Category: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Category'
                }], // Define Category as an array of ObjectIds
         Quantity: {
            type: Number,
          },
         state: {
            type: String,
          },
          
    },
    { timestamps: true }
);

const buyPlanAdsModel = mongoose.model("buyplanads", buyplanadsSchema);

export default buyPlanAdsModel;
