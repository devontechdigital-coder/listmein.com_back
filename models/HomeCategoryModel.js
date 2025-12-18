import mongoose from "mongoose";

const homeCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: [true, "title is required"],
    },
     
    icon_image: {
      type: String,
    },
     type: {
      type: Number,
    },

      empType: {
      type: Number,
    },
    

     para: {
      type: String,
    }, 
    slug: {
      type: String,
      unique: true,
    },

    description: {
      type: String,
    },
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    metaKeywords: {
      type: String,
    },
     price: {
      type: Number,
      default: 0,
     },
    status: {
      type: Number,
      default: 1,
     },
    auth: {
      type: Number,
      default: 0,
    }, 
     link: {
      type: String,
     }, 
    authLink: {
      type: String,
     }, 
    parent: {
      type: mongoose.Types.ObjectId,
      ref: "home_category", // Reference to the same "Category" model
    },
     faqs: {
            type: Array,
    },
    logic:{
            type: Number,
            default:0
    },
     multi: {
            type: Array,
    },
  },
  { timestamps: true }
);

const HomeCategoryModel = mongoose.model("home_category", homeCategorySchema);

export default HomeCategoryModel;
