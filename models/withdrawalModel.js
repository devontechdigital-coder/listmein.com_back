import mongoose from "mongoose";

const transactionSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model for the sender
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order', // Reference to the User model for the sender
     },
    note: {
        type: String,
     },
    amount: { 
        type: Number, 
        required: true 
    }, 
       t_id: { 
        type: String, 
     },
     t_no: { 
        type: Number, 
     },
        status: { 
        type: Number, 
     },
},
    { timestamps: true }
)

const withdrawalModel = mongoose.model('withdrawal', transactionSchema);

export default withdrawalModel;