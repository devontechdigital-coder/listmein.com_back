import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  items: {
    type: Array,
    required: [true, "items is required"],
  },
  service: {
    type: String,
  },
  fullname: {
    type: String,
  },
  phone: {
    type: Number,
  },
  email: {
    type: String,
  },
  address: {
    type: String,
  },
  pincode: {
    type: String,
  },
  state: {
    type: String,
  },
  statename: {
    type: String,
  },
  city: {
    type: String,
  },
  bookingDate: {
    type: Date,
  },
  bookingTime: {
    type: String, 
  },
  requirement: {
    type: String, 
  },
  mode: {
    type: String,
  },
  details: {
    type: Array,
  },
  discount: {
    type: String,
  },
  shipping: {
    type: String,
  },
  totalAmount: {
    type: Number,
  },
  userId:{  // Changed field name to plural and set type as an array of ObjectIds
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  primary: {
    type: String,
  }, 
  payment: {
    type: Number,
    default: 0,
  },
  status: {
    type: Number,
    default: 1,
  },
  leadStatus: {
    type: Number,
    default: 0,
  },
  orderId: {
    type: Number,
  },
  reason: {
    type: String,
  },
  comment: {
    type: String,
  },
  
  category: {
    type: [String],
      default: [],
},
  type: {
    type: Number,
    default:0
  },
  agentId: {
        // Changed field name to plural and set type as an array of ObjectIds
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

    bussId: {
        // Changed field name to plural and set type as an array of ObjectIds
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

        runnId: {
        // Changed field name to plural and set type as an array of ObjectIds
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      sellId: {
        // Changed field name to plural and set type as an array of ObjectIds
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      wareId: {
        // Changed field name to plural and set type as an array of ObjectIds
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      longitude: {
        type: String,
      },
      latitude: {
        type: String,
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
},
  { timestamps: true }
);

const orderModel = mongoose.model('Order', orderSchema);

export default orderModel;