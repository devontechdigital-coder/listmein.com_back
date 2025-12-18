import mongoose from "mongoose";
import blogModel from "../models/blogModel.js";
import userModel from "../models/userModel.js";
import chatModel from "../models/chatModel.js";
import categoryModel from "../models/categoryModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import attributeModel from "../models/attributeModel.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
import homeModel from "../models/homeModel.js";
import homeLayoutModel from "../models/homeLayoutModel.js";
import ratingModel from "../models/ratingModel.js";
import wishlistModel from "../models/wishlistModel.js";
import compareModel from "../models/compareModel.js";
import zonesModel from "../models/zonesModel.js";
import promoModel from "../models/promoModel.js";
import taxModel from "../models/taxModel.js";
import Razorpay from "razorpay";
import nodemailer from "nodemailer";
import { createServer } from "http";
import querystring from "querystring";
import https from "https";
import CryptoJS from "crypto-js"; // Import the crypto module
import axios from "axios";
import { cpSync } from "fs";
import enquireModel from "../models/enquireModel.js";
import planModel from "../models/planModel.js";
import planCategoryModel from "../models/planCategoryModel.js";
import buyPlanModel from "../models/buyPlanModel.js";
import departmentsModel from "../models/departmentsModel.js";
import { type } from "os";
import paymentModel from "../models/paymentModel.js";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs/promises";
import multer from "multer";
import { exec } from "child_process";
import util from "util";
import crypto from "crypto";  // Ensure you require the crypto module if you haven't
import razorpay from "razorpay";
import HomeCategoryModel from "../models/HomeCategoryModel.js";
import buyPlanAdsModel from "../models/buyPlanAdsModel.js";
import callModel from "../models/callModel.js";

const execPromise = util.promisify(exec);

dotenv.config();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define the destination folder where uploaded images will be saved
    cb(null, "public/uploads/new");
  },
  filename: function (req, file, cb) {
    // Define the filename for the uploaded image
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });


// Function to pad the plaintext
function pkcs5_pad(text, blocksize) {
  const padding = blocksize - (text.length % blocksize);
  for (let i = 0; i < padding; i++) {
    text += String.fromCharCode(padding);
  }
  return text;
}

// Function to encrypt plaintext
function encrypt(plainText, key) {
  // Convert key to MD5 and then to binary
  const secretKey = CryptoJS.enc.Hex.parse(
    CryptoJS.MD5(key).toString(CryptoJS.enc.Hex)
  );
  // Initialize the initialization vector
  const initVector = CryptoJS.enc.Utf8.parse(
    Array(16)
      .fill(0)
      .map((_, i) => String.fromCharCode(i))
      .join("")
  );
  // Pad the plaintext
  const plainPad = pkcs5_pad(plainText, 16);
  // Encrypt using AES-128 in CBC mode
  const encryptedText = CryptoJS.AES.encrypt(plainPad, secretKey, {
    iv: initVector,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.NoPadding,
  });
  // Convert the ciphertext to hexadecimal
  return encryptedText.ciphertext.toString(CryptoJS.enc.Hex);
}

// Function to decrypt ciphertext
function decrypt(encryptedText, key) {
  // Convert key to MD5 and then to binary
  const secretKey = CryptoJS.enc.Hex.parse(
    CryptoJS.MD5(key).toString(CryptoJS.enc.Hex)
  );
  // Initialize the initialization vector
  const initVector = CryptoJS.enc.Utf8.parse(
    Array(16)
      .fill(0)
      .map((_, i) => String.fromCharCode(i))
      .join("")
  );
  // Convert the encryptedText from hexadecimal to binary
  const encryptedData = CryptoJS.enc.Hex.parse(encryptedText);
  // Decrypt using AES-128 in CBC mode
  const decryptedText = CryptoJS.AES.decrypt(
    { ciphertext: encryptedData },
    secretKey,
    { iv: initVector, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.NoPadding }
  );
  // Remove PKCS#5 padding
  return decryptedText
    .toString(CryptoJS.enc.Utf8)
    .replace(/[\x00-\x1F\x80-\xFF]+$/g, "");
}

function decryptURL(encryptedText, key) {
  const keyHex = CryptoJS.enc.Hex.parse(md5(key));
  const initVector = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
  const encryptedHex = CryptoJS.enc.Hex.parse(encryptedText);
  const decryptedText = CryptoJS.AES.decrypt(
    { ciphertext: encryptedHex },
    keyHex,
    { iv: initVector, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.NoPadding }
  );
  return decryptedText.toString(CryptoJS.enc.Utf8);
}

const secretKey = process.env.SECRET_KEY;

// export const SignupUser = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     // Validation
//     if (!username || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please fill all fields',
//       });
//     }

//     const existingUser = await userModel.findOne({ email });
//     if (existingUser) {
//       return res.status(401).json({
//         success: false,
//         message: 'User Already Exists',
//       });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a new user
//     const user = new userModel({ username, email, password: hashedPassword });
//     const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
//     user.token = token; // Update the user's token field with the generated token
//     await user.save();

//     // Generate JWT token

//     res.status(201).json({
//       success: true,
//       message: 'User created successfully',
//       user,
//       token,
//     });
//   } catch (error) {
//     console.error('Error on signup:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error on signup',
//       error: error.message,
//     });
//   }
// }

export const SignupUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "User Already Exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new userModel({ username, email, password: hashedPassword });
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "1h",
    });
    user.token = token; // Update the user's token field with the generated token
    user.type = 2; // Update the user's token field with the generated token

    await user.save();

    // Generate JWT token

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Error on signup:", error);
    res.status(500).json({
      success: false,
      message: "Error on signup",
      error: error.message,
    });
  }
};

export const postman = async (req, res) => {
  const order_id = req.params.id; // Extracting order ID from params
  const merchantJsonData = {
    order_no: order_id,
  };
  const accessCode = process.env.ACCESS_CODE;
  const workingKey = process.env.WORKING_KEY;
  const merchantData = JSON.stringify(merchantJsonData);
  const encryptedData = encrypt(merchantData, workingKey);

  try {
    const response = await axios.post(
      `https://apitest.ccavenue.com/apis/servlet/DoWebTrans?enc_request=${encryptedData}&access_code=${accessCode}&request_type=JSON&response_type=JSON&command=orderStatusTracker&version=1.2`
    );

    const encResponse = response.data.split("&")[1].split("=")[1];

    const finalstatus = encResponse.replace(/\s/g, "").toString();
    console.log("`" + finalstatus + "`");
    const newStatus = await decrypt(finalstatus, workingKey);

    // Clean the string from unwanted characters
    const cleanedData = cleanDataString(newStatus);

    // Construct an object from the cleaned data string
    const newData = constructObjectFromDataString(cleanedData);

    let paymentStatus;
    let OrderStatus;

    if (newData.order_status === "Awaited") {
      paymentStatus = 2;
      OrderStatus = "1";
    }
    if (newData.order_status === "Shipped") {
      paymentStatus = 1;
      OrderStatus = "1";
    }
    if (
      newData.order_status === "Aborted" ||
      newData.order_status === undefined
    ) {
      paymentStatus = 0;
      OrderStatus = "0";
    }
    if (newData.order_status === "Initiated") {
      paymentStatus = 0;
      OrderStatus = "0";
    }

    console.log(paymentStatus, OrderStatus);

    let updateFields = {
      payment: paymentStatus,
      status: OrderStatus,
    };

    await orderModel.findOneAndUpdate(
      { orderId: req.params.id }, // Find by orderId
      updateFields,
      { new: true } // To return the updated document
    );

    res.status(200).json({
      success: true,
      message: "Response received successfully",
      data: newData, // Sending the JSON data back to the client
      key: workingKey,
    });
  } catch (error) {
    console.error("Decryption error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while processing the request",
      error: error.message, // Sending the error message back to the client
    });
  }
};

function cleanDataString(dataString) {
  // Remove backslashes and other unwanted characters
  return dataString.replace(/\\/g, "").replace(/\u000F/g, "");
}

function constructObjectFromDataString(dataString) {
  const pairs = dataString.split('","').map((pair) => pair.split('":"'));
  const dataObject = {};
  for (const [key, value] of pairs) {
    dataObject[key] = value;
  }
  return dataObject;
}

export const Userlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "please fill all fields",
      });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "email is not registerd",
        user,
      });
    }
    // password check

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "password is not incorrect",
        user,
      });
    }

    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "1h",
    });

    return res.status(200).send({
      success: true,
      message: "login sucesssfully",
      user,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error on login ${error}`,
      sucesss: false,
      error,
    });
  }
};


export const SignupUserType = async (req, res) => {
  try {
    const {
      type,
      empType,
      username,
      phone,
      email,
      state,
      statename,
      country,
      password,
      pincode,
      Gender,
      DOB,
      address,
      city,
      coverage,
      longitude,
      latitude,
      mId,
    } = req.body;

 
    // const {
    //   profile,

    //   AadhaarFront,
    //   AadhaarBack,
    // } = req.files;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate the auto-increment ID
    const lastUser = await userModel.findOne().sort({ _id: -1 }).limit(1);
    let userId;

    if (lastUser) {
      // Convert lastOrder.orderId to a number before adding 1
      const lastUserId = parseInt(lastUser.userId || 1);
      userId = lastUserId + 1;
    } else {
      userId = 1;
    }

 
    const newUser = new userModel({
      type,
      username,
      phone,
      email,
      password: hashedPassword,
      pincode,
      gender: Gender,
      DOB,
      address,
      state,
      statename,
      country,
      city,
      coverage,
      userId,
      empType,
      longitude,
      latitude
    });

if (mId) {
  const superUser = await userModel.findById(mId);
  if (superUser) {
    superUser.mId.push(newUser._id);
    await superUser.save();
  }
}


    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User signed up successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: `Error occurred during user signup ${error}`,
      success: false,
      error,
    });
  }
};

export const SignupUserTypePay = async (req, res) => {
  try {
    const {
      type,
      empType,
      username,
      phone,
      email,
      state,
      statename,
      country,
      password,
      pincode,
      Gender,
      DOB,
      address,
      city,
      coverage,
      longitude,
      latitude,
      mId,
      dynamicType,
      totalAmount
    } = req.body;

    console.log('req.body',req.body)
     // ✅ Validate and sanitize totalAmount
    let amount = Number(totalAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing totalAmount in request body",
      });
    }
  
    // const {
    //   profile,

    //   AadhaarFront,
    //   AadhaarBack,
    // } = req.files;

      const homeData = await homeModel.findOne({});
        if (!homeData) {
            return res.status(500).send({ message: 'Home data not found in the database', success: false });
        }

         const { keyId, keySecret } = homeData;
        if (!keyId || !keySecret) {
            return res.status(500).send({ message: 'Razorpay keys are missing in the database', success: false });
        }

         const instance = new razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
 
              const options = {
            amount: Number(Number(totalAmount) * 100), // Razorpay expects the amount in paise
            currency: "INR",
        };
        const order = await instance.orders.create(options);

    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate the auto-increment ID
    const lastUser = await userModel.findOne().sort({ _id: -1 }).limit(1);
    let userId;

    if (lastUser) {
      // Convert lastOrder.orderId to a number before adding 1
      const lastUserId = parseInt(lastUser.userId || 1);
      userId = lastUserId + 1;
    } else {
      userId = 1;
    }

 
    const newUser = new userModel({
      type,
      username,
      phone,
      email,
      password: hashedPassword,
      pincode,
      gender: Gender,
      DOB,
      address,
      state,
      statename,
      country,
      city,
      coverage,
      userId,
      empType,
      longitude,
      latitude,
      status:0,
      verified:0,
      razorpay_order_id: order.id,
      dynamicType : dynamicType ?? '',
      price: totalAmount,
    });

if (mId) {
  const superUser = await userModel.findById(mId);
  if (superUser) {
    superUser.mId.push(newUser._id);
    await superUser.save();
  }
}


    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User signed up successfully",
      user : newUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: `Error occurred during user signup ${error}`,
      success: false,
      error,
    });
  }
};


export const SignupUserPaymentVerification = async (req, res) => {
 
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  
        const homeData = await homeModel.findOne({});
        if (!homeData) {
            return res.status(500).send({ message: 'Home data not found in the database', success: false });
        }

        const { keyId, keySecret } = homeData;
        if (!keyId || !keySecret) {
            return res.status(500).send({ message: 'Razorpay keys are missing in the database', success: false });
        }


  const expectedsgnature = crypto
    .createHmac("sha256", keySecret)
    .update(body.toString())
    .digest("hex");

  const isauth = expectedsgnature === razorpay_signature;
  if (isauth) {
    // await Payment.create({
    //   razorpay_order_id,
    //   razorpay_payment_id,
    //   razorpay_signature,
    // });

      await userModel.findOneAndUpdate(
      { razorpay_order_id: razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        status: 1,
      },
      { new: true } // This option returns the updated document
    );
    console.log(
      "razorpay_order_id, razorpay_payment_id, razorpay_signature",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
 

    res.redirect(
      `${process.env.BACKWEB}`
    );
  } else {
    await userModel.findOneAndUpdate(
      { razorpay_order_id },
      {
        payment: 0,
      },
      { new: true } // This option returns the updated document
    );
 res.redirect(
      `${process.env.LIVEWEB}`
    );
    // res.status(400).json({ success: false });
  }

   
};


export const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, pincode, country, address, token } = req.body;
    console.log(phone, pincode, country, address, token);
    const user = await userModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    return res.status(200).json({
      message: "user Updated!",
      success: true,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating user: ${error}`,
      success: false,
      error,
    });
  }
};

export const getAllBlogsController = async (req, res) => {
  try {
    const blogs = await blogModel.find({}).lean();
    if (!blogs) {
      return res.status(200).send({
        message: "NO Blogs Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Blogs List ",
      BlogCount: blogs.length,
      success: true,
      blogs,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while getting Blogs ${error}`,
      success: false,
      error,
    });
  }
};

export const createBlogController = async (req, res) => {
  try {
    const { title, description, image, user } = req.body;
    //validation
    if (!title || !description || !image || !user) {
      return res.status(400).send({
        success: false,
        message: "Please Provide ALl Fields",
      });
    }
    const exisitingUser = await userModel.findById(user);
    //validaton
    if (!exisitingUser) {
      return res.status(404).send({
        success: false,
        message: "unable to find user",
      });
    }

    const newBlog = new blogModel({ title, description, image, user });
    const session = await mongoose.startSession();
    session.startTransaction();
    await newBlog.save({ session });
    exisitingUser.blogs.push(newBlog);
    await exisitingUser.save({ session });
    await session.commitTransaction();
    await newBlog.save();
    return res.status(201).send({
      success: true,
      message: "Blog Created!",
      newBlog,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error WHile Creting blog",
      error,
    });
  }
};

export const updateBlogController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image } = req.body;
    const blog = await blogModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    return res.status(200).json({
      message: "Blog Updated!",
      success: true,
      blog,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Blog: ${error}`,
      success: false,
      error,
    });
  }
};

export const getBlogIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await blogModel.findById(id);
    if (!blog) {
      return res.status(200).send({
        message: "Blog Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single Blog!",
      success: true,
      blog,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Blog: ${error}`,
      success: false,
      error,
    });
  }
};

export const deleteBlogController = async (req, res) => {
  try {
    const blog = await blogModel
      // .findOneAndDelete(req.params.id)
      .findByIdAndDelete(req.params.id)
      .populate("user");
    await blog.user.blogs.pull(blog);
    await blog.user.save();
    return res.status(200).send({
      success: true,
      message: "Blog Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing BLog",
      error,
    });
  }
};
export const userBlogsController = async (req, res) => {
  try {
    const userBlog = await userModel.findById(req.params.id).populate("blogs");
    if (!userBlog) {
      return res.status(200).send({
        message: "Blog Not Found By user",
        success: false,
      });
    }
    return res.status(200).json({
      message: " user Blog!",
      success: true,
      userBlog,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing BLog",
      error,
    });
  }
};

export const userTokenController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findOne({ token: id });

    if (!user) {
      return res.status(200).send({
        message: "Token expire",
        success: false,
      });
    }
    return res.status(200).send({
      message: "token Found",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Token Not Authorise",
      error,
    });
  }
};

export const CreateChatController = async (req, res) => {
  const { firstId, secondId } = req.body;
  try {
    const chat = await chatModel.findOne({
      members: { $all: [firstId, secondId] },
    });
    if (chat) return res.status(200).json(chat);
    const newChat = new chatModel({
      members: [firstId, secondId],
    });
    const response = await newChat.save();
    res.status(200).send({
      message: "Chat Added",
      success: true,
      response,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Chat Not Upload",
      error,
    });
  }
};

export const findUserschatController = async (req, res) => {
  const userId = req.params.id;

  try {
    const chats = await chatModel.find({
      members: { $in: [userId] },
    });
    return res.status(200).send({
      message: "Chat Added",
      success: true,
      chats,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "User chat Not Found",
      error,
    });
  }
};

export const findchatController = async (req, res) => {
  const { firstId, secondId } = req.params;

  try {
    const chats = await chatModel.find({
      members: { $all: [firstId, secondId] },
    });
    res.status(200).send({
      message: "Chat Added",
      success: true,
      chats,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "User chat Not Found",
      error,
    });
  }
};

export const UsergetAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find(
      { status: "true" },
      "_id title slug"
    );

    if (!categories) {
      return res.status(200).send({
        message: "NO Category Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Category List ",
      catCount: categories.length,
      success: true,
      categories,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while All Categories ${error}`,
      success: false,
      error,
    });
  }
};


export const UsergetAllHomeCategories = async (req, res) => {
  try {
const { id = null, home = null, cid = null } = req.query;

    // Build the query
    const query = { status: 1 };
    
    if (id) {
      query._id = { $ne: id }; // Exclude this category
    }

    if (home === "true") {
      if (cid) {
        // Either parent == cid OR parent != cid and not null/empty
        query.$or = [
          { parent: cid },
         ];
      } else {
        // Only top-level categories
        query.parent = null;
      }
    }


    const categories = await HomeCategoryModel.find(query);

    if (!categories || categories.length === 0) {
      return res.status(200).send({
        message: "No Category Found",
        success: false,
      });
    }

    return res.status(200).send({
      message: "All Category List",
      catCount: categories.length,
      success: true,
      categories,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting all categories: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const UsergetAllProducts = async (req, res) => {
  try {
    const products = await productModel.find(
      { status: "true" },
      "_id title slug"
    );

    if (!products) {
      return res.status(200).send({
        message: "NO products Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All products List ",
      proCount: products.length,
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while All products ${error}`,
      success: false,
      error,
    });
  }
};

export const UsergetAllHomeProducts = async (req, res) => {
  try {
    const products = await productModel.find(
      {},
      "_id title pImage regularPrice salePrice stock slug variant_products variations"
    );

    if (!products) {
      return res.status(200).send({
        message: "NO products Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All products List ",
      proCount: products.length,
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while All products ${error}`,
      success: false,
      error,
    });
  }
};

export const getAllAttributeUser = async (req, res) => {
  try {
    const Attribute = await attributeModel.find({});
    if (!Attribute) {
      return res.status(200).send({
        message: "NO Attribute Found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Attribute List ",
      AttributeCount: Attribute.length,
      success: true,
      Attribute,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while getting attribute ${error}`,
      success: false,
      error,
    });
  }
};

export const getProductIdUser = async (req, res) => {
  try {
    const { id } = req.params;
    const Product = await productModel.findById(id);
    if (!Product) {
      return res.status(200).send({
        message: "product Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single product!",
      success: true,
      Product,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get product: ${error}`,
      success: false,
      error,
    });
  }
};

// get home data

export const getHomeData = async (req, res) => {
  try {
    const homeData = await homeModel.findOne();

    if (!homeData) {
      return res.status(200).send({
        message: "Home Settings Not Found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Found home settings!",
      success: true,
      homeData,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while getting home settings: ${error}`,
      success: false,
      error,
    });
  }
};

// get home layout data

export const getHomeLayoutData = async (req, res) => {
  try {
    const homeLayout = await homeLayoutModel.findOne();

    if (!homeLayout) {
      return res.status(200).send({
        message: "Home Layout Not Found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Found home Layout Data!",
      success: true,
      homeLayout,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while getting home Layout: ${error}`,
      success: false,
      error,
    });
  }
};

export const createOrderController = async (req, res) => {
  try {
    const { items, status, mode, details, totalAmount, userId } = req.body;
    //validation
    if (!status || !mode || !details || !totalAmount) {
      return res.status(400).send({
        success: false,
        message: "Please Provide ALl Fields",
      });
    }
    const exisitingUser = await userModel.findById(userId);
    //validaton
    if (!exisitingUser) {
      return res.status(404).send({
        success: false,
        message: "unable to find user",
      });
    }

    const newOrder = new orderModel({
      items,
      status,
      mode,
      details,
      totalAmount,
    });
    const session = await mongoose.startSession();
    session.startTransaction();
    await newOrder.save({ session });
    exisitingUser.orders.push(newOrder);
    await exisitingUser.save({ session });
    await session.commitTransaction();
    await newOrder.save();
    return res.status(201).send({
      success: true,
      message: "Order Sucessfully!",
      newBlog,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error WHile Creting Order",
      error,
    });
  }
};

export const updateUserAndCreateOrderController_old = async (req, res) => {
  // let session;
  // let transactionInProgress = false;

  const { id } = req.params;
  const {
    username,
    email,
    state,
    phone,
    address,
    pincode,
    details,
    discount,
    items,
    mode,
    payment,
    primary,
    shipping,
    status,
    totalAmount,
    userId,
    verified,longitude,latitude
  } = req.body;

  try {
    // session = await mongoose.startSession();
    // session.startTransaction();
    // transactionInProgress = true;

      // Initialize Razorpay with the keys from the database
        const instance = new razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        
        
        const options = {
            amount: Number(totalAmount * 100), // Razorpay expects the amount in paise
            currency: "INR",
        };

        const order = await instance.orders.create(options);

    // Update user
    const user = await userModel.findByIdAndUpdate(
      id,
      { username, email, pincode, address, state, verified },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create order for the updated user
    if (!mode || !details || !totalAmount || !userId ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields for the order",
      });
    }

    // Calculate the auto-increment ID

    // Calculate the auto-increment ID
    const lastOrder = await orderModel.findOne().sort({ _id: -1 }).limit(1);
    let order_id;

    if (lastOrder) {
      // Convert lastOrder.orderId to a number before adding 1
      const lastOrderId = parseInt(lastOrder.orderId);
      order_id = lastOrderId + 1;
    } else {
      order_id = 1;
    }

    // Create new order
    const newOrder = new orderModel({
      details,
      discount,
      items,
      mode,
      payment: 0,
      primary,
      shipping,
      status:1,
      totalAmount,
      userId,
      orderId: order_id,
      razorpay_order_id: order.id,
      payment:0,
      longitude,
      latitude
    });

    await newOrder.save({ session });

    // Update user's orders
    user.orders.push(newOrder);
    await user.save({ session });

    // Update stock quantity for each product in the order
    for (const item of items) {
      const product = await productModel.findById(item.id);
      if (product) {
        product.stock -= item.quantity; // Decrement stock by the quantity ordered
        await product.save({ session });
      }
    }


          return res.status(201).json({
        success: true,
        message: "Order created successfully",
        newOrder,
        user,
        Amount: totalAmount,
        online: false,
      });


    // Commit transaction
    // await session.commitTransaction();
    // transactionInProgress = false;



    // if (mode === "COD") {
    //   // Send order confirmation email
    //   await sendOrderConfirmationEmail(email, username, userId, newOrder);
    //   const norder_id = newOrder.orderId;

    //   // block
    //   //  await sendOrderOTP(phone, norder_id);

    //   return res.status(201).json({
    //     success: true,
    //     message: "Order created successfully",
    //     newOrder,
    //     user,
    //     Amount: totalAmount,
    //     online: false,
    //   });
    // } else {
    //   const tid = Math.floor(Math.random() * 1000000); // Generating random transaction ID
    //   const order_id = newOrder.orderId; // Generating order ID
    //   const accessCode = process.env.ACCESS_CODE;
    //   const merchant_id = process.env.MERCHANT_ID;
    //   const WORKING_KEY = process.env.WORKING_KEY;
    //   const redirect_url = process.env.REDIRECT_URL;
    //   const cancel_url = process.env.CANCEL_URL;

    //   return res.status(201).json({
    //     success: true,
    //     online: true,
    //     tid,
    //     order_id,
    //     accessCode,
    //     merchant_id,
    //     WORKING_KEY,
    //     cancel_url,
    //     redirect_url,
    //   });
    // }


  } catch (error) {
    if (transactionInProgress) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error("Error aborting transaction:", abortError);
      }
    }
    console.error("Error:", error);
    return res.status(400).json({
      success: false,
      message: "Error while creating order",
      error: error.message,
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};


function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const d = R * c; // in metres
  return d;
}



export const updateUserAndCreateOrderController = async (req, res) => {
  // let session;
  // let transactionInProgress = false;

  const { id } = req.params;
  const {
    username,
    email,
    state,
    phone,
    address,
    pincode,
    details,
    discount,
    items,
    mode,
    payment,
    primary,
    shipping,
    status,
    totalAmount,
    userId,
    verified,longitude,latitude,sellId
  } = req.body;

  try {
    // session = await mongoose.startSession();
    // session.startTransaction();
    // transactionInProgress = true;

        // Retrieve the Razorpay keys from the database
        const homeData = await homeModel.findOne({});
        if (!homeData) {
            return res.status(500).send({ message: 'Home data not found in the database', success: false });
        }

        console.log('homeData',homeData)
        const { keyId, keySecret } = homeData;
        if (!keyId || !keySecret) {
            return res.status(500).send({ message: 'Razorpay keys are missing in the database', success: false });
        }


       const instance = new razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        
        
        const options = {
            amount: Number(totalAmount * 100), // Razorpay expects the amount in paise
            currency: "INR",
        };

        const order = await instance.orders.create(options);



    // Update user
    const user = await userModel.findByIdAndUpdate(
      id,
      { username, email, pincode, address, state, verified },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if ( !mode || !details || !totalAmount || !userId ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields for the order",
      });
    }

    // Calculate the auto-increment ID
    const lastOrder = await orderModel.findOne().sort({ _id: -1 }).limit(1);
    let order_id = lastOrder ? parseInt(lastOrder.orderId) + 1 : 1;

    let nearestWarehouse = null;
let minDistance = Infinity;
// for wearhouse logic 

    let nearestBussWarehouse = null;
let minBussDistance = Infinity;
// for wearhouse logic 

    const ware = await userModel.find({
    type: 5, // Assuming type: 3 is warehouse
    pincode 
  });

 const buss = await userModel.find({
  coverage: { $in: [String(pincode)] }
  })

  
if (latitude && longitude) {

  if(ware){
 
  for (const warehouse of ware) {
    const distance = getDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(warehouse.latitude),
      parseFloat(warehouse.longitude)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestWarehouse = warehouse;
    }
  }
  }else{
 const warehouses = await userModel.find({
    type: 3, // Assuming type: 3 is warehouse
    latitude: { $ne: null },
    longitude: { $ne: null }
  });

  for (const warehouse of warehouses) {
    const distance = getDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(warehouse.latitude),
      parseFloat(warehouse.longitude)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestWarehouse = warehouse;
    }
  }
  }
  

  

    //  return res.status(404).json({
    //     success: false,
    //     message: "Order created successfully",
    //    wareId,
    //    minDistance,
    //    bussId,
    //    pincode,
    //   });



}


   const wareId = nearestWarehouse ? nearestWarehouse._id : null;
const bussId = buss[0] ? buss[0]._id : null;



    // Create new order
    const newOrder = new orderModel({
      details,
      discount,
      items,
      mode,
      payment: 0,
      primary,
      shipping,
      status:1,
      totalAmount,
      userId,
      orderId: order_id,
      // type:2,
    razorpay_order_id: order.id,
      payment:0,longitude,latitude,
      wareId,
      bussId,
      sellId
    });

await newOrder.save();

    // Update user's orders
    user.orders.push(newOrder);
    await user.save();

    // // ✅ Validate product ID and update stock
    // for (const item of items) {
    //   if (!mongoose.Types.ObjectId.isValid(item.id)) {
    //     throw new Error(`Invalid product ID format: ${item.id}`);
    //   }

    //   const product = await productModel.findById(item.id);
    //   if (!product) {
    //     throw new Error(`Product not found for ID: ${item.id}`);
    //   }

    //   product.stock -= item.quantity;
    //   await product.save({ session });
    // }

    // Commit transaction
    // await session.commitTransaction();
    // transactionInProgress = false;

    // if (mode === "COD") {
    //   await sendOrderConfirmationEmail(email, username, userId, newOrder);
    //   const norder_id = newOrder.orderId;

    //   return res.status(201).json({
    //     success: true,
    //     message: "Order created successfully",
    //     newOrder,
    //     user,
    //     Amount: totalAmount,
    //     online: false,
    //   });
    // } else {
    //   const tid = Math.floor(Math.random() * 1000000);
    //   const order_id = newOrder.orderId;
    //   const accessCode = process.env.ACCESS_CODE;
    //   const merchant_id = process.env.MERCHANT_ID;
    //   const WORKING_KEY = process.env.WORKING_KEY;
    //   const redirect_url = process.env.REDIRECT_URL;
    //   const cancel_url = process.env.CANCEL_URL;

    //   return res.status(201).json({
    //     success: true,
    //     online: true,
    //     tid,
    //     order_id,
    //     accessCode,
    //     merchant_id,
    //     WORKING_KEY,
    //     cancel_url,
    //     redirect_url,
    //   });
    // }

         return res.status(201).json({
        success: true,
        message: "Order created successfully",
        Order:newOrder,
        user,
        Amount: totalAmount,
        online: false,
      });


  } catch (error) {
    // if (transactionInProgress) {
    //   try {
    //     await session.abortTransaction();
    //   } catch (abortError) {
    //     console.error("Error aborting transaction:", abortError);
    //   }
    // }
    console.error("Error:", error);
    return res.status(400).json({
      success: false,
      message: "Error while creating order",
      error: error.message,
    });
  }  
};



export const editFullOrderAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, details, status } = req.body;

    console.log("req.body:", req.body);

    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        success: false,
      });
    }

    // ✅ Update status
    if (status !== undefined) {
      order.status = status;
    }
 // ✅ Update status
    if (items !== undefined) {
      order.items = items;
    } // ✅ Update status
    if (details !== undefined) {
      order.details = details;
    }
   
    await order.save();

    return res.status(200).json({
      message: "Order Updated!",
      success: true,
      order,
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      message: `Error while updating Order: ${error.message}`,
      success: false,
    });
  }
};



export const PaymentRequest = async (req, res) => {
  try {
    const tid = Math.floor(Math.random() * 1000000); // Generating random transaction ID
    const order_id = Math.floor(Math.random() * 1000000); // Generating random order ID
    const accessCode = process.env.ACCESS_CODE;
    const merchant_id = process.env.MERCHANT_ID;
    const WORKING_KEY = process.env.WORKING_KEY;
    const redirect_url = process.env.REDIRECT_URL;
    const cancel_url = process.env.CANCEL_URL;
    // Send the data as JSON response
    res.json({
      tid,
      order_id,
      accessCode,
      merchant_id,
      WORKING_KEY,
      cancel_url,
      redirect_url,
    });
  } catch (error) {
    console.error("Error generating payment data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const PaymentResponse = async (req, res) => {
  console.log("req.body.encResp", req.body.encResp);
  const decryptdata = decrypt(req.body.encResp, process.env.WORKING_KEY);
  console.log("decryptdata", decryptdata);

  // Split the decrypted data into key-value pairs
  const keyValuePairs = decryptdata.split("&");

  // Create an object to store the key-value pairs
  const data = {};
  keyValuePairs.forEach((pair) => {
    const [key, value] = pair.split("=");
    data[key] = value;
  });

  // Extract order_id and order_status
  const orderId = data["order_id"];
  const orderStatus = data["order_status"];
  const orderAmt = Math.floor(data["amount"]);

  console.log("Order ID:", orderId);
  console.log("Order Status:", orderStatus);

  const order = await orderModel.findOne({ orderId }).populate("userId");

  const ordertotal = order.totalAmount;

  console.log("fetch data", data);
  console.log("fetch amt", orderAmt);
  console.log("order amt", ordertotal);

  if (!order) {
    console.log("order not found");
  } else {
    const user = order.userId[0]; // Assuming there's only one user associated with the order

    // Accessing user ID, username, and email
    const userId = user._id; // User ID
    const username = user.username;
    const email = user.email;
    const phone = user.phone;

    if (orderStatus === "Success" && orderAmt === ordertotal) {
      // Update payment details
      order.payment = 1;
      order.status = "1";
      // // Send order confirmation email
      await sendOrderConfirmationEmail(email, username, userId, order);

      // block
      console.log(otp);
      //   await sendOrderOTP(phone, order._id);
    } else {
      // Update payment details
      order.payment = 0;
      order.status = "0";
    }

    // Save the order details
    await order.save();
  }

  if (orderStatus === "Success") {
    // Redirect after saving data
    res.redirect(process.env.COMPLETE_STATUS);
  } else {
    res.redirect(process.env.CANCEL_STATUS);
  }
};

async function sendOrderConfirmationEmail(email, username, userId, newOrder) {
  try {
    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      // SMTP configuration
      host: process.env.MAIL_HOST, // Update with your SMTP host
      port: process.env.MAIL_PORT, // Update with your SMTP port
      secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
      auth: {
        user: process.env.MAIL_USERNAME, // Update with your email address
        pass: process.env.MAIL_PASSWORD, // Update with your email password
      },
    });

    // Email message
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
      to: email, // Update with your email address
      cc: process.env.MAIL_FROM_ADDRESS,
      subject: "www.cayroshop.com Order Confirmation",

      //   html: `

      //   <div class="bg-light w-100 h-100" style="background-color:#f8f9fa!important;width: 90%;font-family:sans-serif;padding:20px;border-radius:10px;padding: 100px 0px;margin: auto;">
      //   <div class="modal d-block" style="
      //      width: 500px;
      //      background: white;
      //      padding: 20px;
      //      margin: auto;
      //      border: 2px solid #8080802e;
      //      border-radius: 10px;
      //  ">
      //    <div class="modal-dialog">
      //      <div class="modal-content" style="
      //      text-align: center;
      //  ">
      //        <div class="modal-header">
      //  <h1 style="color:black;"> cayroshop <h1>
      //        </div>
      //        <div class="modal-body text-center">
      //          <h5 style="
      //      margin: 0px;
      //      margin-top: 14px;
      //      font-size: 20px;color:black;
      //  "> Order Id : #${newOrder.orderId} </h5>
      //         <p style="color:black;" >Hey ${username},</p>
      //        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#47ca00" stroke-width="2" stroke-linecap="square" stroke-linejoin="arcs"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      //         <h2 style="color:black;"> Your Order Is Confirmed! </h2>

      //         <p style="color:black;" > We'll send you a shipping confirmation email
      //  as soon as your order ships. </p>
      //        </div>
      //        <div class="modal-footer">

      //        <a href="https://cayroshop.com/account/order/${userId}/${newOrder._id}"  style="
      //      background: green;
      //      color: white;
      //      padding: 10px;
      //      display: block;
      //      margin: auto;
      //      border-radius: 6px;
      //      text-decoration: none;
      //  "> Track Order</a>
      //        </div>
      //      </div>
      //    </div>
      //  </div> </div>
      //   `

      html: `  <table style="margin:50px auto 10px;background-color:white;border: 2px solid #858585;padding:50px;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;-webkit-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);-moz-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);     font-family: sans-serif; border-top: solid 10px #ff8800;">
    <thead>
      <tr> 
      <th style="text-align:left;"> 
      <img width="200" src="https://backend-9mwl.onrender.com/uploads/new/image-1712823999415.png" />
 </th>
        <th style="text-align:right;font-weight:400;"> ${new Date(
        newOrder.createdAt
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })} </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="height:35px;"></td>
      </tr>
      <tr>
        <td colspan="2" style="border: solid 1px #ddd; padding:10px 20px;">
          <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:150px">Order status</span><b style="color:green;font-weight:normal;margin:0">Placed</b></p>
          <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Order ID</span> ${newOrder.orderId
        }</p>
          <p style="font-size:14px;margin:0 0 0 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Order amount</span> Rs. ${newOrder.totalAmount
        }</p>
          <p style="font-size:14px;margin:0 0 0 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Payment Mode</span> ${newOrder.mode
        }</p>
        </td>
      </tr>
      <tr>
        <td style="height:35px;"></td>
      </tr>
      <tr>
        <td  style="width:50%;padding:20px;vertical-align:top">
          <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span style="display:block;font-weight:bold;font-size:13px">Name</span> ${newOrder.details[0].username
        } </p>
          <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span style="display:block;font-weight:bold;font-size:13px;">Email</span>  ${newOrder.details[0].email
        }  </p>
      
          
        </td>
        <td style="width:50%;padding:20px;vertical-align:top">
            <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span style="display:block;font-weight:bold;font-size:13px;">Phone</span> +91-${newOrder.details[0].phone
        }</p>
          <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span style="display:block;font-weight:bold;font-size:13px;">Address</span> ${newOrder.details[0].address
        } </p>
           
          
        </td>
      </tr>
      
      <tr>
<td colspan="2" > 

<table class="table table-borderless" style="border-collapse: collapse; width: 100%;">
    <tbody>
    <tr>
        <td  style="padding: 10px;font-weight:bold;">Items</td>
        <td   style="padding: 10px;font-weight:bold;">GST</td>

        <td   style="padding: 10px;font-weight:bold;">Quantity</td>
             <td  style="padding: 10px;text-align:right;font-weight:bold;">Price</td>
      </tr>

      ${newOrder.items
          .map(
            (Pro) => `
        <tr>
          <td  style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;" >
            <div className="d-flex mb-2">
              <div className="flex-shrink-0">
                <img
                  src="${Pro.image}"
                  alt=""
                  width="35"
                  className="img-fluid"
                />
              </div>
              <div className="flex-lg-grow-1 ms-3">
                <h6 className="small mb-0">
                  <a href="https://cayroshop.com/product/${Pro.id}" style="font-size:10px;">
                    ${Pro.title}  
                  </a>
                </h6>

              </div>
            </div>
          </td>
          <td  style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;"> ${Pro.gst}% </td>

          <td  style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;"> ${Pro.quantity} </td>

          <td  style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;text-align: right;" >₹ ${Pro.price}</td>
        </tr>
        `
          )
          .join("")}

    </tbody>
    <tfoot>
        <tr>
            <td colspan="2" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;">Subtotal</td>
            <td  colspan="2"  class="text-end" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;text-align: right;">₹${newOrder.items.reduce(
            (total, item) => total + item.quantity * item.price,
            0
          ) -
        Math.floor(
          newOrder.items.reduce((acc, item) => {
            const itemPrice = item.quantity * item.price;
            const itemGST = (itemPrice * item.gst) / 100;
            return acc + itemGST;
          }, 0)
        )
        }</td>
        </tr>

       
      
        <tr>
        <td colspan="2" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;">GST </td>
        <td colspan="2"  class="text-end" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;text-align: right;">₹${Math.floor(
          newOrder.items.reduce((acc, item) => {
            const itemPrice = item.quantity * item.price;
            const itemGST = (itemPrice * item.gst) / 100;
            return acc + itemGST;
          }, 0)
        )}</td>
    </tr>

        <tr>
            <td colspan="2" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;">Shipping</td>
            <td colspan="2"  class="text-end" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;text-align: right;">₹${newOrder.shipping
        }</td>
        </tr>
        <tr>
            <td colspan="2" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;">Discount</td>
            <td colspan="2"  class="text-danger text-end" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6; text-align: right;">
           - ${newOrder.items.reduce(
          (total, item) => total + item.quantity * item.price,
          0
        ) -
          Math.abs(newOrder.discount) ===
          0
          ? "0"
          : Math.abs(newOrder.discount)
        }
          </td>
        </tr>
        <tr class="fw-bold">
            <td colspan="2" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;">TOTAL</td>
            <td colspan="2"  class="text-end" style="padding: .75rem; vertical-align: top; border-top: 1px solid #dee2e6;text-align: right;">₹${newOrder.totalAmount
        }</td>
        </tr>
    </tfoot>
</table>
</td>

      </tr>
    </tbody>
    <tfooter>
      <tr>
        <td colspan="2" style="font-size:14px;padding:50px 15px 0 15px;">
        
        
          <strong style="display:block;margin:0 0 10px 0;">Regards</strong> 
          
          <address><strong class="mb-2"> CAYRO ENTERPRISES </strong><br>
          <b title="Phone" class="mb-2">Web:</b>www.cayroshop.com <br></address>
         
        </td>
      </tr>
    </tfooter>
  </table> `,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Transfer-Encoding": "quoted-printable",
      },
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
}

export const EmailVerify = async (req, res) => {
  const { email } = req.body;

  // Generate a random OTP
  const OTP = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit numeric OTP

  // Configure nodemailer transporter
  const transporter = nodemailer.createTransport({
    // SMTP configuration
    host: process.env.MAIL_HOST, // Update with your SMTP host
    port: process.env.MAIL_PORT, // Update with your SMTP port
    secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
    auth: {
      user: process.env.MAIL_USERNAME, // Update with your email address
      pass: process.env.MAIL_PASSWORD, // Update with your email password
    },
  });
console.log('OTP',OTP)
  // Email message
  const mailOptions = {
    from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
    to: email, // Update with your email address
    subject: "OTP Verification cayroshop.com",
    text: `OTP: ${OTP}`,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send("Failed to send email");
    } else {
      console.log("Email sent: " + info.response);
      // If email sending is successful, return a success response
      res.status(201).json({
        success: true,
        message: "Email sent successfully",
        OTP: OTP, // Include OTP in the response if needed
      });
    }
  });
};

export const HomeSendEnquire = async (req, res) => {
  const { fullname, email, phone, service, QTY, userId,
    senderId,type } = req.body;

  try {



      const usersType3 = await userModel.find({ type: 3 });

    if (!usersType3.length) {
      console.log("No users with type 3 found.");
    }

    // 2️⃣ Create a list of enquiries — one for each user type 3
    const enquiries = usersType3.map((user) => ({
      fullname,
      email,
      phone,
      service,
      QTY: QTY ?? 1,
      userId: user._id,   // send to each user of type 3
      senderId,
      type,
    }));

    // 3️⃣ Insert all enquiries in one go
    await enquireModel.insertMany(enquiries);


    // // Save data to the database
    // const newEnquire = new enquireModel({
    //   fullname,
    //   email,
    //   phone,
    //   service,
    //   QTY:QTY ?? 1,
    //   userId,
    //   senderId,
    //   type
    // });

    // await newEnquire.save();



      

    // // Configure nodemailer transporter
    // const transporter = nodemailer.createTransport({
    //   // SMTP configuration
    //   host: process.env.MAIL_HOST, // Update with your SMTP host
    //   port: process.env.MAIL_PORT, // Update with your SMTP port
    //   secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
    //   auth: {
    //     user: process.env.MAIL_USERNAME, // Update with your email address
    //     pass: process.env.MAIL_PASSWORD, // Update with your email password
    //   },
    // });

    // const recipients = userEmail
    //   ? `${userEmail}, ${process.env.MAIL_TO_ADDRESS}`
    //   : process.env.MAIL_TO_ADDRESS;

    // // Email message
    // const mailOptions = {
    //   from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
    //   to: recipients, // Update with your email address
    //   subject: "New Enquire Form Submission",
    //   text: `Name: ${fullname}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nQTY:${QTY}`,
    // };

    // Send email
    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error(error);
    //     res.status(500).send("Failed to send email");
    //   } else {
    //     console.log("Email sent: " + info.response);
    //     res.status(200).send("Email sent successfully");
    //   }
    // });

            res.status(200).send("Email sent successfully");

            
  } catch (error) {
    console.error("Error in send data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



// export const HomeSendEnquire = async (req, res) => {

  
//     // Calculate the auto-increment ID
//     const lastOrder = await orderModel.findOne().sort({ _id: -1 }).limit(1);
//     let order_id;

//     if (lastOrder) {
//       // Convert lastOrder.orderId to a number before adding 1
//       const lastOrderId = parseInt(lastOrder.orderId);
//       order_id = lastOrderId + 1;
//     } else {
//       order_id = 1;
//     }


//   const {
//     fullname,
//     email,
//     phone,
//     service,
//     pincode,
//     state,
//     statename,
//     address,
//     city,
//     bookingDate,
//     bookingTime,
//     requirement,
//     category, 
//     longitude,
//     latitude,
//   } = req.body;
 
//  if(!longitude && !latitude ){
//     console.log(longitude,latitude)
//     res.status(500).send("longitude and latitude is required");
//  }
 
//   try {
//     // Save data to the database
//     const newEnquire = new orderModel({
//       fullname,
//       email,
//       phone,
//       service,
//       pincode,
//       state,
//       statename,
//       address,
//       city,
//       bookingDate,
//       bookingTime,
//       requirement,
//       type:1,
//       orderId:order_id,
//       longitude,
//       latitude,
//       category: Array.isArray(category) ? category[0] : category  // Convert array to string
//     });

//     await newEnquire.save();

        
// //        // Create the notification data object with dynamic values
// // const notificationData = {
// //   mobile: "918100188188",  // Replace with dynamic value if needed
// //   templateid: "1193466729031008", // Template ID
// //   overridebot: "yes", // Optional: Set to "yes" or "no"
// //   template: {
// //     components: [
// //       {
// //         type: "body",
// //         parameters: [
// //           { type: "text", text: fullname || "NA" },  
// //           { type: "text", text: phone || "NA" },  
// //           { type: "text", text: email || "NA" }, 
// //           { type: "text", text: service || "NA" }, 
// //           { type: "text", text: QTY || "NA" }  
// //         ]
// //       }
// //     ]
// //   }
// // };
  
// //    const WHATSAPP =   await axios.post(process.env.WHATSAPPAPI, notificationData, {
// //         headers: {
// //           "API-KEY": process.env.WHATSAPPKEY,
// //           "Content-Type": "application/json"
// //         }
// //       });
// //       console.log('WHATSAPP',WHATSAPP)

//     // Configure nodemailer transporter
//     // const transporter = nodemailer.createTransport({
//     //   // SMTP configuration
//     //   host: process.env.MAIL_HOST, // Update with your SMTP host
//     //   port: process.env.MAIL_PORT, // Update with your SMTP port
//     //   secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
//     //   auth: {
//     //     user: process.env.MAIL_USERNAME, // Update with your email address
//     //     pass: process.env.MAIL_PASSWORD, // Update with your email password
//     //   },
//     // });

//     // // Conditional recipient list
//     // const recipients = userEmail
//     //   ? `${userEmail}, ${process.env.MAIL_TO_ADDRESS}`
//     //   : process.env.MAIL_TO_ADDRESS;

//     // // Email message
//     // const mailOptions = {
//     //   from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
//     //   to: recipients, // Update with your email address
//     //   subject: "New Enquire Form Submission",
//     //   text: `Name: ${fullname}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nQTY:${QTY}`,
//     // };

//     // Send email
//     // transporter.sendMail(mailOptions, (error, info) => {
//     //   if (error) {
//     //     console.error(error);
//     //     res.status(500).send("Failed to send email");
//     //   } else {
//     //     console.log("Email sent: " + info.response);
//     //     res.status(200).send("Email sent successfully");
//     //   }
//     // });

//     res.status(200).send("Email sent successfully");


//   } catch (error) {
//     console.error("Error in send data:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };

export const HomeSendEnquire_new = async (req, res) => {
  
  // Calculate the auto-increment ID
  const lastOrder = await orderModel.findOne().sort({ _id: -1 }).limit(1);
  let order_id;

  if (lastOrder) {
    const lastOrderId = parseInt(lastOrder.orderId);
    order_id = lastOrderId + 1;
  } else {
    order_id = 1;
  }

  const {
    fullname,
    email,
    phone,
    service,
    pincode,
    state,
    statename,
    address,
    city,
    bookingDate,
    bookingTime,
    requirement,
    category, 
    longitude,
    latitude,
  } = req.body;

 
  try {
    // Save data to the database
    const newEnquire = new orderModel({
      fullname,
      email,
      phone,
      service,
      pincode,
      state,
      statename,
      address,
      city,
      bookingDate,
      bookingTime,
      requirement,
      type: 1,
      orderId: order_id,
      longitude,
      latitude,
      category: Array.isArray(category) ? category[0] : category, // Convert array to string
    });

    await newEnquire.save();

    // Send the success response once everything is processed
    res.status(200).send("Enquiry submitted successfully");

  } catch (error) {
    console.error("Error in send data:", error);
    // Handle error and send response only once
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const HomeSendEnquireCatgeory = async (req, res) => {
  const {
    fullname,
    email,
    phone,
    service,
    requirement,
    userId,
    userEmail,
  } = req.body;

  console.log(userId, userEmail);

  try {

    // Check if phone number already exists
    const existingPhone = await userModel.findOne({ phone });
    if (existingPhone) {
      // Just save the enquiry, do not create user
      const newEnquire = new enquireModel({
        fullname,
        email,
        phone,
        service,
        requirement,
        userId,
        userEmail,
      });

      await newEnquire.save();

      return res.status(200).json({
        success: true,
        message: "Enquiry sent successfully. User already exists by phone.",
      });
    }

        // Check if email already exists
        const existingEmail = await userModel.findOne({ email });
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: "Email already exists",
          });
        }
    
    // If both email and phone are new, create new user and save enquiry
    const user = new userModel({
      username: fullname,
      email,
      phone,
      type:2
    });

    await user.save();

    const newEnquire = new enquireModel({
      fullname,
      email,
      phone,
      service,
      requirement,
      userId,
      userEmail,
    });

    await newEnquire.save();

    return res.status(200).json({
      success: true,
      message: "Enquiry sent and user created successfully",
      user,
    });

  } catch (error) {
    console.error("Error in sending data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const contactSendEnquire = async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Configure nodemailer transporter
  const transporter = nodemailer.createTransport({
    // SMTP configuration
    host: process.env.MAIL_HOST, // Update with your SMTP host
    port: process.env.MAIL_PORT, // Update with your SMTP port
    secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
    auth: {
      user: process.env.MAIL_USERNAME, // Update with your email address
      pass: process.env.MAIL_PASSWORD, // Update with your email password
    },
  });

  // Email message
  const mailOptions = {
    from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
    to: process.env.MAIL_TO_ADDRESS, // Update with your email address
    subject: "New Contact Us Form Submission",
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send("Failed to send email");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send("Email sent successfully");
    }
  });
};

export const updateUserAndCreateOrderController_oldd = async (req, res) => {
  let session;
  let transactionInProgress = false;
  const { id } = req.params;
  const {
    username,
    email,
    address,
    pincode,
    details,
    discount,
    items,
    mode,
    payment,
    primary,
    shipping,
    status,
    totalAmount,
    userId,
  } = req.body;

  const options = {
    amount: totalAmount * 100, // amount in smallest currency unit (e.g., paisa for INR)
    currency: "INR",
    receipt: "order_rcptid_" + Math.floor(Math.random() * 1000),
  };

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    transactionInProgress = true;

    // Update user
    const user = await userModel.findByIdAndUpdate(
      id,
      { username, email, pincode, address },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create order for the updated user
    if (!status || !mode || !details || !totalAmount || !userId || !payment) {
      console.log("status:", status);
      console.log("mode:", mode);
      console.log("details:", details);
      console.log("totalAmount:", totalAmount);
      console.log("userId:", userId);
      console.log("payment:", payment);
      console.log("shipping:", shipping);

      return res.status(400).json({
        success: false,
        message: "Please provide all fields for the order",
      });
    }

    const order = await Razorpay.orders.create(options);
    const apiKey = process.env.RAZORPAY_API_KEY;

    const newOrder = new orderModel({
      details,
      discount,
      items,
      mode,
      payment: 0,
      primary,
      shipping,
      status,
      totalAmount,
      userId,
      orderId: order.id,
    });

    await newOrder.save({ session });
    user.orders.push(newOrder);
    await user.save({ session });

    // Update stock quantity for each product in the order
    for (const item of items) {
      const product = await productModel.findById(item.id);
      if (product) {
        product.stock -= item.quantity; // Decrement stock by the quantity ordered
        await product.save({ session });
      }
    }

    await session.commitTransaction();
    transactionInProgress = false;

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      newOrder,
      order,
      apiKey,
      user,
      Amount: totalAmount,
    });
  } catch (error) {
    if (transactionInProgress) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error("Error aborting transaction:", abortError);
      }
    }
    console.error("Error:", error);
    return res.status(400).json({
      success: false,
      message: "Error while creating order",
      error: error.message,
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

export const razorpayCallback = async (req, res) => {
  const { payment_id, order_id, status } = req.body;

  try {
    if (status === "paid") {
      // Payment successful, update order status to paid
      await orderModel.findOneAndUpdate({ orderId: order_id }, { payment: 1 });
    } else if (status === "failed") {
      // Payment failed, update order status to unpaid
      await orderModel.findOneAndUpdate({ orderId: order_id }, { payment: 2 });
    }
    res.status(200).send("Order status updated successfully.");
  } catch (error) {
    res.status(500).send("Error updating order status: " + error.message);
  }
};

//category fillter

export const GetAllCategoriesByParentIdController_old = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { filter, price, page = 1, perPage = 2 } = req.query; // Extract filter, price, page, and perPage query parameters

    // Check if parentId is undefined or null
    if (!parentId) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid parent ID.",
      });
    }

    // Call the recursive function to get all categories
    const categories = await getAllCategoriesByParentId(parentId);
    const MainCat = await categoryModel
      .findById(parentId)
      .select("title description slug")
      .lean();

    const filters = { Category: parentId }; // Initialize filters with parent category filter

    if (filter) {
      // Parse the filter parameter
      const filterParams = JSON.parse(filter);

      // Iterate through each parameter in the filter
      Object.keys(filterParams).forEach((param) => {
        // Split parameter values by comma if present
        const paramValues = filterParams[param].split(",");

        // Check if there are multiple values for the parameter
        if (paramValues.length > 1) {
          filters[`variations.${param}.${param}`] = { $all: paramValues };
        } else {
          // If only one value, handle it as a single filter
          filters[`variations.${param}.${param}`] = { $in: paramValues };
        }
      });
    }

    // Check if price parameter is provided and not blank
    if (price && price.trim() !== "") {
      const priceRanges = price.split(","); // Split multiple price ranges by comma
      const priceFilters = priceRanges.map((range) => {
        const [minPrice, maxPrice] = range.split("-"); // Split each range into min and max prices
        return {
          salePrice: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) },
        };
      });

      // Add price filters to the existing filters
      filters.$or = priceFilters;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * perPage;

    // Fetch products based on filters with pagination
    const products = await productModel
      .find(filters)
      .select("_id title regularPrice salePrice pImage variations")
      .skip(skip)
      .limit(perPage)
      .lean();

    const Procat = { Category: parentId }; // Initialize filters with parent category filter
    const productsFilter = await productModel
      .find(Procat)
      .select("_id regularPrice salePrice")
      .lean();

    const proLength = products.length;
    return res.status(200).json({
      success: true,
      categories,
      MainCat,
      products,
      proLength,
      productsFilter,
    });
  } catch (error) {
    console.error("Error in GetAllCategoriesByParentIdController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const GetAllCategoriesByParentIdController = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { filter, price, page = 1, perPage = 2 } = req.query; // Extract filter, price, page, and perPage query parameters

    // Check if parentId is undefined or null
    if (!parentId) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid parent ID.",
      });
    }

    // Call the recursive function to get all categories
    const categories = await getAllCategoriesByParentId(parentId);
    const MainCat = await categoryModel
      .findById(parentId)
      .select("title metaTitle metaDescription metaKeywords image description slug canonical")
      .lean();

    const filters = { Category: parentId }; // Initialize filters with parent category filter


    // Handle variation filters
    if (filter) {
      let filterParams;
      try {
        filterParams = JSON.parse(filter);
      } catch (err) {
        console.error("Invalid filter JSON:", err);
        return res.status(400).json({ success: false, message: "Invalid filter format." });
      }

      // Loop through filter params and create dynamic queries for each variation name
      const variationFilters = Object.entries(filterParams).map(([variationName, valueString]) => {
        const values = valueString.split(",").map(v => v.trim()).filter(Boolean);
        return {
          $elemMatch: {
            name: variationName,
            value: { $in: values },
          }
        };
      });

      // If variations are provided in the filter, apply them to the main filters
      if (variationFilters.length > 0) {
        filters.variations = { $all: variationFilters };
      }
    }

    // Check if price parameter is provided and not blank
    if (price && price.trim() !== "") {
      const priceRanges = price.split(","); // Split multiple price ranges by comma
      const priceFilters = priceRanges.map((range) => {
        const [minPrice, maxPrice] = range.split("-"); // Split each range into min and max prices
        return {
          salePrice: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) },
        };
      });

      // Add price filters to the existing filters
      filters.$or = priceFilters;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * perPage;

    // Fetch products based on filters with pagination
    const products = await productModel
      .find(filters)
      .select("_id title regularPrice salePrice pImage variations")
      .skip(skip)
      .limit(perPage)
      .lean();

    const Procat = { Category: parentId }; // Initialize filters with parent category filter
    const productsFilter = await productModel
      .find(Procat)
      .select("_id regularPrice salePrice variations")
      .lean();

    const proLength = products.length;
    return res.status(200).json({
      success: true,
      categories,
      MainCat,
      products,
      proLength,
      productsFilter,
    });
  } catch (error) {
    console.error("Error in GetAllCategoriesByParentIdController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const GetAllCategoriesBySlugController_old = async (req, res) => {
  try {
    const { parentSlug } = req.params;
    const { filter, price, page = 1, perPage = 2,location } = req.query;

    // Check if parentSlug is undefined or null
    if (!parentSlug) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid parent ID.",
      });
    }

    // Fetch the main category with status check
    const MainCat = await categoryModel
      .findOne({ slug: parentSlug, status: "true" })
      .select(
        "title metaTitle metaDescription metaKeywords image description specifications slide_head slide_para filter slug canonical"
      )
      .lean();

    // Check if the MainCat exists
    if (!MainCat) {
      return res.status(404).json({
        success: false,
        message: "Category not found or inactive.",
      });
    }

    const parentId = MainCat._id;
    const categories = await getAllCategoriesByParentId(parentId);

    const filters = { Category: parentId, status: "true" }; // Add status filter for products

  
    // Handle variation filters
    if (filter) {
      let filterParams;
      try {
        filterParams = JSON.parse(filter);
      } catch (err) {
        console.error("Invalid filter JSON:", err);
        return res.status(400).json({ success: false, message: "Invalid filter format." });
      }

      // Loop through filter params and create dynamic queries for each variation name
      const variationFilters = Object.entries(filterParams).map(([variationName, valueString]) => {
        const values = valueString.split(",").map(v => v.trim()).filter(Boolean);
        return {
          $elemMatch: {
            name: variationName,
            value: { $in: values },
          }
        };
      });

      // If variations are provided in the filter, apply them to the main filters
      if (variationFilters.length > 0) {
        filters.variations = { $all: variationFilters };
      }
    }


    // Check if price parameter is provided
    if (price && price.trim() !== "") {
      const priceRanges = price.split(",");
      const priceFilters = priceRanges.map((range) => {
        const [minPrice, maxPrice] = range.split("-");
        return {
          salePrice: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) },
          status: "true", // Ensure products are active
        };
      });

      filters.$or = priceFilters;
    }
 
    if (location) {
      const trimmedLocation = location.trim();
      const matchingUsers = await userModel.find({
        coverage: { $elemMatch: { $regex: new RegExp(`^${trimmedLocation}$`, 'i') } }
      }).select('_id');
    
      const matchingUserIds = matchingUsers.map(user => user._id);
    
      if (matchingUserIds.length > 0) {
        filters['userId'] = { $in: matchingUserIds };
    }
  }
    
    
    

    const skip = (page - 1) * perPage;

    // Fetch products based on filters with pagination
    const products = await productModel
      .find(filters)
      .select("_id title regularPrice salePrice pImage variations slug features userId")
      .populate('userId', 'username phone email coverage address')
       .skip(skip)
      .limit(perPage)
      
 
    const Procat = { Category: parentId, status: "true" }; // Add status filter for products
    const productsFilter = await productModel
      .find(Procat)
      .select("_id regularPrice salePrice variations slug")
      .lean();

    const proLength = await productModel.countDocuments(filters);
    return res.status(200).json({
      success: true,
      categories,
      MainCat,
      products,
      proLength,
      productsFilter,
    });
  } catch (error) {
    console.error("Error in GetAllCategoriesBySlugController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

 
export const GetAllCategoriesBySlugController = async (req, res) => {
  try {
    const { parentSlug } = req.params;
    const { filter, price, page = 1, perPage = 2, location } = req.query;

    if (!parentSlug) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid parent ID.",
      });
    }

    const MainCat = await categoryModel
      .findOne({ slug: parentSlug, status: "true" })
      .select(
        "title metaTitle metaDescription metaKeywords image description specifications slide_head slide_para filter slug canonical"
      )
      .lean();

    if (!MainCat) {
      return res.status(404).json({
        success: false,
        message: "Category not found or inactive.",
      });
    }

    const parentId = MainCat._id;
    const categories = await getAllCategoriesByParentId(parentId);

    const filters = { Category: parentId, status: "true" };

    // ----- variation filters -----
    if (filter) {
      let filterParams;
      try {
        filterParams = JSON.parse(filter);
      } catch (err) {
        console.error("Invalid filter JSON:", err);
        return res.status(400).json({ success: false, message: "Invalid filter format." });
      }

      const variationFilters = Object.entries(filterParams).map(([variationName, valueString]) => {
        const values = valueString.split(",").map(v => v.trim()).filter(Boolean);
        return {
          $elemMatch: {
            name: variationName,
            value: { $in: values },
          }
        };
      });

      if (variationFilters.length > 0) {
        filters.variations = { $all: variationFilters };
      }
    }

    // ----- price filters -----
    if (price && price.trim() !== "") {
      const priceRanges = price.split(",");
      const priceFilters = priceRanges.map((range) => {
        const [minPrice, maxPrice] = range.split("-");
        return {
          salePrice: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) },
          status: "true",
        };
      });

      filters.$or = priceFilters;
    }

    // ----- location → restrict by product's seller coverage -----
    if (location) {
      const trimmedLocation = location.trim();
      const matchingUsers = await userModel.find({
        coverage: { $elemMatch: { $regex: new RegExp(`^${trimmedLocation}$`, "i") } }
      }).select("_id");

      const matchingUserIds = matchingUsers.map(user => user._id);
      if (matchingUserIds.length > 0) {
        filters.userId = { $in: matchingUserIds };
      }
    }

    const skip = (Number(page) - 1) * Number(perPage);

    // ----- products -----
    const products = await productModel
      .find(filters)
      .select("_id title regularPrice salePrice pImage variations slug features userId")
      .populate("userId", "username phone email coverage address")
      .skip(skip)
      .limit(Number(perPage));

    const Procat = { Category: parentId, status: "true" };
    const productsFilter = await productModel
      .find(Procat)
      .select("_id regularPrice salePrice variations slug")
      .lean();

    const proLength = await productModel.countDocuments(filters);

    // =====================================================================
    // NEW: Random active ad image for this category tree (+ optional location)
    // =====================================================================
    // Build category id list = parent + descendants
    const catIds = [parentId, ...((categories || []).map(c => c._id))];

    // Base ads match: paid + category match
    const adsMatch = {
      payment: 1,
      Category: { $in: catIds },
    };

    // Optional coverage/location match (schema shows Object, data shows array; handle both)
    if (location && location.trim()) {
      const loc = location.trim();
      adsMatch.$or = [
        { coverage: { $elemMatch: { $regex: new RegExp(`^${loc}$`, "i") } } }, // array case
        { coverage: { $regex: new RegExp(`^${loc}$`, "i") } },                 // string case
      ];
    }

    let adsImage = null;
    let adsImageLink = null;
    let thumbnail = null;

    try {
      const now = new Date();

      // sample ONE active ad
      const sampled = await buyPlanAdsModel.aggregate([
        { $match: adsMatch },
        {
          $addFields: {
            endAt: {
              $cond: [
                { $eq: ["$type", 0] }, // 0 = hourly
                { $dateAdd: { startDate: "$createdAt", unit: "hour", amount: { $ifNull: ["$Quantity", 0] } } },
                { $dateAdd: { startDate: "$createdAt", unit: "day",  amount: { $ifNull: ["$Quantity", 0] } } },
              ]
            }
          }
        },
        { $match: { endAt: { $gt: now } } },  // still active
        { $sample: { size: 1 } },
        { $project: { _id: 0, img: 1, adslink: 1,thumbnail:1 } }
      ]);

      if (sampled && sampled.length) {
        adsImage = sampled[0].img || null;
        adsImageLink = sampled[0].adslink || null;
        thumbnail = sampled[0].thumbnail || null;
      } else {
        // Fallback: sample any active ad for these categories (ignore coverage)
        const fallback = await buyPlanAdsModel.aggregate([
          { $match: { payment: 1, Category: { $in: catIds } } },
          {
            $addFields: {
              endAt: {
                $cond: [
                  { $eq: ["$type", 0] },
                  { $dateAdd: { startDate: "$createdAt", unit: "hour", amount: { $ifNull: ["$Quantity", 0] } } },
                  { $dateAdd: { startDate: "$createdAt", unit: "day",  amount: { $ifNull: ["$Quantity", 0] } } },
                ]
              }
            }
          },
          { $match: { endAt: { $gt: now } } },
          { $sample: { size: 1 } },
          { $project: { _id: 0, img: 1, adslink: 1 } }
        ]);

        if (fallback && fallback.length) {
          adsImage = fallback[0].img || null;
          adsImageLink = fallback[0].adslink || null;
          thumbnail = fallback[0].thumbnail || null;
        }
      }
    } catch (e) {
      console.error("Error sampling ads image:", e);
    }

    // ----- response -----
    return res.status(200).json({
      success: true,
      categories,
      MainCat,
      products,
      proLength,
      productsFilter,
      adsImage,      // e.g. "uploads/new/adsinput-1758880710665.png"
      adsImageLink,  // optional: link to open when clicking the ad
       thumbnail ,

    });
  } catch (error) {
    console.error("Error in GetAllCategoriesBySlugController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getAllCategoriesByParentId = async (parentId) => {
  try {
    const categories = await categoryModel.find({ parent: parentId }).lean();

    if (!categories || categories.length === 0) {
      return [];
    }

    const result = [];

    for (const category of categories) {
      const { _id, title, image, slug /* other fields */ } = category;

      const categoryData = {
        _id,
        title,
        image,
        subcategories: await getAllCategoriesByParentId(_id), // Recursive call
        slug,
      };

      result.push(categoryData);
    }

    return result;
  } catch (error) {
    console.error("Error while fetching categories:", error);
    throw error;
  }
};

export const userOrdersController = async (req, res) => {
  try {
    const userOrder = await userModel.findById(req.params.id).populate({
      path: "orders",
      select: "_id createdAt totalAmount status mode orderId", // Select only _id and title fields
      options: {
        sort: { createdAt: -1 }, // Sort by createdAt field in descending order
      },
    });

    if (!userOrder) {
      return res.status(200).send({
        message: "Order Not Found By user",
        success: false,
      });
    }
    return res.status(200).json({
      message: " user Orders!",
      success: true,
      userOrder,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error WHile Getting Orders",
      error,
    });
  }
};

export const userOrdersViewController = async (req, res) => {
  try {
    const { userId, orderId } = req.params;

    // Find the user by ID and populate their orders
    const userOrder = await userModel.findById(userId).populate({
      path: "orders",
      match: { _id: orderId }, // Match the order ID
    });

    // If user or order not found, return appropriate response
    if (!userOrder || !userOrder.orders.length) {
      return res.status(404).json({
        message: "Order Not Found By user or Order ID",
        success: false,
      });
    }

    // If user order found, return success response with the single order
    return res.status(200).json({
      message: "Single Order Found By user ID and Order ID",
      success: true,
      userOrder: userOrder.orders[0], // Assuming there's only one order per user
    });
  } catch (error) {
    // If any error occurs during the process, log it and return error response
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Error while getting order",
      error,
    });
  }
};

export const FullOrdersViewController = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the user by ID and populate their orders
    const userOrder = await orderModel.findById(orderId).populate('agentId').populate('sellId').exec();
 
    console.log(userOrder,orderId)
    // If user or order not found, return appropriate response
    if (!userOrder) {
      return res.status(400).json({
        message: "Order Not Found By user or Order ID",
        success: false,
      });
    }

    // If user order found, return success response with the single order
    return res.status(200).json({
      message: "Single Order Found By user ID and Order ID",
      success: true,
      userOrder: userOrder, // Assuming there's only one order per user
    });
  } catch (error) {
    // If any error occurs during the process, log it and return error response
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Error while getting order",
      error,
    });
  }
};

export const AddCart = async (req, res) => {
  try {
    const { items, isEmpty, totalItems, totalUniqueItems, cartTotal } =
      req.body;

    const Cart = new cartModel({
      items,
      isEmpty,
      totalItems,
      totalUniqueItems,
      cartTotal,
    });
    await Cart.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      Cart,
    });
  } catch (error) {
    console.error("Error on signup:", error);
    res.status(500).json({
      success: false,
      message: "Error on signup",
      error: error.message,
    });
  }
};

export const UpdateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, isEmpty, totalItems, totalUniqueItems, cartTotal } =
      req.body;
    const Cart = await cartModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    return res.status(200).json({
      message: "Cart Updated!",
      success: true,
      Cart,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating cart: ${error}`,
      success: false,
      error,
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const { id } = req.params;
    const Cart = await cartModel.findById(id);
    if (!Cart) {
      return res.status(200).send({
        message: "Cart Not Found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Cart Found successfully!",
      success: true,
      Cart,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get cart: ${error}`,
      success: false,
      error,
    });
  }
};

export const AddRating = async (req, res) => {
  try {
    const { userId, rating, comment, productId } = req.body;

    // Validation
    if (!userId || !rating || !comment || !productId) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    } else {
      // Create a new user rating instance
      const newUserRating = new ratingModel({
        userId,
        rating,
        comment,
        productId,
      });

      // Save the user rating to the database
      await newUserRating.save();

      return res.status(200).json({
        message: "User rating created successfully!",
        success: true,
        newUserRating,
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: `Error while add rating: ${error}`,
      success: false,
      error,
    });
  }
};

export const AddVendorRating = async (req, res) => {
  try {
    const { userId, rating, comment, vendorId } = req.body;

    // Validation
    if (!userId || !rating || !comment || !vendorId) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    } else {
      // Create a new user rating instance
      const newUserRating = new ratingModel({
        userId,
        rating,
        comment,
        vendorId,
      });

      // Save the user rating to the database
      await newUserRating.save();

      return res.status(200).json({
        message: "User rating created successfully!",
        success: true,
        newUserRating,
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: `Error while add rating: ${error}`,
      success: false,
      error,
    });
  }
};


export const ViewProductRating = async (req, res) => {
  try {
    const productId = req.params.id;

    // Find all ratings for a specific product
    const productRatings = await ratingModel.find({ productId, status: 1 });

    // Fetch user details for each rating
    const ratingsWithUserDetails = await Promise.all(
      productRatings.map(async (rating) => {
        const user = await userModel.findById(rating.userId);
        return {
          rating: rating.rating,
          comment: rating.comment,
          username: user ? user.username : "Unknown",
          createdAt: rating.createdAt,
          userId: user ? user._id : "Unknown",
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Getting product ratings successfully!",
      productRatings: ratingsWithUserDetails,
    });
  } catch (error) {
    console.error("Error getting product ratings:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



export const ViewVendorRating = async (req, res) => {
  try {
    const vendorId = req.params.id;

    // Find all ratings for a specific product
    const productRatings = await ratingModel.find({ vendorId, status: 1 });

    // Fetch user details for each rating
    const ratingsWithUserDetails = await Promise.all(
      productRatings.map(async (rating) => {
        const user = await userModel.findById(rating.userId);
        return {
          rating: rating.rating,
          comment: rating.comment,
          username: user ? user.username : "Unknown",
          createdAt: rating.createdAt,
          userId: user ? user._id : "Unknown",
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Getting vendorId ratings successfully!",
      productRatings: ratingsWithUserDetails.reverse() ?? [],
    });
  } catch (error) {
    console.error("Error getting vendorId ratings:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const ViewCategoryRating = async (req, res) => {
  try {
    // Query the database for all ratings where status is 1
    const ratings = await ratingModel.find({ status: 1 });

    res.status(200).json({ success: true, ratings });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// add Wishlist by user
export const AddWishListByUser = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Validation
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Please provide both userId & productId",
      });
    }

    // Check if the wishlist item already exists for the user
    const existingWishlistItem = await wishlistModel.findOne({
      userId,
      productId,
    });

    if (existingWishlistItem) {
      return res.status(400).json({
        success: false,
        message: "Wishlist item already exists",
      });
    }

    // Create a new wishlist item
    const newWishlistItem = new wishlistModel({
      userId,
      productId,
    });

    // Save the wishlist item to the database
    await newWishlistItem.save();

    return res.status(200).json({
      message: "Wishlist item created successfully!",
      success: true,
      newWishlistItem,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while adding wishlist item: ${error}`,
      success: false,
      error,
    });
  }
};


export const getProductIdUserBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const Product = await productModel.findOne({ slug: slug })
     .populate('userId', 'username phone email coverage');
    if (!Product) {
      return res.status(200).send({
        message: "product Not Found By Id",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch Single product!",
      success: true,
      Product,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get product: ${error}`,
      success: false,
      error,
    });
  }
};


export const ViewWishListByUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find wishlist items for the specified user ID
    const wishlistItems = await wishlistModel.find({ userId });

    // Extract product IDs from wishlist items
    const productIds = wishlistItems.map((item) => item.productId);

    // Fetch product details for each product ID
    const productDetails = await productModel
      .find({ _id: { $in: productIds } })
      .select("_id pImage regularPrice salePrice title");

    // Combine wishlist items with product details
    const wishlistWithProductDetails = wishlistItems.map((item) => {
      const productDetail = productDetails.find(
        (product) => product._id.toString() === item.productId.toString()
      );
      return {
        _id: item._id,
        userId: item.userId,
        productId: item.productId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        productDetail: productDetail, // Add product details to wishlist item
      };
    });

    return res.status(200).json({
      success: true,
      message: "Getting wishlist successfully!",
      wishlist: wishlistWithProductDetails,
    });
  } catch (error) {
    console.error("Error getting wishlist:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteWishListByUser = async (req, res) => {
  try {
    await wishlistModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Wishlist Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Wishlist",
      error,
    });
  }
};

export const AddCompareByUser = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Validation
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Please fill userId & productId",
      });
    } else {
      // Check if the wishlist item already exists for the user
      const existingWishlistItem = await compareModel.findOne({
        userId,
        productId,
      });

      if (existingWishlistItem) {
        return res.status(400).json({
          success: false,
          message: "Comparsion item already exists",
        });
      }
      const entryCount = await compareModel.countDocuments({ userId });

      if (entryCount >= 3) {
        return res.status(400).json({
          success: false,
          message: "Sorry You Can't Add More Than 3 Products",
        });
      }

      // Create a new user rating instance
      const newUserCompare = new compareModel({
        userId,
        productId,
      });

      // Save the user rating to the database
      await newUserCompare.save();

      return res.status(200).json({
        message: "User comparsion created successfully!",
        success: true,
        newUserCompare,
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: `Error while add comparsion: ${error}`,
      success: false,
      error,
    });
  }
};

export const ViewCompareByUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find wishlist items for the specified user ID
    const CompareItems = await compareModel.find({ userId });

    // Extract product IDs from wishlist items
    const productIds = CompareItems.map((item) => item.productId);

    // Fetch product details for each product ID
    const productDetails = await productModel
      .find({ _id: { $in: productIds } })
      .select("_id pImage regularPrice salePrice title specifications");

    // Combine wishlist items with product details
    const CompareWithProductDetails = CompareItems.map((item) => {
      const productDetail = productDetails.find(
        (product) => product._id.toString() === item.productId.toString()
      );
      return {
        _id: item._id,
        userId: item.userId,
        productId: item.productId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        productDetail: productDetail, // Add product details to wishlist item
      };
    });

    return res.status(200).json({
      success: true,
      message: "Getting Compare successfully!",
      comparsion: CompareWithProductDetails,
    });
  } catch (error) {
    console.error("Error getting Compare:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteCompareByUser = async (req, res) => {
  try {
    await compareModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({
      success: true,
      message: "Compare Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Erorr WHile Deleteing Compare",
      error,
    });
  }
};

export const ViewOrderByUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find userItems items for the specified user ID
    const userItems = await userModel.find({ userId });

    // Extract product IDs from userItems items
    const productIds = userItems.map((item) => item.productId);

    // Fetch product details for each product ID
    const productDetails = await orderModel
      .find({ _id: { $in: productIds } })
      .select("_id username email phone pincode country address status");

    // Combine userItems items with product details
    const UsertWithProductDetails = userItems.map((item) => {
      const productDetail = productDetails.find(
        (product) => product._id.toString() === item.productId.toString()
      );
      return {
        _id: item._id,
        userId: item.userId,
        productId: item.productId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        productDetail: productDetail, // Add product details to wishlist item
      };
    });

    return res.status(200).json({
      success: true,
      message: "Getting wishlist successfully!",
      wishlist: wishlistWithProductDetails,
    });
  } catch (error) {
    console.error("Error getting wishlist:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// for zones

export const ViewAllZones = async (req, res) => {
  try {
    // Query the database for all ratings where status is 1
    const Zones = await zonesModel.find({ status: "true" });

    res.status(200).json({ success: true, Zones });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// export const ViewAllZonesOnly = async (req, res) => {
//   try {
//     // Get all products, populate user data
//     const products = await productModel.find().populate('userId', 'statename city');

//     // Extract statename and city from each product's associated user
//     const locations = products.map(product => ({
//       statename: product.userId?.statename,
//       city: product.userId?.city,
//     }));

//     // Combine both statenames and cities into a single array
//     const allLocations = [...locations.map(loc => loc.statename), ...locations.map(loc => loc.city)];

//     // Remove duplicates by using a Set
//     const uniqueLocations = [...new Set(allLocations)].filter(location => location != undefined);

//     // Respond with the unique locations array
//     res.status(200).json({ success: true, uniqueLocations });
//   } catch (error) {
//     console.error("Error getting locations:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

export const ViewAllZonesOnly = async (req, res) => {
  try {
    // Get all products, populate user data
    const products = await productModel.find().populate('userId', 'coverage username email phone');

    // Collect and flatten all coverage arrays from users
    const allLocations = products
      .map(product => product.userId?.coverage || [])
      .flat(); // or .reduce((acc, val) => acc.concat(val), [])

      console.log('allLocations',products)
    // Remove duplicates and undefined
    const uniqueLocations = [...new Set(allLocations)].filter(Boolean);

    // Respond with the unique locations array
    res.status(200).json({ success: true, uniqueLocations });
  } catch (error) {
    console.error("Error getting locations:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const ViewAllUserTaxes = async (req, res) => {
  try {
    // Query the database for all ratings where status is 1
    const taxes = await taxModel.find({ status: "true" });

    res.status(200).json({ success: true, taxes });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getTaxIdUser = async (req, res) => {
  try {
    const { id } = req.params;
    const taxes = await taxModel.find({ zoneId: id });
    if (!taxes || taxes.length === 0) {
      return res.status(200).send({
        message: "No taxes found for the specified zoneId",
        success: false,
      });
    }
    // Get the last element from the taxes array
    const lastTax = taxes[taxes.length - 1];
    return res.status(200).json({
      message: "Fetched last tax by zoneId successfully",
      success: true,
      tax: lastTax,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while getting taxes: ${error}`,
      success: false,
      error,
    });
  }
};

export const applyPromoCode = async (req, res) => {
  try {
    const { promoCode } = req.body;
    console.log("promoCode", req.body.promoCode);
    // Find the promo code in the database
    const promo = await promoModel.findOne({ name: promoCode });

    if (!promo) {
      return res.status(400).json({ message: "Promo code not found" });
    }

    // Check if the promo code is valid and active
    if (promo.status !== "true") {
      return res.status(400).json({ message: "Promo code is not active" });
    }

    // Apply the promo code based on its type
    let discount = 0;
    let type = "";

    if (promo.type === 1) {
      // Percentage
      // Calculate discount percentage
      discount = parseFloat(promo.rate) / 100;
      type = "percentage";
    } else if (promo.type === 2) {
      // Fixed Amount
      // Assume type is 'value', calculate discount value
      discount = parseFloat(promo.rate);
      type = "fixed";
    } else {
      return res.status(400).json({ message: "Invalid promo code type" });
    }

    // Return the discount and type to the client
    return res.status(200).json({ discount, type });
  } catch (error) {
    console.error("Error applying promo code:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const sendRegOTP = async (phone, otp) => {
  try {
    // Construct the request URL with query parameters
    const queryParams = querystring.stringify({
      username: "cayro.trans",
      password: "CsgUK",
      unicode: false,
      from: "CAYROE",
      to: phone,
      text: `Here is your OTP ${otp} for registering your account on cayroshop.com`,
    });
    const url = `https://pgapi.smartping.ai/fe/api/v1/send?${queryParams}`;

    // Make the GET request to send OTP
    https
      .get(url, (res) => {
        console.log(`OTP API response status code: ${res.statusCode}`);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          console.log(`Response body: ${chunk}`);
        });
      })
      .on("error", (error) => {
        // console.log('url', url)
        console.error("Error sending OTP:", error);
        throw new Error("Failed to send OTP");
      });

    console.log("OTP request sent successfully");
  } catch (error) {
    // Handle errors
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};

const sendLogOTP = async (phone, otp) => {
  // try {
  //   // Construct the request URL with query parameters
  //   const queryParams = querystring.stringify({
  //     username: "ynbhealth.trans",
  //     password: "qEX1P",
  //     unicode: false,
  //     from: "YNBHLT",
  //     to: phone,
  //     text: `OTP is ${otp} for your account Login-Register in YNB Healthcare`,
  //   });
  //   const url = `https://pgapi.smartping.ai/fe/api/v1/send?${queryParams}`;

  //   console.log(url);
  //   // Make the GET request to send OTP
  //   https
  //     .get(url, (res) => {
  //       console.log(`OTP API response status code: ${res.statusCode}`);
  //       res.setEncoding("utf8");
  //       res.on("data", (chunk) => {
  //         console.log(`Response body: ${chunk}`);
  //       });
  //     })
  //     .on("error", (error) => {
  //       // console.log('url', url)
  //       console.error("Error sending OTP:", error);
  //       throw new Error("Failed to send OTP");
  //     });

  //   console.log("OTP request sent successfully");
  // } catch (error) {
  //   // Handle errors
  //   console.error("Error sending OTP:", error);
  //   throw new Error("Failed to send OTP");
  // }
};

const sendOrderOTP = async (phone, order_id) => {
  try {
    // Construct the request URL with query parameters
    const queryParams = querystring.stringify({
      username: "cayro.trans",
      password: "CsgUK",
      unicode: false,
      from: "CAYROE",
      to: phone,
      text: `Thank you for your order. Your order id is ${order_id} cayroshop.com`,
    });
    const url = `https://pgapi.smartping.ai/fe/api/v1/send?${queryParams}`;

    console.log(url);
    // Make the GET request to send OTP
    https
      .get(url, (res) => {
        console.log(`OTP API response status code: ${res.statusCode}`);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          console.log(`Response body: ${chunk}`);
        });
      })
      .on("error", (error) => {
        // console.log('url', url)
        console.error("Error sending OTP:", error);
        throw new Error("Failed to send OTP");
      });

    console.log("OTP request sent successfully");
  } catch (error) {
    // Handle errors
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};

export const SendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    // Send OTP via Phone
    await sendOTP(phone, otp);

    res
      .status(200)
      .json({ success: true, message: "OTP sent successfully", OTP: otp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const SignupLoginUser_old = async (req, res) => {
  try {
    const { phone } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    // // Send OTP via Phone
    //  await sendRegOTP(phone, otp);
 

    // Validation
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const existingUser = await userModel.findOne({ phone });

    if (existingUser) {
      if (existingUser.password !== undefined) {
        if (existingUser.status === "0") {
          return res.status(400).json({
            success: false,
            message: "An error occurred. Please contact support.",
          });
        }
        return res.status(201).json({
          success: true,
          message: "User found with password",
          password: true,
        });
      } else {
        // Hash the OTP
        const ecryptOTP = await bcrypt.hash(String(otp), 10);

        if (existingUser.status === "0") {
          return res.status(400).json({
            success: false,
            message: "An error occurred. Please contact support.",
          });
        }

        // block
        console.log(otp);
         await sendLogOTP(phone, otp);

        return res.status(201).json({
          success: true,
          message: "User found",
          existingUser: {
            _id: existingUser._id,
            username: existingUser.username,
            phone: existingUser.phone,
            email: existingUser.email,
            type: existingUser.type,
          },
          token: existingUser.token,
          otp: ecryptOTP,
          type: 2,
          newOtp: otp,
        });
      }
    } else {
      const ecryptOTP = await bcrypt.hash(String(otp), 10);

      // block
      console.log(otp);
      await sendLogOTP(phone, otp);
      return res.status(200).json({
        success: true,
        message: "New User found",
        newUser: true,
        otp: ecryptOTP,
        newOtp: otp,
      });
    }

  } catch (error) {
    console.error("Error on login:", error);
    return res.status(500).json({
      success: false,
      message: "Error on login",
      error: error.message,
    });
  }
};
 
export const SignupLoginUser = async (req, res) => {
  try {
    const { phone } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    // // Send OTP via Phone
    //  await sendRegOTP(phone, otp);
 

    // Validation
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const existingUser = await userModel.findOne({ phone });

    if (existingUser) {
      if (existingUser.password !== undefined) {
        if (existingUser.status === "0") {
          return res.status(400).json({
            success: false,
            message: "An error occurred. Please contact support.",
          });
        }
        return res.status(201).json({
          success: true,
          message: "User found with password",
          password: true,
        });
      } else {
        // Hash the OTP
        const ecryptOTP = await bcrypt.hash(String(otp), 10);

        if (existingUser.status === "0") {
          return res.status(400).json({
            success: false,
            message: "An error occurred. Please contact support.",
          });
        }

        // block
        console.log(otp);
         await sendLogOTP(phone, otp);

        return res.status(201).json({
          success: true,
          message: "User found",
          existingUser: {
            _id: existingUser._id,
            username: existingUser.username,
            phone: existingUser.phone,
            email: existingUser.email,
            type: existingUser.type,
          },
          token: existingUser.token,
          otp: ecryptOTP, 
  newOtp: otp,
        });
      }
    } else {
      const ecryptOTP = await bcrypt.hash(String(otp), 10);

      // block
      console.log(otp);
      await sendLogOTP(phone, otp);
      return res.status(200).json({
        success: true,
        message: "New User found",
        newUser: true,
        otp: ecryptOTP,
          newOtp: otp,
      });


      // return res.status(400).json({
      //   success: false,
      //   message: "User Not Found",
        
      //  });

    }
  } catch (error) {
    console.error("Error on login:", error);
    return res.status(500).json({
      success: false,
      message: "Error on login",
      error: error.message,
    });
  }
};


export const SignupLoginNew = async (req, res) => {
  try {
    const { phone } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    // // Send OTP via Phone
    //  await sendRegOTP(phone, otp);
 

    // Validation
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const existingUser = await userModel.findOne({ phone });

    if (existingUser) {
      if (existingUser.password !== undefined) {
        if (existingUser.status === "0") {
          return res.status(400).json({
            success: false,
            message: "An error occurred. Please contact support.",
          });
        }
        return res.status(201).json({
          success: true,
          message: "User found with password",
          password: true,
        });
      } else {
        // Hash the OTP
        const ecryptOTP = await bcrypt.hash(String(otp), 10);

        if (existingUser.status === "0") {
          return res.status(400).json({
            success: false,
            message: "An error occurred. Please contact support.",
          });
        }

        // block
        console.log(otp);
         await sendLogOTP(phone, otp);

        return res.status(201).json({
          success: true,
          message: "User found",
          existingUser: {
            _id: existingUser._id,
            username: existingUser.username,
            phone: existingUser.phone,
            email: existingUser.email,
            type: existingUser.type,
            cHealthStatus: existingUser.cHealthStatus,
            pHealthHistory: existingUser.pHealthHistory,

          },
          newUser: false,
          token: existingUser.token,
          otp: ecryptOTP,
          type: 2,

        });
      }
    } else {
      const ecryptOTP = await bcrypt.hash(String(otp), 10);

      // block
      console.log(otp);
      await sendLogOTP(phone, otp);
      return res.status(200).json({
        success: true,
        message: "New User found",
        newUser: true,
        otp: ecryptOTP,
      });
    }
  } catch (error) {
    console.error("Error on login:", error);
    return res.status(500).json({
      success: false,
      message: "Error on login",
      error: error.message,
    });
  }
};

export const SignupNewUser = async (req, res) => {
  try {
    const { phone } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    // // Send OTP via Phone
    // await sendOTP(phone, otp);

    // Validation
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // Create a new user
    const user = new userModel({ phone });
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "1h",
    });
    user.token = token; // Update the user's token field with the generated token
    user.type = 2; // Update the user's token field with the generated token

    await user.save();

    // Hash the OTP
    const ecryptOTP = await bcrypt.hash(String(otp), 10);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      existingUser: {
        _id: user._id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        type: user.type,
      },
      otp: ecryptOTP,
      token,
      type: 2,
    });
  } catch (error) {
    console.error("Error on signup:", error);
    res.status(500).json({
      success: false,
      message: "Error on signup",
      error: error.message,
    });
  }
};

export const LoginUserWithOTP = async (req, res) => {
  try {
    const { phone, Gtoken } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    // // Send OTP via Phone
    // await sendLogOTP(phone, otp);

    // if (!Gtoken) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'you can access this page ',
    //   });
    // }
    // Validation
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const existingUser = await userModel.findOne({ phone, status: "1"});

    if (existingUser) {
      // Hash the OTP
      const ecryptOTP = await bcrypt.hash(String(otp), 10);

      // block
      console.log(otp);
        await sendLogOTP(phone, otp);

      return res.status(201).json({
        success: true,
        message: "User found",
        existingUser: {
          _id: existingUser._id,
          username: existingUser.username,
          phone: existingUser.phone,
          email: existingUser.email,
          type: existingUser.type,
        },
        token: existingUser.token,
        otp: ecryptOTP,
        type: 2,
        newOtp: otp,
      });
    }
  } catch (error) {
    console.error("Error on signup:", error);
    res.status(500).json({
      success: false,
      message: "Error on signup",
      error: error.message,
    });
  }
};

export const LoginUserWithPass = async (req, res) => {
  try {
    const { phone, Gtoken, password } = req.body;

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    if (!phone || !password || !Gtoken) {
      return res.status(400).send({
        success: false,
        message: "please fill all fields",
      });
    }
    const user = await userModel.findOne({ phone, status: "1" });

    // password check

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "password is not incorrect",
        user,
      });
    }

    // const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

    return res.status(200).json({
      success: true,
      message: "login sucesssfully with password",
      existingUser: {
        _id: user._id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        type: user.type,
      },
      token: user.token,
      checkpass: true,
      type: 2,

    });
  } catch (error) {
    return res.status(500).send({
      message: `error on login ${error}`,
      sucesss: false,
      error,
    });
  }
};

export const LoginAndVerifyOTP = async (req, res) => {
  try {
    const { OTP, HASHOTP } = req.body;

    const isMatch = await bcrypt.compare(OTP, HASHOTP);

    if (isMatch) {
      return res.status(200).json({
        success: true,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "OTP Not Verified",
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: `error on login ${error}`,
      sucesss: false,
      error,
    });
  }
};

export const updatePromoAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, rate, type, status } = req.body;

    let updateFields = {
      name,
      rate,
      type,
      status,
    };

    const Promo = await promoModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Promo code Updated!",
      success: true,
      Promo,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Promo code: ${error}`,
      success: false,
      error,
    });
  }
};



const cityData = {
  "Andaman and Nicobar Islands": ["Port Blair"],
  Haryana: [
    "Faridabad",
    "Gurgaon",
    "Hisar",
    "Rohtak",
    "Panipat",
    "Karnal",
    "Sonipat",
    "Yamunanagar",
    "Panchkula",
    "Bhiwani",
    "Bahadurgarh",
    "Jind",
    "Sirsa",
    "Thanesar",
    "Kaithal",
    "Palwal",
    "Rewari",
    "Hansi",
    "Narnaul",
    "Fatehabad",
    "Gohana",
    "Tohana",
    "Narwana",
    "Mandi Dabwali",
    "Charkhi Dadri",
    "Shahbad",
    "Pehowa",
    "Samalkha",
    "Pinjore",
    "Ladwa",
    "Sohna",
    "Safidon",
    "Taraori",
    "Mahendragarh",
    "Ratia",
    "Rania",
    "Sarsod",
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Tirunelveli",
    "Tiruppur",
    "Ranipet",
    "Nagercoil",
    "Thanjavur",
    "Vellore",
    "Kancheepuram",
    "Erode",
    "Tiruvannamalai",
    "Pollachi",
    "Rajapalayam",
    "Sivakasi",
    "Pudukkottai",
    "Neyveli (TS)",
    "Nagapattinam",
    "Viluppuram",
    "Tiruchengode",
    "Vaniyambadi",
    "Theni Allinagaram",
    "Udhagamandalam",
    "Aruppukkottai",
    "Paramakudi",
    "Arakkonam",
    "Virudhachalam",
    "Srivilliputhur",
    "Tindivanam",
    "Virudhunagar",
    "Karur",
    "Valparai",
    "Sankarankovil",
    "Tenkasi",
    "Palani",
    "Pattukkottai",
    "Tirupathur",
    "Ramanathapuram",
    "Udumalaipettai",
    "Gobichettipalayam",
    "Thiruvarur",
    "Thiruvallur",
    "Panruti",
    "Namakkal",
    "Thirumangalam",
    "Vikramasingapuram",
    "Nellikuppam",
    "Rasipuram",
    "Tiruttani",
    "Nandivaram-Guduvancheri",
    "Periyakulam",
    "Pernampattu",
    "Vellakoil",
    "Sivaganga",
    "Vadalur",
    "Rameshwaram",
    "Tiruvethipuram",
    "Perambalur",
    "Usilampatti",
    "Vedaranyam",
    "Sathyamangalam",
    "Puliyankudi",
    "Nanjikottai",
    "Thuraiyur",
    "Sirkali",
    "Tiruchendur",
    "Periyasemur",
    "Sattur",
    "Vandavasi",
    "Tharamangalam",
    "Tirukkoyilur",
    "Oddanchatram",
    "Palladam",
    "Vadakkuvalliyur",
    "Tirukalukundram",
    "Uthamapalayam",
    "Surandai",
    "Sankari",
    "Shenkottai",
    "Vadipatti",
    "Sholingur",
    "Tirupathur",
    "Manachanallur",
    "Viswanatham",
    "Polur",
    "Panagudi",
    "Uthiramerur",
    "Thiruthuraipoondi",
    "Pallapatti",
    "Ponneri",
    "Lalgudi",
    "Natham",
    "Unnamalaikadai",
    "P.N.Patti",
    "Tharangambadi",
    "Tittakudi",
    "Pacode",
    "O' Valley",
    "Suriyampalayam",
    "Sholavandan",
    "Thammampatti",
    "Namagiripettai",
    "Peravurani",
    "Parangipettai",
    "Pudupattinam",
    "Pallikonda",
    "Sivagiri",
    "Punjaipugalur",
    "Padmanabhapuram",
    "Thirupuvanam",
  ],
  "Madhya Pradesh": [
    "Indore",
    "Bhopal",
    "Jabalpur",
    "Gwalior",
    "Ujjain",
    "Sagar",
    "Ratlam",
    "Satna",
    "Murwara (Katni)",
    "Morena",
    "Singrauli",
    "Rewa",
    "Vidisha",
    "Ganjbasoda",
    "Shivpuri",
    "Mandsaur",
    "Neemuch",
    "Nagda",
    "Itarsi",
    "Sarni",
    "Sehore",
    "Mhow Cantonment",
    "Seoni",
    "Balaghat",
    "Ashok Nagar",
    "Tikamgarh",
    "Shahdol",
    "Pithampur",
    "Alirajpur",
    "Mandla",
    "Sheopur",
    "Shajapur",
    "Panna",
    "Raghogarh-Vijaypur",
    "Sendhwa",
    "Sidhi",
    "Pipariya",
    "Shujalpur",
    "Sironj",
    "Pandhurna",
    "Nowgong",
    "Mandideep",
    "Sihora",
    "Raisen",
    "Lahar",
    "Maihar",
    "Sanawad",
    "Sabalgarh",
    "Umaria",
    "Porsa",
    "Narsinghgarh",
    "Malaj Khand",
    "Sarangpur",
    "Mundi",
    "Nepanagar",
    "Pasan",
    "Mahidpur",
    "Seoni-Malwa",
    "Rehli",
    "Manawar",
    "Rahatgarh",
    "Panagar",
    "Wara Seoni",
    "Tarana",
    "Sausar",
    "Rajgarh",
    "Niwari",
    "Mauganj",
    "Manasa",
    "Nainpur",
    "Prithvipur",
    "Sohagpur",
    "Nowrozabad (Khodargama)",
    "Shamgarh",
    "Maharajpur",
    "Multai",
    "Pali",
    "Pachore",
    "Rau",
    "Mhowgaon",
    "Vijaypur",
    "Narsinghgarh",
  ],
  Jharkhand: [
    "Dhanbad",
    "Ranchi",
    "Jamshedpur",
    "Bokaro Steel City",
    "Deoghar",
    "Phusro",
    "Adityapur",
    "Hazaribag",
    "Giridih",
    "Ramgarh",
    "Jhumri Tilaiya",
    "Saunda",
    "Sahibganj",
    "Medininagar (Daltonganj)",
    "Chaibasa",
    "Chatra",
    "Gumia",
    "Dumka",
    "Madhupur",
    "Chirkunda",
    "Pakaur",
    "Simdega",
    "Musabani",
    "Mihijam",
    "Patratu",
    "Lohardaga",
    "Tenu dam-cum-Kathhara",
  ],
  Mizoram: ["Aizawl", "Lunglei", "Saiha"],
  Nagaland: [
    "Dimapur",
    "Kohima",
    "Zunheboto",
    "Tuensang",
    "Wokha",
    "Mokokchung",
  ],
  "Himachal Pradesh": [
    "Shimla",
    "Mandi",
    "Solan",
    "Nahan",
    "Sundarnagar",
    "Palampur",
    "Kullu",
  ],
  Tripura: [
    "Agartala",
    "Udaipur",
    "Dharmanagar",
    "Pratapgarh",
    "Kailasahar",
    "Belonia",
    "Khowai",
  ],
  "Andhra Pradesh": [
    "Visakhapatnam",
    "Vijayawada",
    "Guntur",
    "Nellore",
    "Kurnool",
    "Rajahmundry",
    "Kakinada",
    "Tirupati",
    "Anantapur",
    "Kadapa",
    "Vizianagaram",
    "Eluru",
    "Ongole",
    "Nandyal",
    "Machilipatnam",
    "Adoni",
    "Tenali",
    "Chittoor",
    "Hindupur",
    "Proddatur",
    "Bhimavaram",
    "Madanapalle",
    "Guntakal",
    "Dharmavaram",
    "Gudivada",
    "Srikakulam",
    "Narasaraopet",
    "Rajampet",
    "Tadpatri",
    "Tadepalligudem",
    "Chilakaluripet",
    "Yemmiganur",
    "Kadiri",
    "Chirala",
    "Anakapalle",
    "Kavali",
    "Palacole",
    "Sullurpeta",
    "Tanuku",
    "Rayachoti",
    "Srikalahasti",
    "Bapatla",
    "Naidupet",
    "Nagari",
    "Gudur",
    "Vinukonda",
    "Narasapuram",
    "Nuzvid",
    "Markapur",
    "Ponnur",
    "Kandukur",
    "Bobbili",
    "Rayadurg",
    "Samalkot",
    "Jaggaiahpet",
    "Tuni",
    "Amalapuram",
    "Bheemunipatnam",
    "Venkatagiri",
    "Sattenapalle",
    "Pithapuram",
    "Palasa Kasibugga",
    "Parvathipuram",
    "Macherla",
    "Gooty",
    "Salur",
    "Mandapeta",
    "Jammalamadugu",
    "Peddapuram",
    "Punganur",
    "Nidadavole",
    "Repalle",
    "Ramachandrapuram",
    "Kovvur",
    "Tiruvuru",
    "Uravakonda",
    "Narsipatnam",
    "Yerraguntla",
    "Pedana",
    "Puttur",
    "Renigunta",
    "Rajam",
    "Srisailam Project (Right Flank Colony) Township",
  ],
  Punjab: [
    "Ludhiana",
    "Patiala",
    "Amritsar",
    "Jalandhar",
    "Bathinda",
    "Pathankot",
    "Hoshiarpur",
    "Batala",
    "Moga",
    "Malerkotla",
    "Khanna",
    "Mohali",
    "Barnala",
    "Firozpur",
    "Phagwara",
    "Kapurthala",
    "Zirakpur",
    "Kot Kapura",
    "Faridkot",
    "Muktsar",
    "Rajpura",
    "Sangrur",
    "Fazilka",
    "Gurdaspur",
    "Kharar",
    "Gobindgarh",
    "Mansa",
    "Malout",
    "Nabha",
    "Tarn Taran",
    "Jagraon",
    "Sunam",
    "Dhuri",
    "Firozpur Cantt.",
    "Sirhind Fatehgarh Sahib",
    "Rupnagar",
    "Jalandhar Cantt.",
    "Samana",
    "Nawanshahr",
    "Rampura Phul",
    "Nangal",
    "Nakodar",
    "Zira",
    "Patti",
    "Raikot",
    "Longowal",
    "Urmar Tanda",
    "Morinda, India",
    "Phillaur",
    "Pattran",
    "Qadian",
    "Sujanpur",
    "Mukerian",
    "Talwara",
  ],
  Chandigarh: ["Chandigarh"],
  Rajasthan: [
    "Jaipur",
    "Jodhpur",
    "Bikaner",
    "Udaipur",
    "Ajmer",
    "Bhilwara",
    "Alwar",
    "Bharatpur",
    "Pali",
    "Barmer",
    "Sikar",
    "Tonk",
    "Sadulpur",
    "Sawai Madhopur",
    "Nagaur",
    "Makrana",
    "Sujangarh",
    "Sardarshahar",
    "Ladnu",
    "Ratangarh",
    "Nokha",
    "Nimbahera",
    "Suratgarh",
    "Rajsamand",
    "Lachhmangarh",
    "Rajgarh (Churu)",
    "Nasirabad",
    "Nohar",
    "Phalodi",
    "Nathdwara",
    "Pilani",
    "Merta City",
    "Sojat",
    "Neem-Ka-Thana",
    "Sirohi",
    "Pratapgarh",
    "Rawatbhata",
    "Sangaria",
    "Lalsot",
    "Pilibanga",
    "Pipar City",
    "Taranagar",
    "Vijainagar, Ajmer",
    "Sumerpur",
    "Sagwara",
    "Ramganj Mandi",
    "Lakheri",
    "Udaipurwati",
    "Losal",
    "Sri Madhopur",
    "Ramngarh",
    "Rawatsar",
    "Rajakhera",
    "Shahpura",
    "Shahpura",
    "Raisinghnagar",
    "Malpura",
    "Nadbai",
    "Sanchore",
    "Nagar",
    "Rajgarh (Alwar)",
    "Sheoganj",
    "Sadri",
    "Todaraisingh",
    "Todabhim",
    "Reengus",
    "Rajaldesar",
    "Sadulshahar",
    "Sambhar",
    "Prantij",
    "Mount Abu",
    "Mangrol",
    "Phulera",
    "Mandawa",
    "Pindwara",
    "Mandalgarh",
    "Takhatgarh",
  ],
  Assam: [
    "Guwahati",
    "Silchar",
    "Dibrugarh",
    "Nagaon",
    "Tinsukia",
    "Jorhat",
    "Bongaigaon City",
    "Dhubri",
    "Diphu",
    "North Lakhimpur",
    "Tezpur",
    "Karimganj",
    "Sibsagar",
    "Goalpara",
    "Barpeta",
    "Lanka",
    "Lumding",
    "Mankachar",
    "Nalbari",
    "Rangia",
    "Margherita",
    "Mangaldoi",
    "Silapathar",
    "Mariani",
    "Marigaon",
  ],
  Odisha: [
    "Bhubaneswar",
    "Cuttack",
    "Raurkela",
    "Brahmapur",
    "Sambalpur",
    "Puri",
    "Baleshwar Town",
    "Baripada Town",
    "Bhadrak",
    "Balangir",
    "Jharsuguda",
    "Bargarh",
    "Paradip",
    "Bhawanipatna",
    "Dhenkanal",
    "Barbil",
    "Kendujhar",
    "Sunabeda",
    "Rayagada",
    "Jatani",
    "Byasanagar",
    "Kendrapara",
    "Rajagangapur",
    "Parlakhemundi",
    "Talcher",
    "Sundargarh",
    "Phulabani",
    "Pattamundai",
    "Titlagarh",
    "Nabarangapur",
    "Soro",
    "Malkangiri",
    "Rairangpur",
    "Tarbha",
  ],
  Chhattisgarh: [
    "Raipur",
    "Bhilai Nagar",
    "Korba",
    "Bilaspur",
    "Durg",
    "Rajnandgaon",
    "Jagdalpur",
    "Raigarh",
    "Ambikapur",
    "Mahasamund",
    "Dhamtari",
    "Chirmiri",
    "Bhatapara",
    "Dalli-Rajhara",
    "Naila Janjgir",
    "Tilda Newra",
    "Mungeli",
    "Manendragarh",
    "Sakti",
  ],
  "Jammu and Kashmir": [
    "Srinagar",
    "Jammu",
    "Baramula",
    "Anantnag",
    "Sopore",
    "KathUrban Agglomeration",
    "Rajauri",
    "Punch",
    "Udhampur",
  ],
  Karnataka: [
    "Bengaluru",
    "Hubli-Dharwad",
    "Belagavi",
    "Mangaluru",
    "Davanagere",
    "Ballari",
    "Mysore",
    "Tumkur",
    "Shivamogga",
    "Raayachuru",
    "Robertson Pet",
    "Kolar",
    "Mandya",
    "Udupi",
    "Chikkamagaluru",
    "Karwar",
    "Ranebennuru",
    "Ranibennur",
    "Ramanagaram",
    "Gokak",
    "Yadgir",
    "Rabkavi Banhatti",
    "Shahabad",
    "Sirsi",
    "Sindhnur",
    "Tiptur",
    "Arsikere",
    "Nanjangud",
    "Sagara",
    "Sira",
    "Puttur",
    "Athni",
    "Mulbagal",
    "Surapura",
    "Siruguppa",
    "Mudhol",
    "Sidlaghatta",
    "Shahpur",
    "Saundatti-Yellamma",
    "Wadi",
    "Manvi",
    "Nelamangala",
    "Lakshmeshwar",
    "Ramdurg",
    "Nargund",
    "Tarikere",
    "Malavalli",
    "Savanur",
    "Lingsugur",
    "Vijayapura",
    "Sankeshwara",
    "Madikeri",
    "Talikota",
    "Sedam",
    "Shikaripur",
    "Mahalingapura",
    "Mudalagi",
    "Muddebihal",
    "Pavagada",
    "Malur",
    "Sindhagi",
    "Sanduru",
    "Afzalpur",
    "Maddur",
    "Madhugiri",
    "Tekkalakote",
    "Terdal",
    "Mudabidri",
    "Magadi",
    "Navalgund",
    "Shiggaon",
    "Shrirangapattana",
    "Sindagi",
    "Sakaleshapura",
    "Srinivaspur",
    "Ron",
    "Mundargi",
    "Sadalagi",
    "Piriyapatna",
    "Adyar",
  ],
  Manipur: ["Imphal", "Thoubal", "Lilong", "Mayang Imphal"],
  Kerala: [
    "Thiruvananthapuram",
    "Kochi",
    "Kozhikode",
    "Kollam",
    "Thrissur",
    "Palakkad",
    "Alappuzha",
    "Malappuram",
    "Ponnani",
    "Vatakara",
    "Kanhangad",
    "Taliparamba",
    "Koyilandy",
    "Neyyattinkara",
    "Kayamkulam",
    "Nedumangad",
    "Kannur",
    "Tirur",
    "Kottayam",
    "Kasaragod",
    "Kunnamkulam",
    "Ottappalam",
    "Thiruvalla",
    "Thodupuzha",
    "Chalakudy",
    "Changanassery",
    "Punalur",
    "Nilambur",
    "Cherthala",
    "Perinthalmanna",
    "Mattannur",
    "Shoranur",
    "Varkala",
    "Paravoor",
    "Pathanamthitta",
    "Peringathur",
    "Attingal",
    "Kodungallur",
    "Pappinisseri",
    "Chittur-Thathamangalam",
    "Muvattupuzha",
    "Adoor",
    "Mavelikkara",
    "Mavoor",
    "Perumbavoor",
    "Vaikom",
    "Palai",
    "Panniyannur",
    "Guruvayoor",
    "Puthuppally",
    "Panamattom",
  ],
  Delhi: ["Delhi", "New Delhi"],
  "Dadra and Nagar Haveli": ["Silvassa"],
  Puducherry: ["Pondicherry", "Karaikal", "Yanam", "Mahe"],
  Uttarakhand: [
    "Dehradun",
    "Hardwar",
    "Haldwani-cum-Kathgodam",
    "Srinagar",
    "Kashipur",
    "Roorkee",
    "Rudrapur",
    "Rishikesh",
    "Ramnagar",
    "Pithoragarh",
    "Manglaur",
    "Nainital",
    "Mussoorie",
    "Tehri",
    "Pauri",
    "Nagla",
    "Sitarganj",
    "Bageshwar",
  ],
  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur",
    "Firozabad",
    "Agra",
    "Meerut",
    "Varanasi",
    "Allahabad",
    "Amroha",
    "Moradabad",
    "Aligarh",
    "Saharanpur",
    "Noida",
    "Loni",
    "Jhansi",
    "Shahjahanpur",
    "Rampur",
    "Modinagar",
    "Hapur",
    "Etawah",
    "Sambhal",
    "Orai",
    "Bahraich",
    "Unnao",
    "Rae Bareli",
    "Lakhimpur",
    "Sitapur",
    "Lalitpur",
    "Pilibhit",
    "Chandausi",
    "Hardoi ",
    "Azamgarh",
    "Khair",
    "Sultanpur",
    "Tanda",
    "Nagina",
    "Shamli",
    "Najibabad",
    "Shikohabad",
    "Sikandrabad",
    "Shahabad, Hardoi",
    "Pilkhuwa",
    "Renukoot",
    "Vrindavan",
    "Ujhani",
    "Laharpur",
    "Tilhar",
    "Sahaswan",
    "Rath",
    "Sherkot",
    "Kalpi",
    "Tundla",
    "Sandila",
    "Nanpara",
    "Sardhana",
    "Nehtaur",
    "Seohara",
    "Padrauna",
    "Mathura",
    "Thakurdwara",
    "Nawabganj",
    "Siana",
    "Noorpur",
    "Sikandra Rao",
    "Puranpur",
    "Rudauli",
    "Thana Bhawan",
    "Palia Kalan",
    "Zaidpur",
    "Nautanwa",
    "Zamania",
    "Shikarpur, Bulandshahr",
    "Naugawan Sadat",
    "Fatehpur Sikri",
    "Shahabad, Rampur",
    "Robertsganj",
    "Utraula",
    "Sadabad",
    "Rasra",
    "Lar",
    "Lal Gopalganj Nindaura",
    "Sirsaganj",
    "Pihani",
    "Shamsabad, Agra",
    "Rudrapur",
    "Soron",
    "SUrban Agglomerationr",
    "Samdhan",
    "Sahjanwa",
    "Rampur Maniharan",
    "Sumerpur",
    "Shahganj",
    "Tulsipur",
    "Tirwaganj",
    "PurqUrban Agglomerationzi",
    "Shamsabad, Farrukhabad",
    "Warhapur",
    "Powayan",
    "Sandi",
    "Achhnera",
    "Naraura",
    "Nakur",
    "Sahaspur",
    "Safipur",
    "Reoti",
    "Sikanderpur",
    "Saidpur",
    "Sirsi",
    "Purwa",
    "Parasi",
    "Lalganj",
    "Phulpur",
    "Shishgarh",
    "Sahawar",
    "Samthar",
    "Pukhrayan",
    "Obra",
    "Niwai",
    "Mirzapur",
  ],
  Bihar: [
    "Patna",
    "Gaya",
    "Bhagalpur",
    "Muzaffarpur",
    "Darbhanga",
    "Arrah",
    "Begusarai",
    "Chhapra",
    "Katihar",
    "Munger",
    "Purnia",
    "Saharsa",
    "Sasaram",
    "Hajipur",
    "Dehri-on-Sone",
    "Bettiah",
    "Motihari",
    "Bagaha",
    "Siwan",
    "Kishanganj",
    "Jamalpur",
    "Buxar",
    "Jehanabad",
    "Aurangabad",
    "Lakhisarai",
    "Nawada",
    "Jamui",
    "Sitamarhi",
    "Araria",
    "Gopalganj",
    "Madhubani",
    "Masaurhi",
    "Samastipur",
    "Mokameh",
    "Supaul",
    "Dumraon",
    "Arwal",
    "Forbesganj",
    "BhabUrban Agglomeration",
    "Narkatiaganj",
    "Naugachhia",
    "Madhepura",
    "Sheikhpura",
    "Sultanganj",
    "Raxaul Bazar",
    "Ramnagar",
    "Mahnar Bazar",
    "Warisaliganj",
    "Revelganj",
    "Rajgir",
    "Sonepur",
    "Sherghati",
    "Sugauli",
    "Makhdumpur",
    "Maner",
    "Rosera",
    "Nokha",
    "Piro",
    "Rafiganj",
    "Marhaura",
    "Mirganj",
    "Lalganj",
    "Murliganj",
    "Motipur",
    "Manihari",
    "Sheohar",
    "Maharajganj",
    "Silao",
    "Barh",
    "Asarganj",
  ],
  Gujarat: [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Jamnagar",
    "Nadiad",
    "Porbandar",
    "Anand",
    "Morvi",
    "Mahesana",
    "Bharuch",
    "Vapi",
    "Navsari",
    "Veraval",
    "Bhuj",
    "Godhra",
    "Palanpur",
    "Valsad",
    "Patan",
    "Deesa",
    "Amreli",
    "Anjar",
    "Dhoraji",
    "Khambhat",
    "Mahuva",
    "Keshod",
    "Wadhwan",
    "Ankleshwar",
    "Savarkundla",
    "Kadi",
    "Visnagar",
    "Upleta",
    "Una",
    "Sidhpur",
    "Unjha",
    "Mangrol",
    "Viramgam",
    "Modasa",
    "Palitana",
    "Petlad",
    "Kapadvanj",
    "Sihor",
    "Wankaner",
    "Limbdi",
    "Mandvi",
    "Thangadh",
    "Vyara",
    "Padra",
    "Lunawada",
    "Rajpipla",
    "Vapi",
    "Umreth",
    "Sanand",
    "Rajula",
    "Radhanpur",
    "Mahemdabad",
    "Ranavav",
    "Tharad",
    "Mansa",
    "Umbergaon",
    "Talaja",
    "Vadnagar",
    "Manavadar",
    "Salaya",
    "Vijapur",
    "Pardi",
    "Rapar",
    "Songadh",
    "Lathi",
    "Adalaj",
    "Chhapra",
    "Gandhinagar",
  ],
  Telangana: [
    "Hyderabad",
    "Warangal",
    "Nizamabad",
    "Karimnagar",
    "Ramagundam",
    "Khammam",
    "Mahbubnagar",
    "Mancherial",
    "Adilabad",
    "Suryapet",
    "Jagtial",
    "Miryalaguda",
    "Nirmal",
    "Kamareddy",
    "Kothagudem",
    "Bodhan",
    "Palwancha",
    "Mandamarri",
    "Koratla",
    "Sircilla",
    "Tandur",
    "Siddipet",
    "Wanaparthy",
    "Kagaznagar",
    "Gadwal",
    "Sangareddy",
    "Bellampalle",
    "Bhongir",
    "Vikarabad",
    "Jangaon",
    "Bhadrachalam",
    "Bhainsa",
    "Farooqnagar",
    "Medak",
    "Narayanpet",
    "Sadasivpet",
    "Yellandu",
    "Manuguru",
    "Kyathampalle",
    "Nagarkurnool",
  ],
  Meghalaya: ["Shillong", "Tura", "Nongstoin"],
  "Himachal Praddesh": ["Manali"],
  "Arunachal Pradesh": ["Naharlagun", "Pasighat"],
  Maharashtra: [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Thane",
    "Nashik",
    "Kalyan-Dombivali",
    "Vasai-Virar",
    "Solapur",
    "Mira-Bhayandar",
    "Bhiwandi",
    "Amravati",
    "Nanded-Waghala",
    "Sangli",
    "Malegaon",
    "Akola",
    "Latur",
    "Dhule",
    "Ahmednagar",
    "Ichalkaranji",
    "Parbhani",
    "Panvel",
    "Yavatmal",
    "Achalpur",
    "Osmanabad",
    "Nandurbar",
    "Satara",
    "Wardha",
    "Udgir",
    "Aurangabad",
    "Amalner",
    "Akot",
    "Pandharpur",
    "Shrirampur",
    "Parli",
    "Washim",
    "Ambejogai",
    "Manmad",
    "Ratnagiri",
    "Uran Islampur",
    "Pusad",
    "Sangamner",
    "Shirpur-Warwade",
    "Malkapur",
    "Wani",
    "Lonavla",
    "Talegaon Dabhade",
    "Anjangaon",
    "Umred",
    "Palghar",
    "Shegaon",
    "Ozar",
    "Phaltan",
    "Yevla",
    "Shahade",
    "Vita",
    "Umarkhed",
    "Warora",
    "Pachora",
    "Tumsar",
    "Manjlegaon",
    "Sillod",
    "Arvi",
    "Nandura",
    "Vaijapur",
    "Wadgaon Road",
    "Sailu",
    "Murtijapur",
    "Tasgaon",
    "Mehkar",
    "Yawal",
    "Pulgaon",
    "Nilanga",
    "Wai",
    "Umarga",
    "Paithan",
    "Rahuri",
    "Nawapur",
    "Tuljapur",
    "Morshi",
    "Purna",
    "Satana",
    "Pathri",
    "Sinnar",
    "Uchgaon",
    "Uran",
    "Pen",
    "Karjat",
    "Manwath",
    "Partur",
    "Sangole",
    "Mangrulpir",
    "Risod",
    "Shirur",
    "Savner",
    "Sasvad",
    "Pandharkaoda",
    "Talode",
    "Shrigonda",
    "Shirdi",
    "Raver",
    "Mukhed",
    "Rajura",
    "Vadgaon Kasba",
    "Tirora",
    "Mahad",
    "Lonar",
    "Sawantwadi",
    "Pathardi",
    "Pauni",
    "Ramtek",
    "Mul",
    "Soyagaon",
    "Mangalvedhe",
    "Narkhed",
    "Shendurjana",
    "Patur",
    "Mhaswad",
    "Loha",
    "Nandgaon",
    "Warud",
  ],
  Goa: ["Marmagao", "Panaji", "Margao", "Mapusa"],
  "West Bengal": [
    "Kolkata",
    "Siliguri",
    "Asansol",
    "Raghunathganj",
    "Kharagpur",
    "Naihati",
    "English Bazar",
    "Baharampur",
    "Hugli-Chinsurah",
    "Raiganj",
    "Jalpaiguri",
    "Santipur",
    "Balurghat",
    "Medinipur",
    "Habra",
    "Ranaghat",
    "Bankura",
    "Nabadwip",
    "Darjiling",
    "Purulia",
    "Arambagh",
    "Tamluk",
    "AlipurdUrban Agglomerationr",
    "Suri",
    "Jhargram",
    "Gangarampur",
    "Rampurhat",
    "Kalimpong",
    "Sainthia",
    "Taki",
    "Murshidabad",
    "Memari",
    "Paschim Punropara",
    "Tarakeswar",
    "Sonamukhi",
    "PandUrban Agglomeration",
    "Mainaguri",
    "Malda",
    "Panchla",
    "Raghunathpur",
    "Mathabhanga",
    "Monoharpur",
    "Srirampore",
    "Adra",
  ],
};

export const uploadDataZone = async (req, res) => {
  try {
    for (const [zoneName, cities] of Object.entries(cityData)) {
      // Create a new document for each zone
      const newZone = new zonesModel({
        name: zoneName,
        cities: cities, // Cities is directly assigned as an array
        status: "true", // Status can be set to any value you want
      });

      // Save the document to MongoDB
      await newZone.save();
    }

    console.log("Data uploaded successfully!");
  } catch (error) {
    console.error("Error uploading data:", error);
  }
};

// Controller to delete all entries in zonesModel
export const deleteAllZones = async (req, res) => {
  try {
    // Delete all documents from the collection
    await zonesModel.deleteMany({});

    console.log("All entries in the zonesModel collection have been deleted.");
    res.status(200).send({ message: "All entries deleted successfully!" });
  } catch (error) {
    console.error("Error deleting all entries:", error);
    res.status(500).send({ error: "Failed to delete all entries." });
  }
};


export const AuthUserByID = async (req, res) => {
  try {
    const { id } = req.body;

    const existingUser = await userModel.findById(id);
 
    
  const calls = await callModel.find({
    $or: [
      { sender: id },
      { receiver: id }
    ],
    start: { $ne: null },  // Not null start time
    end: null,          // Still ongoing (no end time)
    active: 1,  // Not null start time
  }).populate('sender', 'username phone email')      // adjust fields as needed
      .populate('receiver', 'username phone email')    // adjust fields as needed
  

    if (existingUser) {

      return res.status(200).json({
        success: true,
        message: "login sucesssfully",
        existingUser: {
          _id: existingUser._id,
          username: existingUser.username,
          phone: existingUser.phone,
          email: existingUser.email,
          type: existingUser.type,
          empType: existingUser.empType,
          state: existingUser.state,
          statename: existingUser.statename,
          city: existingUser.city,
          address: existingUser.address,
          verified: existingUser.verified,
          pincode: existingUser.pincode,
          DOB: existingUser.DOB,
          about: existingUser.about,
          department: existingUser.department,
          Doc1: existingUser.Doc1,
          Doc2: existingUser.Doc2,
          Doc3: existingUser.Doc3,
          profile: existingUser.profile,
          aadharno: existingUser.aadharno,
          pHealthHistory: existingUser.pHealthHistory,
          cHealthStatus: existingUser.cHealthStatus,
          coverage: existingUser.coverage,
          gallery: existingUser.gallery,
          images: existingUser.images,
          call: existingUser.call,
          whatsapp: existingUser.whatsapp,
          establishment: existingUser.establishment,
          mId: existingUser.mId,
          dynamicUsers: existingUser.dynamicUsers,
          wallet: existingUser.wallet,
             location :  existingUser.location,
             longitude : existingUser.longitude,
            latitude :  existingUser.latitude,
              calls,
        },
      });

    } else {
      return res.status(401).send({
        success: false,
        message: "user Not found",
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: `error on Auth ${error}`,
      sucesss: false,
      error,
    });
  }
};

export const updateProfileUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, phone, state, email, pincode, address, password } =
      req.body;

    if (!password) {
      if (!username || !email || !pincode || !address || !state) {
        return res.status(400).json({
          success: false,
          message: "Please fill all fields",
        });
      }

      let updateFields = {
        username,
        email,
        pincode,
        address,
        state,
      };

      await userModel.findByIdAndUpdate(id, updateFields, {
        new: true,
      });

      return res.status(200).json({
        message: "Profile Updated!",
        success: true,
      });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      let updateFields = {
        password: hashedPassword,
      };

      const user = await userModel.findByIdAndUpdate(id, updateFields, {
        new: true,
      });

      return res.status(200).json({
        message: "Password Updated!",
        success: true,
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Promo code: ${error}`,
      success: false,
      error,
    });
  }
};

export const updateDetailsUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      address,
      email,
      pincode,
      password,
      gender,
      state,
      statename,
      city,
      confirm_password,
      about,
    } = req.body;

    let updateFields = {
      username,
      address,
      gender,
      state,
      statename,
      city,
      about,
      email,
      pincode,
    };

    if (password.length > 0 && confirm_password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    const user = await userModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "user Updated!",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Promo code: ${error}`,
      success: false,
      error,
    });
  }
};


export const updateDetailsUserHealth = async (req, res) => {

  try {
    const { id } = req.params;
    const {
      username,
      aadharno,
      DOB,
      pHealthHistory,
      cHealthStatus,
    } = req.body;
    console.log('aadharno', aadharno)
    const profileImg = req.files ? req.files.profile : undefined;

    let updateFields = {
      username,
      aadharno,
      DOB,
      pHealthHistory,
      cHealthStatus,
    };

    if (profileImg && profileImg[0]) {
      updateFields.profile = profileImg[0].path; // Assumes profile[0] is the uploaded file
    }

    const user = await userModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "user Updated!",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Promo code: ${error}`,
      success: false,
      error,
    });
  }
};


export const contactEnquire = async (req, res) => {
  const { name, email, message } = req.body;

  // Configure nodemailer transporter
  const transporter = nodemailer.createTransport({
    // SMTP configuration
    host: process.env.MAIL_HOST, // Update with your SMTP host
    port: process.env.MAIL_PORT, // Update with your SMTP port
    secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
    auth: {
      user: process.env.MAIL_USERNAME, // Update with your email address
      pass: process.env.MAIL_PASSWORD, // Update with your email password
    },
  });

  // Email message
  const mailOptions = {
    from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
    to: process.env.MAIL_TO_ADDRESS, // Update with your email address
    subject: "New Contact Us Form Submission",
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send("Failed to send email");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send("Email sent successfully");
    }
  });
};

export const getProductsByHSN = async (req, res) => {
  try {
    const { id } = req.params;

    const products = await productModel
      .find({ hsn: id })
      .select("variations")
      .exec();
    if (!products) {
      return res.status(401).send({
        success: false,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Product found",
      products,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error on Auth ${error}`,
      sucesss: false,
      error,
    });
  }
};

export const getProductsByFilterUser = async (req, res) => {
  try {
    const { title, value, hsn } = req.query; // Destructure title, value, and hsn

    // Construct the filter object
    const filter = {};
    if (title && value) {
      filter[`variations.${title}.0.${title}`] = value;
    }
    if (hsn) {
      filter.hsn = hsn;
    }

    // Find products based on the filter
    const products = await productModel.find(filter);

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// for cancel order

export const cancelOrderUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, reason } = req.body;

    let updateFields = {
      status: "0",
      comment,
      reason,
    };

    await orderModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "Order Cancel!",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Rating: ${error}`,
      success: false,
      error,
    });
  }
};



export const getAllPlanCategoryController = async (req, res) => {
  try {
    const plan = await planCategoryModel.find({});
    if (!plan) {
      return res.status(200).send({
        message: "NO plan Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All plan List ",
      planCount: plan.length,
      success: true,
      plan,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while getting plan ${error}`,
      success: false,
      error,
    });
  }
};



// all plan & buy plan

export const getAllPlanUser = async (req, res) => {
  const { id } = req.params;

  try {

    const lastBuy = await buyPlanModel.findOne({ userId: id }).sort({ _id: -1 }).limit(1).populate('planId');
    const User = await userModel.findById(id);
    let Local;
    if (!User.state) {
      return res.status(200).send({ // Send 500 Internal Server Error response
        message: `Error`,
        success: false,
        state: false,
        plan: []
      });
    } else {
      const State = await zonesModel.findById(User.state);
      if (State.primary === 'true') {
        Local = 1;
      } else {
        Local = 0;
      }
    }


    const plan = await planModel
      .find({}).populate('Category').lean(); // Convert documents to plain JavaScript objects

    if (!plan || plan.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No Plan",
        success: false,
      });
    }


    const planDetails = lastBuy?.planId;
    const planValidityInDays = planDetails?.validity; // Number of days the plan is valid for
    const purchaseDate = lastBuy?.createdAt; // Date when the plan was purchased

    // Calculate validTill date by adding validity days to the purchase date
    const validTill = new Date(purchaseDate);
    validTill.setDate(validTill.getDate() + planValidityInDays);

    // Calculate days left
    const currentDate = new Date();
    const daysLeft = Math.floor((validTill - currentDate) / (1000 * 60 * 60 * 24)); // Difference in days



    return res.status(200).send({ // Send successful response
      message: "All Plan ",
      success: true,
      plan, // Return users array
      lastBuy: { ...lastBuy?.toObject(), daysLeft }, // Spread lastBuy object and add daysLeft  
      Local
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while plan: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const BuyPlanUser = async (req, res) => {

  try {
    const { totalAmount, planId, userId, Local } = req.body;

    if (!userId) {
      return res.status(500).send({ // Send successful response
        message: req.body,
        success: false,
      });
    }

    const lastLead = await buyPlanModel.findOne().sort({ _id: -1 }).limit(1);
    let paymentId;

    if (lastLead) {
      if (lastLead.paymentId === undefined) {
        paymentId = 1;
      } else {
        // Convert lastOrder.orderId to a number before adding 1
        const lastOrderId = parseInt(lastLead.paymentId);
        paymentId = lastOrderId + 1;
      }
    } else {
      paymentId = 1;
    }


    // Create a new buy plan record
    const newBuyPlan = new buyPlanModel({
      userId,
      planId,
      totalAmount,
      paymentId,
      note: 'payment succesfully added',
      payment: 1,  // Assuming payment is the same as totalAmount initially, but could be adjusted as needed
      Local,  // You can modify this based on your actual requirements
    });
    await newBuyPlan.save();

    if (!newBuyPlan || newBuyPlan.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No Plan",
        success: false,
      });
    }

    return res.status(200).send({ // Send successful response
      message: "All Plan ",
      success: true,
      newBuyPlan, // Return users array
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while plan: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const getAllVendor = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const state = req.query.state || ""; // Get search term from the query parameters
    const city = req.query.city || ""; // Get search term from the query parameters
    const department = req.query.department || ""; // Get search term from the query parameters

    // Get startDate and endDate from query parameters
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // console.log(startDate, endDate)
    const skip = (page - 1) * limit;

    const query = {};


    if (state.length > 0) {
      query.state = { $in: state }; // Use $in operator to match any of the values in the array
    }
    if (city.length > 0) {
      query.city = { $in: city }; // Use $in operator to match any of the values in the array
    }
    if (department.length > 0) {
      query.department = { $in: department }; // Use $in operator to match any of the values in the array
    }

    query.type = { $in: 1 }; // Use $in operator to match any of the values in the array
    // query.verified = { $in: 1 };  

    // Add date range filtering to the query
    if (startDate && endDate) {
      query.createdAt = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.createdAt = { $gte: startDate };
    } else if (endDate) {
      query.createdAt = { $lte: endDate };
    }

    const totalUser = await userModel.countDocuments(query); // Count total documents matching the query

    const users = await userModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean(); // Convert documents to plain JavaScript objects

    if (!users || users.length === 0) {
      // Check if no users found
      return res.status(401).send({
        // Send 404 Not Found response
        message: "No users found",
        success: false,
      });
    }

    return res.status(200).send({
      // Send successful response
      message: "All user list",
      userCount: users.length,
      currentPage: page,
      totalPages: Math.ceil(totalUser / limit),
      success: true,
      users: users, // Return users array
    });
  } catch (error) {
    return res.status(500).send({
      // Send 500 Internal Server Error response
      message: `Error while getting users: ${error.message}`,
      success: false,
      error,
    });
  }
};



export const getAllDepartment = async (req, res) => {
  try {
    const Department = await departmentsModel.find({}).lean();
    if (!Department) {
      return res.status(200).send({
        message: "NO Department Find",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All Department List ",
      success: true,
      Department,
    });
  } catch (error) {
    return res.status(500).send({
      message: `error while getting Department ${error}`,
      success: false,
      error,
    });
  }
};


export const ViewAllZonesDepartment = async (req, res) => {
  try {
    // Query the database for all ratings where status is 1
    const Zones = await zonesModel.find({ status: "true" });
    const Department = await departmentsModel.find({}).lean();

    res.status(200).json({ success: true, Zones, Department });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const ViewAllZonesCategory = async (req, res) => {
  try {
    // Query the database for all ratings where status is 1
    const Zones = await zonesModel.find({ status: "true" });
    const Categories = await categoryModel.find({}).lean();

    res.status(200).json({ success: true, Zones, Categories });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getVendorById_old = async (req, res) => {
  try {
    const { slug } = req.params;
    const Mpage = await userModel.findOne({ _id: slug, type: 3 });
    if (!Mpage) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "fetch user Page!",
      success: true,
      Mpage,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Page: ${error}`,
      success: false,
      error,
    });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const { slug } = req.params;

    // 1) Fetch vendor (type 3)
    const Mpage = await userModel.findOne({ _id: slug, type: 3 }).lean();
    if (!Mpage) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    }

    // 2) Single latest active, paid, VIDEO ad by this vendor (adslink unrestricted)
    const now = new Date();

    const latestAdArr = await buyPlanAdsModel.aggregate([
      { $match: { payment: 1, userId: Mpage._id } },
      {
        $addFields: {
          endAt: {
            $cond: [
              { $eq: ["$type", 0] }, // 0 = hourly
              { $dateAdd: { startDate: "$createdAt", unit: "hour", amount: { $ifNull: ["$Quantity", 0] } } },
              { $dateAdd: { startDate: "$createdAt", unit: "day",  amount: { $ifNull: ["$Quantity", 0] } } },
            ],
          },
        },
      },
      { $match: { endAt: { $gt: now } } },                 // still active
      { $match: { img: { $regex: /\.(mp4|webm|ogg)$/i } } }, // video-only by file extension
      {
        $project: {
          _id: 1,
          img: 1,
          thumbnail: 1,
          adslink: 1,     // no restriction; can be anything
          createdAt: 1,
          endAt: 1,
          type: 1,
          Quantity: 1,
          Category: 1,
        },
      },
      { $sort: { createdAt: -1 } },  // latest first
      { $limit: 1 },
    ]);

    const latestAd = latestAdArr[0] || null;

    return res.status(200).json({
      message: "fetch user Page!",
      success: true,
      Mpage,
      latestAd, // single latest active paid video ad, or null
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while get Page: ${error}`,
      success: false,
      error,
    });
  }
};


export const getAllPdlanUser = async (req, res) => {
  const { id } = req.params;

  try {

    const lastBuy = await buyPlanModel.findOne({ userId: id }).sort({ _id: -1 }).limit(1).populate('planId');

    const plan = await planModel
      .find({}).lean(); // Convert documents to plain JavaScript objects

    if (!plan || plan.length === 0) { // Check if no users found
      return res.status(404).send({ // Send 404 Not Found response
        message: "No Plan",
        success: false,
      });
    }


    const planDetails = lastBuy?.planId;
    const planValidityInDays = planDetails?.validity; // Number of days the plan is valid for
    const purchaseDate = lastBuy?.createdAt; // Date when the plan was purchased

    // Calculate validTill date by adding validity days to the purchase date
    const validTill = new Date(purchaseDate);
    validTill.setDate(validTill.getDate() + planValidityInDays);

    // Calculate days left
    const currentDate = new Date();
    const daysLeft = Math.floor((validTill - currentDate) / (1000 * 60 * 60 * 24)); // Difference in days



    return res.status(200).send({ // Send successful response
      message: "All Plan ",
      success: true,
      plan, // Return users array
      lastBuy: { ...lastBuy?.toObject(), daysLeft }, // Spread lastBuy object and add daysLeft      
    });
  } catch (error) {
    return res.status(500).send({ // Send 500 Internal Server Error response
      message: `Error while plan: ${error.message}`,
      success: false,
      error,
    });
  }
};



export const HomeSendvendorEnquire = async (req, res) => {


  const { fullname, email, phone, service, QTY, userId, senderId,
    userEmail, requirement,userPhone } = req.body;

  if (!senderId || !userId) {
    return res.status(500).json({
      success: false,
      message: "user Not found",
    });
  }
  const lastBuy = await buyPlanModel.findOne({ userId: senderId }).sort({ _id: -1 }).limit(1).populate('planId').populate('userId');

  try {

    if (lastBuy) {
      const planDetails = lastBuy?.planId;
      const planValidityInDays = planDetails?.validity; // Number of days the plan is valid for
      const purchaseDate = lastBuy?.createdAt; // Date when the plan was purchased

      // Calculate validTill date by adding validity days to the purchase date
      const validTill = new Date(purchaseDate);
      validTill.setDate(validTill.getDate() + planValidityInDays);

      // Calculate days left
      const currentDate = new Date();
      const daysLeft = Math.floor((validTill - currentDate) / (1000 * 60 * 60 * 24)); // Difference in days
      if (daysLeft > 0) {

      } else {
        return res.status(200).json({
          success: false,
          message: "Sorry your plan has expired",
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        message: "Sorry, you don't have any plans.",
      });
    }


    // Save data to the database
    const newEnquire = new enquireModel({
      fullname,
      email,
      phone,
      service,
      QTY,
      userId,
      userEmail,
      type: 1,
      senderId,
      requirement
    });

    await newEnquire.save();

           // Create the notification data object with dynamic values
const notificationData = {
  mobile: `91${userPhone}`,  // Replace with dynamic value if needed
  templateid: "1193466729031008", // Template ID
  overridebot: "yes", // Optional: Set to "yes" or "no"
  template: {
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: fullname || "NA" },  
          { type: "text", text: phone || "NA" },  
          { type: "text", text: email || "NA" }, 
          { type: "text", text: service || "NA" }, 
          { type: "text", text: QTY || "NA" }  
        ]
      }
    ]
  }
};
  
   const WHATSAPP =   await axios.post(process.env.WHATSAPPAPI, notificationData, {
        headers: {
          "API-KEY": process.env.WHATSAPPKEY,
          "Content-Type": "application/json"
        }
      });
       console.log('WHATSAPP',WHATSAPP);
    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      // SMTP configuration
      host: process.env.MAIL_HOST, // Update with your SMTP host
      port: process.env.MAIL_PORT, // Update with your SMTP port
      secure: process.env.MAIL_ENCRYPTION, // Set to true if using SSL/TLS
      auth: {
        user: process.env.MAIL_USERNAME, // Update with your email address
        pass: process.env.MAIL_PASSWORD, // Update with your email password
      },
    });

    const recipients = userEmail
      ? `${userEmail}, ${process.env.MAIL_TO_ADDRESS}`
      : process.env.MAIL_TO_ADDRESS;

    // Email message
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS, // Update with your email address
      to: recipients, // Update with your email address
      subject: "New Enquire Form Submission",
      text: `Name: ${fullname}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nQTY:${QTY}`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send("Failed to send email");
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({
          success: true,
          message: "Email sent successfully",
        });
      }
    });
  } catch (error) {
    console.error("Error in send data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const ApplyEnquireStatus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters
    const userId = req.query.userId; // Directly access userId from query parameters

    if (!userId) {
      return res.status(400).send({
        message: "userId is required",
        success: false,
      });
    }

    const skip = (page - 1) * limit;

    const query = {
      senderId: userId, // Filter by senderId matching userId
    };

    // If there's a search term, you can apply it to a specific field in the enquire model (like 'title' or 'content')
    if (searchTerm) {
      query.$text = { $search: searchTerm }; // Assuming your model has text indexes for search
    }

    const total = await enquireModel.countDocuments(query); // Count only the documents matching the query

    const Enquire = await enquireModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email phone address') // Populate userId with username and address only
      .populate('senderId', 'username email phone address') // Populate senderId with username and address only
      .lean();

    if (!Enquire || Enquire.length === 0) {
      return res.status(200).send({
        message: "No Enquires found for the given user.",
        success: false,
      });
    }

    return res.status(200).send({
      message: "Enquire list retrieved successfully",
      EnquireCount: Enquire.length,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      success: true,
      Enquire,
    });

  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Enquire data: ${error}`,
      success: false,
      error,
    });
  }
};


export const AllPayment = async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await buyPlanModel.find({ userId: userId }).lean();

    return res.status(200).send({
      success: true,
      message: "payments fetched successfully",
      transactions,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error payments fetched: ${error}`,
      success: false,
      error,
    });
  }
};


const generateUserInvoicePDF = async (invoiceData) => {
  // console.log(invoiceData);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const gstRate = 0.18;

  const totalWithGST = invoiceData.totalAmount;
  const amountWithoutGST = totalWithGST / (1 + gstRate);

  const CSGT = invoiceData.totalAmount - amountWithoutGST.toFixed(2);

  const TotalLocal = CSGT / 2;

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const homeData = await homeModel.findOne({});
        if (!homeData) {
            return res.status(500).send({ message: 'Home data not found in the database', success: false });
        }

        const { phone, address,email,meta_logo } = homeData;
  // Define the HTML content
  const htmlContent = `
    <div class="invoice">
      <div class="invoice-header">
        <div class="invoice-header-left">
          <img 
          src="${meta_logo}"alt="Company Logo" width="250">
          
          <p>${address}</p>
          <p>Email: ${email}</p>
          <p>Phone: +91 ${phone}</p>
        </div>
        <div class="invoice-header-right">
          <h2>Invoice</h2>
          <p   >Invoice Number: #${invoiceData?.paymentId}</p>
          <p>Date: ${formatDate(invoiceData?.createdAt)}     </p>
           <p>Full Name: ${invoiceData.userId?.username}</p>
            <p>Email Id: ${invoiceData.userId?.email}</p>
            <p>Phone No.: ${invoiceData.userId?.phone}</p>

          <p style=" color:${(() => {
      if (invoiceData.payment === 0) {
        return "orange";
      } else if (invoiceData.payment === 1) {
        return "green";
      } else if (invoiceData.payment === 2) {
        return "red";
      }
    })()}"
          > Payment Status : 
          ${(() => {
      if (invoiceData.payment === 0) {
        return "Pending";
      } else if (invoiceData.payment === 1) {
        return "Success";
      } else if (invoiceData.payment === 2) {
        return "failed";
      }
    })()}
          
         </p> 
                         
        </div>
      </div>

      <table class="invoice-table">
        <thead>
          <tr >
            <th >Item</th>
           
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
 
            <tr>
              <td> ${invoiceData.planId?.name}</td>
             
              <td> ₹${parseFloat(amountWithoutGST.toFixed(2))}</td>
            </tr>
          
            
        </tbody>
      </table>

      <div class="invoice-total">
        <p>Subtotal: ₹${parseFloat(amountWithoutGST.toFixed(2))}</p>
        ${(() => {
      if (invoiceData.Local === 1) {
        return `<p>
                CGST:  ₹${parseFloat(TotalLocal.toFixed(2))}
              </p><p>
                SGST:  ₹${parseFloat(TotalLocal.toFixed(2))}
              </p>`;
      } else if (invoiceData.Local === 0) {
        return `<p>
IGST: ₹${(parseFloat(invoiceData?.totalAmount.toFixed(2)) - parseFloat(amountWithoutGST.toFixed(2))).toFixed(2)}
          </p>`;
      }
    })()}
        <p>Total: ₹${invoiceData?.totalAmount.toFixed(2)}</p>
      </div>

      <div class="invoice-footer">
        <div class="text-center mt-3">
          <p>Thank you for your support</p>
        </div>
      </div>
    </div>
    <style>
      body {
        font-family: Arial, sans-serif;
      }
      h2 {
        font-weight: 800;
      }
      .invoice {
        width: 95%;
        margin: 10px auto;
        padding: 20px;
      }
      .invoice-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .invoice-header-left {
        flex: 1;
      }
      .invoice-header-right {
        flex: 1;
        text-align: right;
      }
      .invoice-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10%;
      }
      .invoice-table th,
      .invoice-table td {
        border: 1px solid #000;
        padding: 10px;
        text-align: center;
      }
      .invoice-table th {
      
        color:green;
    
      }
      .invoice-total {
        float: right;
      }
    </style>
  `;

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ format: "A4" });

  await browser.close();

  return pdfBuffer;
};

export const downloadUserInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.body; // Assuming invoiceData is sent in the request body
    if (!invoiceId) {
      return res.status(400).send("Invoice ID is required");
    }
    // Fetch invoice data from the database
    const invoiceData = await buyPlanModel
      .findById(invoiceId)
      .populate("userId")
      .populate("planId");

    const pdfBuffer = await generateUserInvoicePDF(invoiceData);

    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    await execPromise("npx puppeteer browsers install chrome");

    console.error("Error generating invoice PDF:", error);
    res.status(500).send("Internal Server Error");
  }
};


export const checkUserPlan = async (req, res) => {
  const { userId } = req.params;

  try {
    // Ensure that userId is in correct format (ObjectId)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format",
      });
    }

    // Retrieve the most recent plan purchase for the user
    const lastBuy = await buyPlanModel
      .findOne({ userId })
      .sort({ _id: -1 })
      .limit(1)
      .populate('planId');  // Ensure that 'planId' is populated with the plan details

    if (lastBuy) {
      const planDetails = lastBuy?.planId;
      const planValidityInDays = planDetails?.validity; // Ensure validity exists
      const purchaseDate = new Date(lastBuy?.createdAt); // Convert to Date object

      // Check if planValidityInDays is a valid number
      if (isNaN(planValidityInDays) || planValidityInDays <= 0) {
        return res.status(500).json({
          success: false,
          message: "Invalid plan validity period",
        });
      }

      // Calculate the validTill date
      const validTill = new Date(purchaseDate);
      validTill.setDate(validTill.getDate() + planValidityInDays);

      // Calculate the number of days left
      const currentDate = new Date();
      const daysLeft = Math.floor((validTill - currentDate) / (1000 * 60 * 60 * 24)); // Difference in days

      if (daysLeft > 0) {
        return res.status(200).json({
          success: true,
          message: `Your plan is active. ${daysLeft} day(s) remaining.`,
        });
      } else {
        return res.status(200).json({
          success: false,
          message: "Sorry, your plan has expired.",
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        message: "Sorry, you don't have any plans.",
      });
    }
  } catch (error) {
    console.error(`Error getting plan: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: `Error getting plan: ${error.message}`,
      error,
    });
  }
};



export const GetPlanUser = async (req, res) => {


  try {
    const plan = await planModel.find({}).populate('Category').lean();
    return res.status(200).send({
      success: true,
      message: "All plans",
      plan,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error plan fetched: ${error}`,
      success: false,
      error,
    });
  }
};

export const BuyPlanAddUser_old = async (req, res) => {

  try {
    const {
      username,
      phone,
      email,
      state,
      statename,
      country,
      password,
      pincode,
      Gender,
      DOB,
      address,
      city,
      planId,
      totalAmount
    } = req.body;



    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate the auto-increment ID
    const lastUser = await userModel.findOne().sort({ _id: -1 }).limit(1);
    let userId;

    if (lastUser) {
      // Convert lastOrder.orderId to a number before adding 1
      const lastUserId = parseInt(lastUser.userId || 1);
      userId = lastUserId + 1;
    } else {
      userId = 1;
    }

    const newUser = new userModel({
      type: 2,
      username,
      phone,
      email,
      password: hashedPassword,
      pincode,
      gender: Gender,
      DOB,
      address,
      state,
      statename,
      country,
      city,
      userId
    });

    await newUser.save();

    let Local;
    if (!newUser.state) {
      Local = 0;
    } else {
      const State = await zonesModel.findById(newUser.state);
      if (State && State.primary === 'true') {
        Local = 1;
      } else {
        Local = 0;
      }
    }



    const lastLead = await buyPlanModel.findOne().sort({ _id: -1 }).limit(1);
    let paymentId;


    if (lastLead) {
      if (lastLead.paymentId === undefined) {
        paymentId = 1;
      } else {
        // Convert lastOrder.orderId to a number before adding 1
        const lastOrderId = parseInt(lastLead.paymentId);
        paymentId = lastOrderId + 1;
      }
    } else {
      paymentId = 1;
    }

    // Create a new buy plan record
    const newBuyPlan = new buyPlanModel({
      userId: newUser._id,
      planId,
      totalAmount,
      paymentId,
      note: 'payment succesfully added',
      payment: 1,  // Assuming payment is the same as totalAmount initially, but could be adjusted as needed
      Local,  // You can modify this based on your actual requirements
    });

  

    await newBuyPlan.save();

 
    res.status(201).json({
      success: true,
      user: newUser,
      message: "User signed up successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: `Error occurred during user signup ${error}`,
      success: false,
      error,
    });
  }



}


// const instance = new razorpay({
//   key_id: process.env.LIVEKEY,
//   key_secret: process.env.LIVESECRET,
// });
// Wallet functionality



export const ApiGetKey = async (req, res) => {
  return res
    .status(200)
    .json({ key: encrypt(process.env.LIVEKEY, process.env.APIKEY) });
};


export const paymentVerification_old = async (req, res) => {

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedsgnature = crypto
    .createHmac("sha256", process.env.LIVESECRET)
    .update(body.toString())
    .digest("hex");
  const isauth = expectedsgnature === razorpay_signature;
  if (isauth) {
    // await Payment.create({
    //   razorpay_order_id,
    //   razorpay_payment_id,
    //   razorpay_signature,
    // });

    const payment = await buyPlanModel.findOneAndUpdate(
      { razorpay_order_id: razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        payment: 1,
      },
      { new: true } // This option returns the updated document
    );

    console.log(
      "razorpay_order_id, razorpay_payment_id, razorpay_signature",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    console.log("razorpay_signature", payment, req.body);

    res.redirect(
      `${process.env.LIVEWEB}paymentsuccess?reference=${razorpay_payment_id}`
    );

  } else {
    await buyPlanModel.findOneAndUpdate(
      { razorpay_order_id },
      {
        payment: 2,
      },
      { new: true } // This option returns the updated document
    );

    res.status(400).json({ success: false });
  }
};

export const paymentVerification_last = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.LIVESECRET)
    .update(body.toString())
    .digest("hex");
  const isAuth = expectedSignature === razorpay_signature;

  if (isAuth) {
    // Update payment status in the database
    const payment = await buyPlanModel.findOneAndUpdate(
      { razorpay_order_id: razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        payment: 1,
      },
      { new: true }
    );

    if (payment) {
      // Populate userId to fetch the email
      const user = await payment.populate('userId'); // Assuming userId is populated

      if (user) {

           // Send notification
           const notificationData = {
            mobile: `91${user.phone}`,
            templateid: "947805560855158",
            overridebot: "yes",
            template: {
              components: [
                {
                  type: "body",
                  parameters: [
                    { type: "text", text: user.username },
                    { type: "text", text: `https://ynbhealthcare.com/card-view/${payment._id}` }
                  ]
                }
              ]
            }
          };
  
     await axios.post(process.env.WHATSAPPAPI, notificationData, {
        headers: {
          "API-KEY": process.env.WHATSAPPKEY,
          "Content-Type": "application/json"
        }
      });

      

        const userEmail = user.email;

        // Send payment ID to the user's email using nodemailer
        const transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST, // Your SMTP host
          port: process.env.MAIL_PORT, // Your SMTP port
          secure: process.env.MAIL_ENCRYPTION === 'true', // If using SSL/TLS
          auth: {
            user: process.env.MAIL_USERNAME, // Your email address
            pass: process.env.MAIL_PASSWORD, // Your email password
          },
        });

        const mailOptions = {
          from: process.env.MAIL_FROM_ADDRESS, // Your email address
          to: userEmail, // User's email
          subject: "Payment Successful - Your Payment ID",
          text: `Hello, \n\nYour payment has been successfully processed. Your payment ID is: ${razorpay_payment_id}. \n\nThank you for choosing us!`,
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
            res.status(500).send("Failed to send email");
          } else {
            console.log("Payment ID sent to user email: " + info.response);
          }
        });
      } else {
        console.error("User not found for payment ID:", razorpay_order_id);
      }

      res.redirect(
        `${process.env.LIVEWEB}paymentsuccess?reference=${razorpay_payment_id}`
      );
    } else {
      res.status(404).send("Payment not found");
    }
  } else {
    // Update payment status as failed
    await buyPlanModel.findOneAndUpdate(
      { razorpay_order_id },
      {
        payment: 2, // Assuming 2 indicates failed payment
      },
      { new: true }
    );

    res.status(400).json({ success: false });
  }
};


export const OrderPaymentVerification = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  
        const homeData = await homeModel.findOne({});
        if (!homeData) {
            return res.status(500).send({ message: 'Home data not found in the database', success: false });
        }

        const { keyId, keySecret } = homeData;
        if (!keyId || !keySecret) {
            return res.status(500).send({ message: 'Razorpay keys are missing in the database', success: false });
        }


  const expectedsgnature = crypto
    .createHmac("sha256", keySecret)
    .update(body.toString())
    .digest("hex");

  const isauth = expectedsgnature === razorpay_signature;
  if (isauth) {
    // await Payment.create({
    //   razorpay_order_id,
    //   razorpay_payment_id,
    //   razorpay_signature,
    // });

      await orderModel.findOneAndUpdate(
      { razorpay_order_id: razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        payment: 1,
      },
      { new: true } // This option returns the updated document
    );
    console.log(
      "razorpay_order_id, razorpay_payment_id, razorpay_signature",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
 

    res.redirect(
      `${process.env.LIVEWEB}account/all-order`
    );
  } else {
    await orderModel.findOneAndUpdate(
      { razorpay_order_id },
      {
        payment: 2,
      },
      { new: true } // This option returns the updated document
    );
 res.redirect(
      `${process.env.LIVEWEB}account/all-order`
    );
    // res.status(400).json({ success: false });
  }
};




export const paymentVerification = async (req, res) => {
 
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  
        const homeData = await homeModel.findOne({});
        if (!homeData) {
            return res.status(500).send({ message: 'Home data not found in the database', success: false });
        }

        const { keyId, keySecret } = homeData;
        if (!keyId || !keySecret) {
            return res.status(500).send({ message: 'Razorpay keys are missing in the database', success: false });
        }


  const expectedsgnature = crypto
    .createHmac("sha256", keySecret)
    .update(body.toString())
    .digest("hex");

  const isauth = expectedsgnature === razorpay_signature;
  if (isauth) {
    // await Payment.create({
    //   razorpay_order_id,
    //   razorpay_payment_id,
    //   razorpay_signature,
    // });

      await buyPlanModel.findOneAndUpdate(
      { razorpay_order_id: razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        payment: 1,
      },
      { new: true } // This option returns the updated document
    );
    console.log(
      "razorpay_order_id, razorpay_payment_id, razorpay_signature",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
 

    res.redirect(
      `${process.env.LIVEWEB}account/all-transactions?reference=${razorpay_payment_id}`
    );
  } else {
    await orderModel.findOneAndUpdate(
      { razorpay_order_id },
      {
        payment: 2,
      },
      { new: true } // This option returns the updated document
    );
 res.redirect(
      `${process.env.LIVEWEB}`
    );
    // res.status(400).json({ success: false });
  }

   
};

const generateHash = (data, salt) => {
  // Concatenate the parameters in the correct order
  const hashString = `${data.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|${data.udf1 || ''}|${data.udf2 || ''}|${data.udf3 || ''}|${data.udf4 || ''}|${data.udf5 || ''}||||||${salt}`;

  // Log the concatenated string for debugging
  console.log("Concatenated Hash String: ", hashString);

  // Generate SHA512 hash using CryptoJS
  const hash = CryptoJS.SHA512(hashString).toString(CryptoJS.enc.Hex);  // Output hash as a hexadecimal string

  // Log the generated hash to verify
  console.log("Generated Hash: ", hash);

  return hash;
};

// Function to create the sha512 hash
export const sha512 = (str) => {
  return CryptoJS.SHA512(str).toString(CryptoJS.enc.Hex);  // Generate and return the hash as a hex string
}



export const PayuHash = (amount, firstName, email, phone, transactionId) => {

  // Prepare data for the PayU request
  const data = {
    key: process.env.MERCHANTKEY,
    txnid: transactionId,                   // Unique Transaction ID
    amount: amount,                         // Amount to be paid
    productinfo: 'Buy Plan',                // Product info
    firstname: firstName,                   // Customer's First Name
    email: email,                           // Customer's Email
    phone: phone,                           // Customer's Phone Number
    surl: process.env.SUCCESSURL,                       // Success URL
    furl: process.env.FAILURL,
    udf1: '', udf2: '', udf3: '', udf4: '', udf5: '', // Optional fields
  };

  // Generate the correct hash
  const hash = generateHash(data, process.env.MERCHANSALT);

  // Add the generated hash to the data object
  data.hash = hash;

  // Log the data to verify
  console.log('Generated Data:', data);

  return data;  // Return the generated data with hash for payment
};


export const BuyPlanByUser_old = async (req, res) => {
  try {

    const {
      UserData,
      planId,
      totalAmount,
    } = req.body;

    const transactionId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const paymentData = PayuHash(totalAmount, UserData.username, UserData.email, UserData.phone, transactionId);

    // Determine 'Local' based on the state
    let Local = 0;
    if (UserData.state) {
      const State = await zonesModel.findById(UserData.state);
      if (State && State.primary === 'true') {
        Local = 1;
      }
    }

    // Calculate the auto-increment ID for paymentId
    const lastLead = await buyPlanModel.findOne().sort({ _id: -1 }).limit(1);
    let paymentId = 1;
    if (lastLead) {
      paymentId = parseInt(lastLead.paymentId || 1) + 1;
    }

    const newBuyPlan = new buyPlanModel({
      userId: UserData._id,
      planId,
      totalAmount,
      paymentId,
      note: 'Payment successfully added',
      payment: 0, // Placeholder for actual payment value
      Local,
      razorpay_order_id: transactionId
    });

    await newBuyPlan.save();

    res.status(200).json({
      success: true,
      buyPlan: newBuyPlan, // Include the newly created buy plan in the response
      message: "plan buy sucessfully.",
      paymentData
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: `Error occurred during user signup: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const BuyPlanByUser = async (req, res) => {
  try {

    const {
      UserData,
      planId,
      totalAmount,
    } = req.body;

       const homeData = await homeModel.findOne({});
        if (!homeData) {
            return res.status(500).send({ message: 'Home data not found in the database', success: false });
        }

        console.log('homeData',homeData)
        const { keyId, keySecret } = homeData;
        if (!keyId || !keySecret) {
            return res.status(500).send({ message: 'Razorpay keys are missing in the database', success: false });
        }

         const instance = new razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
 
              const options = {
            amount: Number(totalAmount * 100), // Razorpay expects the amount in paise
            currency: "INR",
        };
        const order = await instance.orders.create(options);

    // const transactionId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // const paymentData = PayuHash(totalAmount, UserData.username, UserData.email, UserData.phone, transactionId);

    // Determine 'Local' based on the state
    let Local = 0;
    if (UserData.state) {
      const State = await zonesModel.findById(UserData.state);
      if (State && State.primary === 'true') {
        Local = 1;
      }
    }

    // Calculate the auto-increment ID for paymentId
    const lastLead = await buyPlanModel.findOne().sort({ _id: -1 }).limit(1);
    let paymentId = 1;
    if (lastLead) {
      paymentId = parseInt(lastLead.paymentId || 1) + 1;
    }

    const newBuyPlan = new buyPlanModel({
      userId: UserData._id,
      planId,
      totalAmount,
      paymentId,
      note: 'Payment successfully added',
      payment: 0, // Placeholder for actual payment value
      Local,
      razorpay_order_id: order.id
    });

    await newBuyPlan.save();

    res.status(200).json({
      success: true,
      buyPlan: newBuyPlan, // Include the newly created buy plan in the response
      message: "plan buy sucessfully.",
     });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: `Error occurred during user signup: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const BuyPlanAddUser = async (req, res) => {
  console.log(req.body);

  try {
    const {
       
      username,
      phone,
      email,
      state,
      statename,
      country,
      password,
      pincode,
      Gender,
      DOB,
      address,
      city,
      planId,
      totalAmount,
      pHealthHistory,
      cHealthStatus,
      aadharno,finalAmount
     } = req.body;

     const tttt = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" , tttt});
    }
    const profileImg = req.files ? req.files.profile : undefined;


    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists by email or phone
    const existingUser = await userModel.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email or phone already exists" });
    }

    // Calculate the auto-increment ID for userId
    const lastUser = await userModel.findOne().sort({ _id: -1 }).limit(1);
    let userId = 1;
    if (lastUser) {
      userId = parseInt(lastUser.userId || 1) + 1;
    }


    // const transactionId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // const paymentData = PayuHash(totalAmount, username, email, phone, transactionId);
	 
      
       const homeData = await homeModel.findOne({});
        if (!homeData) {
            return res.status(500).send({ message: 'Home data not found in the database', success: false });
        }

        console.log('homeData',homeData)
        const { keyId, keySecret } = homeData;
        if (!keyId || !keySecret) {
            return res.status(500).send({ message: 'Razorpay keys are missing in the database', success: false });
        }
        
      const instance = new razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
              const options = {
            amount: Number(totalAmount * 100), // Razorpay expects the amount in paise
            currency: "INR",
        };

           const order = await instance.orders.create(options);


    let updateField = {
      type: 2,
      username,
      phone,
      email,
      password: hashedPassword,
      pincode,
      gender: Gender,
      DOB,
      address,
      state,
      statename,
      country,
      city,
      userId,
      pHealthHistory,
      cHealthStatus,
      aadharno
    };
    if (profileImg && profileImg[0]) {
      updateField.profile = profileImg[0].path; // Assumes profile[0] is the uploaded file
    }

    const newUser = new userModel(updateField);

    	 

    await newUser.save();

    // Determine 'Local' based on the state
    let Local = 0;
    if (newUser.state) {
      const State = await zonesModel.findById(newUser.state);
      if (State && State.primary === 'true') {
        Local = 1;
      }
    }

    // Calculate the auto-increment ID for paymentId
    const lastLead = await buyPlanModel.findOne().sort({ _id: -1 }).limit(1);
    let paymentId = 1;
    if (lastLead) {
      paymentId = parseInt(lastLead.paymentId || 1) + 1;
    }

    const newBuyPlan = new buyPlanModel({
      userId: newUser._id,
      planId,
      totalAmount,
      paymentId,
      note: 'Payment successfully added',
      payment: 0, // Placeholder for actual payment value
      Local,
  razorpay_order_id: order.id,
    });

    await newBuyPlan.save();

    res.status(201).json({
      success: true,
      user: newUser,
      buyPlan: newBuyPlan, // Include the newly created buy plan in the response
      message: "User signed up successfully and plan added.",
       
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: `Error occurred during user signup: ${error.message}`,
      success: false,
      error,
    });
  }
};

export const BuyPlanAddUser_old_last = async (req, res) => {
  console.log(req.body);

  try {
    const {
       
      username,
      phone,
      email,
      state,
      statename,
      country,
      password,
      pincode,
      Gender,
      DOB,
      address,
      city,
      planId,
      totalAmount,
      pHealthHistory,
      cHealthStatus,
      aadharno,finalAmount
     } = req.body;

     const tttt = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" , tttt});
    }
    const profileImg = req.files ? req.files.profile : undefined;


    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists by email or phone
    const existingUser = await userModel.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email or phone already exists" });
    }

    // Calculate the auto-increment ID for userId
    const lastUser = await userModel.findOne().sort({ _id: -1 }).limit(1);
    let userId = 1;
    if (lastUser) {
      userId = parseInt(lastUser.userId || 1) + 1;
    }


    const transactionId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const paymentData = PayuHash(totalAmount, username, email, phone, transactionId);
	 
    let updateField = {
      type: 2,
      username,
      phone,
      email,
      password: hashedPassword,
      pincode,
      gender: Gender,
      DOB,
      address,
      state,
      statename,
      country,
      city,
      userId,
      pHealthHistory,
      cHealthStatus,
      aadharno
    };
    if (profileImg && profileImg[0]) {
      updateField.profile = profileImg[0].path; // Assumes profile[0] is the uploaded file
    }

    const newUser = new userModel(updateField);

    	 

    await newUser.save();

    // Determine 'Local' based on the state
    let Local = 0;
    if (newUser.state) {
      const State = await zonesModel.findById(newUser.state);
      if (State && State.primary === 'true') {
        Local = 1;
      }
    }

    // Calculate the auto-increment ID for paymentId
    const lastLead = await buyPlanModel.findOne().sort({ _id: -1 }).limit(1);
    let paymentId = 1;
    if (lastLead) {
      paymentId = parseInt(lastLead.paymentId || 1) + 1;
    }

    const newBuyPlan = new buyPlanModel({
      userId: newUser._id,
      planId,
      totalAmount,
      paymentId,
      note: 'Payment successfully added',
      payment: 0, // Placeholder for actual payment value
      Local,
      razorpay_order_id: transactionId
    });

    await newBuyPlan.save();

    res.status(201).json({
      success: true,
      user: newUser,
      buyPlan: newBuyPlan, // Include the newly created buy plan in the response
      message: "User signed up successfully and plan added.",
      paymentData
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: `Error occurred during user signup: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const PaymentSuccess = async (req, res) => {
  // Extract the PayU response params sent to successUrl
  const { txnid, status } = req.body;

  if (status === 'success') {
    // Update the payment status if the transaction exists, or create a new one
    const updatedTransaction = await buyPlanModel.findOneAndUpdate(
      { razorpay_order_id: txnid }, // Find the transaction by txnid
      {
        $set: {
          payment: 1, // Payment successful
        },
      },
      { new: true, upsert: true } // `new: true` returns the updated document, `upsert: true` creates a new document if not found
    ).populate('userId'); // Assuming 'user' is the reference field to the user model
    

        // Send notification
        const notificationData = {
          mobile: `91${updatedTransaction?.userId.phone}`,
          templateid: "947805560855158",
          overridebot: "yes",
          template: {
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: updatedTransaction?.userId.username },
                  { type: "text", text: `https://ynbhealthcare.com/card-view/${updatedTransaction._id}` }
                ]
              }
            ]
          }
        };

   await axios.post(process.env.WHATSAPPAPI, notificationData, {
      headers: {
        "API-KEY": process.env.WHATSAPPKEY,
        "Content-Type": "application/json"
      }
    });



    if (!updatedTransaction) {
      res.redirect(process.env.RFAILURL);
    }
    res.redirect(`${process.env.RSUCCESSURL}/${txnid}`);

  } else {
    res.redirect(process.env.RFAILURL);
  }

};

export const PaymentFail = async (req, res) => {
  res.redirect(process.env.RFAILURL);
};

export const userPlanIdController = async (req, res) => {
  try {


    const PlanCat = await buyPlanModel.findById(req.params.id).populate('userId', 'username phone email address').populate('planId')  // Populating user info from the 'userId' field
    const Plan = await planModel.findById(PlanCat.planId)
      .populate('Category')  // This can be removed if Category is not directly in buyPlanModel.

    let PlanValidity;
    if (PlanCat) {
      const planDetails = PlanCat?.planId;
      const planValidityInDays = planDetails?.validity; // Number of days the plan is valid for
      const purchaseDate = PlanCat?.createdAt; // Date when the plan was purchased

      // Calculate validTill date by adding validity days to the purchase date
      const validTill = new Date(purchaseDate);
      validTill.setDate(validTill.getDate() + planValidityInDays);

      // Calculate days left
      const currentDate = new Date();
      const daysLeft = Math.floor((validTill - currentDate) / (1000 * 60 * 60 * 24)); // Difference in days
      if (daysLeft > 0) {
        PlanValidity = daysLeft;
      } else {
        PlanValidity = 0;
      }
    }

    if (!Plan || !PlanCat) {
      return res.status(200).send({
        message: "Plan Not Found By Id",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Plan Found!",
      success: true,
      Plan,
      PlanCat,
      PlanValidity
    });

  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Erorr WHile Deleteing BLog",
      error,
    });
  }
};

export const profileVendorImage = upload.fields([
  { name: "Doc1", maxCount: 1 },
  { name: "Doc2", maxCount: 1 },
  { name: "Doc3", maxCount: 1 },
  { name: "profile", maxCount: 1 },
]);

export const updateVendorProfileUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      address,
      email,
      pincode,
      password,
      gender,
      state,
      statename,
      city,
      confirm_password,
      about,
      department, coverage, gallery,images,whatsapp,call,establishment,dynamicUsers,
         location,
      longitude,
      latitude
    } = req.body;
    console.log("Uploaded files:", req.files);

    const olduser = await userModel.findById(id);

    const Doc1 = req.files ? req.files.Doc1 : undefined;
    const Doc2 = req.files ? req.files.Doc2 : undefined;
    const Doc3 = req.files ? req.files.Doc3 : undefined;
    const profileImg = req.files ? req.files.profile : undefined;

    console.log("req.body", req.body, profileImg);

    let updateFields = {
      username,
      address,
      pincode,
      gender,
      state,
      statename,
      city,
      about,
      department,
      coverage,
      gallery,images,whatsapp,call,establishment,dynamicUsers
    };

    if(olduser.email !== email){
      // updateFields.email = email;
    }
    
    if (password.length > 0 && confirm_password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }
    // If the files exist, update the corresponding fields
    if (Doc1 && Doc1[0]) {
      updateFields.Doc1 = Doc1[0].path.replace(/\\/g, "/").replace(/^public\//, "");
    }
    if (Doc2 && Doc2[0]) {
      updateFields.Doc2 = Doc2[0].path.replace(/\\/g, "/").replace(/^public\//, "");
    }
    if (Doc3 && Doc3[0]) {
      updateFields.Doc3 = Doc3[0].path.replace(/\\/g, "/").replace(/^public\//, "");
    }
    if (profileImg && profileImg[0]) {
      updateFields.profile = profileImg[0].path.replace(/\\/g, "/").replace(/^public\//, "");
    }

        if(location){
      updateFields.location = location;
    }
      if(longitude){
      updateFields.longitude = longitude;
      }
        if(latitude){
      updateFields.latitude = latitude;
        }

    const user = await userModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    return res.status(200).json({
      message: "user Updated!",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Promo code: ${error}`,
      success: false,
      error,
    });
  }
};


export const CreateVendorProfileUser = async (req, res) => {
  try {
     const {
      username,
      address,
      email,
      phone,
      pincode,
      password,
      gender,
      state,
      statename,
      city,
      confirm_password,
      about,
      department, coverage, gallery,images,whatsapp,call,establishment,empType
    } = req.body;
    console.log("Uploaded files:", req.files);


    const Doc1 = req.files ? req.files.Doc1 : undefined;
    const Doc2 = req.files ? req.files.Doc2 : undefined;
    const Doc3 = req.files ? req.files.Doc3 : undefined;
    const profileImg = req.files ? req.files.profile : undefined;

    console.log("req.body", req.body, profileImg);

    let updateFields = {
      username,
      email,
      phone,
      address,
      pincode,
      gender,
      state,
      statename,
      city,
      about,
      department,
      coverage,
      gallery,images,whatsapp,call,establishment,type:3,empType
    };

  
    
    if (password.length > 0 && confirm_password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }
    // If the files exist, update the corresponding fields
    if (Doc1 && Doc1[0]) {
      updateFields.Doc1 = Doc1[0].path.replace(/\\/g, "/").replace(/^public\//, "");
    }
    if (Doc2 && Doc2[0]) {
      updateFields.Doc2 = Doc2[0].path.replace(/\\/g, "/").replace(/^public\//, "");
    }
    if (Doc3 && Doc3[0]) {
      updateFields.Doc3 = Doc3[0].path.replace(/\\/g, "/").replace(/^public\//, "");
    }
    if (profileImg && profileImg[0]) {
      updateFields.profile = profileImg[0].path.replace(/\\/g, "/").replace(/^public\//, "");
    }

const newUser = new userModel(updateFields);
await newUser.save();


    return res.status(200).json({
      message: "user created!",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: `Error while updating Promo code: ${error}`,
      success: false,
      error,
    });
  }
};


export const getCategoriesWithProducts_6sep_2025 = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { location =  '' } = req.query;

    // Fetch all categories
    const categories = await categoryModel.find({}).exec();

    // Fetch products for each category, limit to 20 per category, and filter by state and city
    const categoriesWithProducts = await Promise.all(categories.map(async (category) => {
      // Build the query to filter products by category
      const productQuery = [
        {
          $match: {
            Category: category._id,  // Match the category
          }
        },
        {
          $lookup: {
            from: 'users', // Assuming your User model is named 'users'
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails',
          }
        },
        {
          $unwind: '$userDetails', // Unwind the user details array from the lookup
        },
        {
          // $match: {
          //   ...(location && { 
          //     $or: [
          //       { 'userDetails.statename': { $regex: new RegExp(`^${location}$`, 'i') } },
          //       { 'userDetails.city': { $regex: new RegExp(`^${location}$`, 'i') } }
          //     ] 
          //   }),
          // }
          $match: {
            ...(location && {
              'userDetails.coverage': {
                $elemMatch: { $regex: new RegExp(`^${location}$`, 'i') }
              }
            }),
          }
        },
        {
          $limit: 20,  // Limit to 20 products per category
        },
        {
          $project: {
            title: 1,  // Include the required fields from the product
            description: 1,
            pImage: 1,
            userId: 1,
            Category: 1,
            slug: 1,
            features: 1,
            salePrice: 1,
            regularPrice: 1,
            // Add any other fields you need from the product model
          }
        }
      ];

      // Fetch the products using the aggregation pipeline
      const products = await productModel.aggregate(productQuery);

      // Attach products to the category object
      category.products = products;

      // Convert category to a plain JavaScript object to include 'products'
      const categoryObject = category.toObject();

      if (products.length === 0) {
        return null;
      }else{
  // Return the updated category object with products
  return {
    ...categoryObject, // This will include the category fields
    products: category.products, // Explicitly include the products field
  };
      }
    
    }));

        // Filter out categories that have no products (i.e., where products is null)
        const filteredCategories = categoriesWithProducts.filter(category => category !== null);

    // Return response with the categories and their products
    return res.status(200).send({
      message: "Categories and Products fetched successfully",
      success: true,
      categoriesWithProducts:filteredCategories,
    });

  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `Error: ${error.message}`
    });
  }
}

export const getCategoriesWithProducts_16sep_2025 = async (req, res) => {
  try {
    // Get and process the location filter
    let { location = '' , productId = null } = req.query;
    const locationParts = location.split(',').map(part => part.trim()).filter(Boolean);
    const primaryLocation = locationParts[0] || '';
    const secondaryLocation = locationParts[1] || '';

    // Fetch all categories
const categories = await categoryModel.find({ type: 1, parent: null }).exec();

    // Fetch products for each category
    const categoriesWithProducts = await Promise.all(categories.map(async (category) => {

      // Helper function to build the product query pipeline
      const buildProductQuery = (loc) => [
        {
          $match: {
            Category: category._id,
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails',
          }
        },
        { $unwind: '$userDetails' },
        {
          $match: {
            ...(loc && {
              'userDetails.coverage': {
                $elemMatch: {
                  $regex: new RegExp(`^${loc}$`, 'i')
                }
              }
            }),
          }
        },
        { $limit: 20 },
        {
          $project: {
            title: 1,
            description: 1,
            pImage: 1,
            userId: 1,
            Category: 1,
            slug: 1,
            features: 1,
            salePrice: 1,
            regularPrice: 1,
           
             gst: 1,
             stock: 1,
          }
        }
      ];

      // First try with the primary location
      let products = await productModel.aggregate(buildProductQuery(primaryLocation));

      // If no products found, try secondary location (if available)
      if (products.length === 0 && secondaryLocation) {
        products = await productModel.aggregate(buildProductQuery(secondaryLocation));
      }

      // Attach products to category if any
      if (products.length === 0) return null;

      const categoryObject = category.toObject();
      return {
        ...categoryObject,
        products,
      };
    }));

    // Filter out categories with no matching products
    const filteredCategories = categoriesWithProducts.filter(category => category !== null);

    return res.status(200).send({
      message: "Categories and Products fetched successfully",
      success: true,
      categoriesWithProducts: filteredCategories,
    });

  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
};

export const getCategoriesWithProducts_25_oct = async (req, res) => {
  try {
    let { location = '', catId = null } = req.query;

    const locationParts = location.split(',').map(part => part.trim()).filter(Boolean);
    const primaryLocation = locationParts[0] || '';
    const secondaryLocation = locationParts[1] || '';

// Fetch all top-level categories with type 1
let categories = [];

if (catId) {
  const category = await categoryModel.findOne({ slug: String(catId).toLowerCase() }).exec();

  if (category) {
    categories.push(category); // Add the matched category
  }

  let parent = category.parent;
  if(!category.parent){
     parent = category._id;
  }
  // Optionally, you can also fetch all other categories (with blank products later)
  const otherCategories = await categoryModel.find({ 
    type: 1, 
  parent: { $ne: null, $eq: parent } , // Ensures parent is not null AND matches
    _id: { $ne: category._id }  // Exclude the current category

  });

    categories = [...categories, ...otherCategories];
 
} else {
  categories = await categoryModel.find({ type: 1, parent: null }).exec();
}


    // Fetch products for each category
    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
const isTargetCategory = !catId || String(category.slug).toLowerCase() === String(catId).toLowerCase();

        // Helper function to build the product query pipeline
        const buildProductQuery = (loc) => [
          {
            $match: {
              Category: category._id,
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'userDetails',
            },
          },
          { $unwind: '$userDetails' },
          {
            $match: {
              ...(loc && {
                'userDetails.coverage': {
                  $elemMatch: {
                    $regex: new RegExp(`^${loc}$`, 'i'),
                  },
                },
              }),
            },
          },
          { $limit: 20 },
          {
            $project: {
              title: 1,
              description: 1,
              pImage: 1,
              userId: 1,
              Category: 1,
              slug: 1,
              features: 1,
              salePrice: 1,
              regularPrice: 1,
              gst: 1,
              stock: 1,
            },
          },
        ];

        let products = [];

        if (isTargetCategory) {
          // First try with primary location
          products = await productModel.aggregate(buildProductQuery(primaryLocation));

          // If no products found, try secondary location
          if (products.length === 0 && secondaryLocation) {
            products = await productModel.aggregate(buildProductQuery(secondaryLocation));
          }
        }

        const categoryObject = category.toObject();
        return {
          ...categoryObject,
          products, // either actual products or empty []
        };
      })
    );

    return res.status(200).send({
      message: 'Categories and Products fetched successfully',
      success: true,
      categoriesWithProducts,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
};

 
export const getCategoriesWithProducts = async (req, res) => {
  try {
    let { location = "", catId = null } = req.query;

    const locationParts = location
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const primaryLocation = locationParts[0] || "";
    const secondaryLocation = locationParts[1] || "";

    // -------- helper: fetch a category + all descendant ids (category tree) --------
    const getCategoryTreeIds = async (rootId) => {
      const tree = await categoryModel.aggregate([
        { $match: { _id: rootId } },
        {
          $graphLookup: {
            from: "categories",
            startWith: "$_id",
            connectFromField: "_id",
            connectToField: "parent",
            as: "descendants",
          },
        },
        { $project: { _id: 1, descendants: { _id: 1 } } },
      ]);

      if (!tree || !tree.length) return [rootId];
      const desc = (tree[0].descendants || []).map((d) => d._id);
      return [rootId, ...desc];
    };

    // -------- helper: sample ONE active ad for a category tree (with optional location) --------
    const sampleActiveAdForTree = async (catIds, loc) => {
      const now = new Date();

      const baseMatch = {
        payment: 1,
        Category: { $in: catIds },
      };

      // Add optional coverage matching (handles array or string coverage in DB)
      const adsMatch = { ...baseMatch };
      if (loc && String(loc).trim()) {
        const L = String(loc).trim();
        adsMatch.$or = [
          { coverage: { $elemMatch: { $regex: new RegExp(`^${L}$`, "i") } } }, // array
          { coverage: { $regex: new RegExp(`^${L}$`, "i") } }, // string
        ];
      }

      // Try location-matched sample first
      const firstTry = await buyPlanAdsModel.aggregate([
        { $match: adsMatch },
        {
          $addFields: {
            endAt: {
              $cond: [
                { $eq: ["$type", 0] }, // 0 = hourly
                {
                  $dateAdd: {
                    startDate: "$createdAt",
                    unit: "hour",
                    amount: { $ifNull: ["$Quantity", 0] },
                  },
                },
                {
                  $dateAdd: {
                    startDate: "$createdAt",
                    unit: "day",
                    amount: { $ifNull: ["$Quantity", 0] },
                  },
                },
              ],
            },
          },
        },
        { $match: { endAt: { $gt: now } } },
        { $sample: { size: 1 } },
        { $project: { _id: 0, img: 1, adslink: 1, thumbnail: 1 } },
      ]);

      if (firstTry && firstTry.length) return firstTry[0];

      // Fallback: any active ad in the category tree (ignore coverage)
      const fallback = await buyPlanAdsModel.aggregate([
        { $match: baseMatch },
        {
          $addFields: {
            endAt: {
              $cond: [
                { $eq: ["$type", 0] },
                {
                  $dateAdd: {
                    startDate: "$createdAt",
                    unit: "hour",
                    amount: { $ifNull: ["$Quantity", 0] },
                  },
                },
                {
                  $dateAdd: {
                    startDate: "$createdAt",
                    unit: "day",
                    amount: { $ifNull: ["$Quantity", 0] },
                  },
                },
              ],
            },
          },
        },
        { $match: { endAt: { $gt: now } } },
        { $sample: { size: 1 } },
        { $project: { _id: 0, img: 1, adslink: 1, thumbnail: 1 } },
      ]);

      if (fallback && fallback.length) return fallback[0];

      return null;
    };

    // ------------------- Fetch all top-level / targeted categories -------------------
    let categories = [];

    if (catId) {
      const category = await categoryModel
        .findOne({ slug: String(catId).toLowerCase() })
        .exec();

      if (category) {
        categories.push(category); // target category first
      }

      let parent = category?.parent;
      if (!category?.parent) {
        parent = category?._id;
      }

      const otherCategories = await categoryModel.find({
        type: 1,
        parent: { $ne: null, $eq: parent }, // siblings under same parent
        _id: { $ne: category?._id },
      });

      categories = [...categories, ...otherCategories];
    } else {
      categories = await categoryModel.find({ type: 1, parent: null }).exec();
    }

    // ------------------- For each category: products + ads (per category tree) -------------------
    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
        const isTargetCategory =
          !catId ||
          String(category.slug).toLowerCase() === String(catId).toLowerCase();

        // Build aggregation pipeline for products with optional location
        const buildProductQuery = (loc) => [
          { $match: { Category: category._id } },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          { $unwind: "$userDetails" },
          {
            $match: {
              ...(loc && {
                "userDetails.coverage": {
                  $elemMatch: { $regex: new RegExp(`^${loc}$`, "i") },
                },
              }),
            },
          },
          { $limit: 20 },
          {
            $project: {
              title: 1,
              description: 1,
              pImage: 1,
              userId: 1,
              Category: 1,
              slug: 1,
              features: 1,
              salePrice: 1,
              regularPrice: 1,
              gst: 1,
              stock: 1,
            },
          },
        ];

        // Fetch products (primary → secondary location fallback) only for target category
        let products = [];
        if (isTargetCategory) {
          products = await productModel.aggregate(buildProductQuery(primaryLocation));
          if (products.length === 0 && secondaryLocation) {
            products = await productModel.aggregate(buildProductQuery(secondaryLocation));
          }
        }

        // ---- NEW: ads image per category tree (category + descendants) ----
        const catIds = await getCategoryTreeIds(category._id);

        // Try with primaryLocation → then secondary → then ignore coverage
        let sampledAd = await sampleActiveAdForTree(catIds, primaryLocation);
        if (!sampledAd && secondaryLocation) {
          sampledAd = await sampleActiveAdForTree(catIds, secondaryLocation);
        }
        if (!sampledAd) {
          sampledAd = await sampleActiveAdForTree(catIds, ""); // no coverage filter
        }

        const adsImage = sampledAd?.img || null;
        const adsImageLink = sampledAd?.adslink || null;
        const thumbnail = sampledAd?.thumbnail || null;

        const categoryObject = category.toObject();
        return {
          ...categoryObject,
          products, // [] if not target or no matches
          adsImage,
          adsImageLink,
          thumbnail,
        };
      })
    );

    return res.status(200).send({
      message: "Categories and Products fetched successfully",
      success: true,
      categoriesWithProducts,
    });
  } catch (error) {
    console.error("Error in getCategoriesWithProducts:", error);
    return res.status(500).send({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
};



export const getCategoriesWithSubcategory_25_oct_2025 = async (req, res) => {
  try {
    const { location = '' } = req.query;

    // Step 1: Fetch top-level categories (parent is null)
    const parentCategories = await categoryModel.find({ parent: null });

    // Step 2: For each parent category, get its valid subcategories
    const categoriesWithSubcategories = await Promise.all(
      parentCategories.map(async (parentCategory) => {
        // Find subcategories of this parent
        const subcategories = await categoryModel.find({ parent: parentCategory._id });

        // Check which subcategories have products with matching user location
        const validSubcategories = await Promise.all(
          subcategories.map(async (subCat) => {
            const matchingProducts = await productModel.aggregate([
              { $match: { Category: subCat._id } },
              {
                $lookup: {
                  from: 'users',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'userDetails',
                },
              },
              { $unwind: '$userDetails' },
              {
                $match: {
                  ...(location && {
                    'userDetails.coverage': {
                      $elemMatch: { $regex: new RegExp(`^${location}$`, 'i') }
                    }
                  })
                }
              },
              { $limit: 1 } // We only care if at least one product exists
            ]);

            return matchingProducts.length > 0 ? subCat.toObject() : null;
          })
        );

        // Remove nulls
        const filteredSubcategories = validSubcategories.filter(sub => sub !== null);

        if (filteredSubcategories.length === 0) {
          return null; // Skip parent category if no valid subcategories
        }

        return {
          ...parentCategory.toObject(),
          subcategories: filteredSubcategories,
        };
      })
    );

    // Filter out null categories
    const result = categoriesWithSubcategories.filter(cat => cat !== null);

    return res.status(200).send({
      success: true,
      message: "Categories and Subcategories fetched successfully",
      categories: result,
    });

  } catch (error) {
    console.error("Error fetching categories with subcategories:", error);
    return res.status(500).send({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
};

export const getCategoriesWithSubcategory = async (req, res) => {
  try {
    const { location = "" } = req.query;

    // Support "City, State" → try primary first, then secondary
    const locationParts = String(location)
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const primaryLocation = locationParts[0] || "";
    const secondaryLocation = locationParts[1] || "";

    // ---------------- helper: get [root, ...descendantIds] via $graphLookup ---------------
    const getCategoryTreeIds = async (rootId) => {
      const tree = await categoryModel.aggregate([
        { $match: { _id: rootId } },
        {
          $graphLookup: {
            from: "categories",
            startWith: "$_id",
            connectFromField: "_id",
            connectToField: "parent",
            as: "descendants",
          },
        },
        { $project: { _id: 1, descendants: { _id: 1 } } },
      ]);
      if (!tree?.length) return [rootId];
      const desc = (tree[0].descendants || []).map((d) => d._id);
      return [rootId, ...desc];
    };

    // ---------------- helper: sample ONE active ad for a category tree -------------------
    const sampleActiveAdForTree = async (catIds, loc) => {
      const now = new Date();

      const baseMatch = { payment: 1, Category: { $in: catIds } };
      const withCoverage = { ...baseMatch };

      if (loc && String(loc).trim()) {
        const L = String(loc).trim();
        // handle both array and string coverage in DB
        withCoverage.$or = [
          { coverage: { $elemMatch: { $regex: new RegExp(`^${L}$`, "i") } } }, // array case
          { coverage: { $regex: new RegExp(`^${L}$`, "i") } },                 // string case
        ];
      }

      // try with coverage
      const firstTry = await buyPlanAdsModel.aggregate([
        { $match: withCoverage },
        {
          $addFields: {
            endAt: {
              $cond: [
                { $eq: ["$type", 0] }, // 0 = hourly
                { $dateAdd: { startDate: "$createdAt", unit: "hour", amount: { $ifNull: ["$Quantity", 0] } } },
                { $dateAdd: { startDate: "$createdAt", unit: "day",  amount: { $ifNull: ["$Quantity", 0] } } },
              ],
            },
          },
        },
        { $match: { endAt: { $gt: now } } },
        { $sample: { size: 1 } },
        { $project: { _id: 0, img: 1, adslink: 1, thumbnail: 1 } },
      ]);

      if (firstTry?.length) return firstTry[0];

      // fallback: ignore coverage
      const fallback = await buyPlanAdsModel.aggregate([
        { $match: baseMatch },
        {
          $addFields: {
            endAt: {
              $cond: [
                { $eq: ["$type", 0] },
                { $dateAdd: { startDate: "$createdAt", unit: "hour", amount: { $ifNull: ["$Quantity", 0] } } },
                { $dateAdd: { startDate: "$createdAt", unit: "day",  amount: { $ifNull: ["$Quantity", 0] } } },
              ],
            },
          },
        },
        { $match: { endAt: { $gt: now } } },
        { $sample: { size: 1 } },
        { $project: { _id: 0, img: 1, adslink: 1, thumbnail: 1 } },
      ]);

      if (fallback?.length) return fallback[0];
      return null;
    };

    // ---------------- Step 1: Fetch top-level categories (parent is null) ----------------
    const parentCategories = await categoryModel.find({ parent: null });

    // ---------------- Step 2: For each parent, gather valid subcategories + ads ---------
    const categoriesWithSubcategories = await Promise.all(
      parentCategories.map(async (parentCategory) => {
        // subcategories of this parent
        const subcategories = await categoryModel.find({ parent: parentCategory._id });

        // which subcategories have at least one product matching location (primary → secondary)
        const validSubcategories = await Promise.all(
          subcategories.map(async (subCat) => {
            const pipeline = (loc) => ([
              { $match: { Category: subCat._id } },
              {
                $lookup: {
                  from: "users",
                  localField: "userId",
                  foreignField: "_id",
                  as: "userDetails",
                },
              },
              { $unwind: "$userDetails" },
              {
                $match: {
                  ...(loc && {
                    "userDetails.coverage": {
                      $elemMatch: { $regex: new RegExp(`^${loc}$`, "i") },
                    },
                  }),
                },
              },
              { $limit: 1 },
            ]);

            let found = await productModel.aggregate(pipeline(primaryLocation));
            if (!found.length && secondaryLocation) {
              found = await productModel.aggregate(pipeline(secondaryLocation));
            }

            return found.length ? subCat.toObject() : null;
          })
        );

        // keep only valid
        const filteredSubcategories = validSubcategories.filter(Boolean);

        if (!filteredSubcategories.length) {
          return null; // no valid subs → skip this parent category
        }

        // -------- NEW: attach one ad per PARENT CATEGORY TREE (parent + descendants) -----
        const catIds = await getCategoryTreeIds(parentCategory._id);

        // try primary → secondary → ignore coverage
        let adDoc = await sampleActiveAdForTree(catIds, primaryLocation);
        if (!adDoc && secondaryLocation) {
          adDoc = await sampleActiveAdForTree(catIds, secondaryLocation);
        }
        if (!adDoc) {
          adDoc = await sampleActiveAdForTree(catIds, "");
        }

        const adsImage = adDoc?.img || null;
        const adsImageLink = adDoc?.adslink || null;
        const thumbnail = adDoc?.thumbnail || null;

        return {
          ...parentCategory.toObject(),
          subcategories: filteredSubcategories,
          adsImage,
          adsImageLink,
          thumbnail,
        };
      })
    );

    // remove null parents
    const result = categoriesWithSubcategories.filter(Boolean);

    return res.status(200).send({
      success: true,
      message: "Categories and Subcategories fetched successfully",
      categories: result,
    });
  } catch (error) {
    console.error("Error fetching categories with subcategories:", error);
    return res.status(500).send({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
};


export const getCategoriesWithProductsByID = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Fetch products of the given user and group by categories
    const data = await productModel.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) }, // filter products by userId
      },
      {
        $unwind: "$Category", // break multiple categories into separate docs
      },
      {
        $lookup: {
          from: "categories", // category collection name in MongoDB
          localField: "Category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $unwind: "$categoryData",
      },
      {
        $group: {
          _id: "$Category",
          category: { $first: "$categoryData" },
          products: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          category: {
            _id: "$category._id",
            title: "$category.title",
            slug: "$category.slug",
            description: "$category.description",
            image: "$category.image",
          },
          products: {
            _id: 1,
            title: 1,
            description: 1,
            pImage: 1,
            salePrice: 1,
            regularPrice: 1,
            stock: 1,
            slug: 1,
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching categories and products:", error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

const STOPWORDS = new Set([
  "a","an","and","the","of","in","on","at","to","for","from","by","with",
  "is","are","was","were","be","been","being","as","it","that","this","those",
  "these","or","not","near","me","my","our","your","their","his","her","its",
  "into","over","under","within","around","about","up","down","out","off","per" ,"in"
]);

const escapeReg = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const tokenize = (raw) => {
  // lower, split on non-letters/digits, remove stopwords/short tokens
  const toks = String(raw || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((t) => t.trim())
    .filter((t) => t && t.length > 1 && !STOPWORDS.has(t));
  // de-duplicate while preserving order
  return [...new Set(toks)];
};

export const getProductDeepSearch_old = async (req, res) => {
  try {
    const { keywords } = req.query;
    if (!keywords) {
      return res.status(400).json({ success: false, message: "keywords is required" });
    }

    const page  = Math.max(parseInt(req.query.page  || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip  = (page - 1) * limit;

    // ---- Tokenize + remove stopwords ----
    const tokens = tokenize(keywords);
    if (!tokens.length) {
      return res.status(400).json({ success: false, message: "No meaningful keywords after filtering." });
    }

    // ---- FULL WORD regexes: \bword\b (case-insensitive) ----
    const regexesBounded = tokens.map(
      (t) => new RegExp(`\\b${escapeReg(t)}\\b`, "i")
    );

    // For $regexMatch pattern alternatives with word boundaries
    const boundedAlt = tokens.map((t) => `\\b${escapeReg(t)}\\b`).join("|");
    const pattern = `(${boundedAlt})`;
    const options = "i";

    const pipeline = [
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      {
        $addFields: {
          _statename:   { $ifNull: ["$user.statename", ""] },
          _coverageArr: {
            $cond: [
              { $and: [ { $ne: ["$user.coverage", null] }, { $isArray: "$user.coverage" } ] },
              "$user.coverage",
              []
            ]
          },
          _featuresStr: {
            $cond: [
              { $isArray: "$features" },
              {
                $reduce: {
                  input: "$features",
                  initialValue: "",
                  in: { $concat: ["$$value", " ", { $toString: "$$this" }] }
                }
              },
              ""
            ]
          }
        }
      },

      // -------- HARD REQUIREMENT: title must match at least one WHOLE WORD --------
      {
        $match: {
          $or: regexesBounded.map((r) => ({ title: { $regex: r } }))
        }
      },

      // -------- scoring booleans (also word-boundary based) --------
      {
        $addFields: {
          coverageMatch: {
            $anyElementTrue: {
              $map: {
                input: "$_coverageArr",
                as: "c",
                in: { $regexMatch: { input: { $toString: "$$c" }, regex: pattern, options } }
              }
            }
          },
          stateMatch: { $regexMatch: { input: "$_statename", regex: pattern, options } },
          titleMatch: { $regexMatch: { input: "$title",      regex: pattern, options } },
          otherMatch: {
            $or: [
              { $regexMatch: { input: "$description",      regex: pattern, options } },
              { $regexMatch: { input: "$metaTitle",        regex: pattern, options } },
              { $regexMatch: { input: "$metaDescription",  regex: pattern, options } },
              { $regexMatch: { input: "$metaKeywords",     regex: pattern, options } },
              { $regexMatch: { input: "$_featuresStr",     regex: pattern, options } }
            ]
          }
        }
      },

      // weighted score
      {
        $addFields: {
          score: {
            $add: [
              { $cond: [{ $eq: ["$coverageMatch", true] }, 3, 0] },
              { $cond: [{ $eq: ["$stateMatch",    true] }, 2, 0] },
              { $cond: [{ $eq: ["$titleMatch",    true] }, 1.5, 0] },
              { $cond: [{ $eq: ["$otherMatch",    true] }, 1, 0] }
            ]
          }
        }
      },

      // default sort (relevance + recency)
      { $sort: { score: -1, updatedAt: -1, createdAt: -1 } },

      // paginate
      {
        $facet: {
          results: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                title: 1,
                description: 1,
                pImage: 1,
                images: 1,
                slug: 1,
                salePrice: 1,
                regularPrice: 1,
                createdAt: 1,
                updatedAt: 1,
                user: { username: 1, statename: 1, coverage: 1 },
                score: 1,
                coverageMatch: 1,
                stateMatch: 1,
                titleMatch: 1,
                otherMatch: 1,
                metaDescription: 1,
              }
            }
          ],
          totalCount: [{ $count: "count" }]
        }
      }
    ];

    const agg = await productModel.aggregate(pipeline);
    const results = agg?.[0]?.results || [];
    const total   = agg?.[0]?.totalCount?.[0]?.count || 0;

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      results,
      debug: { tokens }
    });
  } catch (error) {
    console.error("Error fetching deep search:", error);
    return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};



 


export const getProductDeepSearch = async (req, res) => {
  try {
    const { keywords } = req.query;
    if (!keywords) {
      return res.status(400).json({ success: false, message: "keywords is required" });
    }

    const page  = Math.max(parseInt(req.query.page  || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip  = (page - 1) * limit;
    const sortParam = String(req.query.sort || "relevance");

    // tokens (full words only, no stopwords)
    const tokens = tokenize(keywords);
    if (!tokens.length) {
      return res.status(400).json({ success: false, message: "No meaningful keywords after filtering." });
    }

    // title must match at least one FULL word
    const regexesBounded = tokens.map((t) => new RegExp(`\\b${escapeReg(t)}\\b`, "i"));

    // pattern for $regexMatch in other fields
    const boundedAlt = tokens.map((t) => `\\b${escapeReg(t)}\\b`).join("|");
    const pattern = `(${boundedAlt})`;
    const options = "i";

    const pipeline = [
      // Join vendor/user doc
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      // Join ratings by product._id
      {
        $lookup: {
          from: "ratings",
          let: { pid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$productId", "$$pid"] } } },
            // keep only approved/active ratings if you use status
            { $match: { status: "1" } },
            { $project: { _id: 1, rating: 1, createdAt: 1 } }
          ],
          as: "ratings"
        }
      },
      // Compute avg & count from ratings
      {
        $addFields: {
          ratingCount: { $size: "$ratings" },
          avgRating: {
            $cond: [
              { $gt: [{ $size: "$ratings" }, 0] },
              { $avg: "$ratings.rating" },
              null
            ]
          }
        }
      },

      // Precompute strings/arrays used for search
      {
        $addFields: {
          _statename: { $ifNull: ["$user.statename", ""] },
          _coverageArr: {
            $cond: [
              { $and: [ { $ne: ["$user.coverage", null] }, { $isArray: "$user.coverage" } ] },
              "$user.coverage",
              []
            ]
          },
          _featuresStr: {
            $cond: [
              { $isArray: "$features" },
              {
                $reduce: {
                  input: "$features",
                  initialValue: "",
                  in: { $concat: ["$$value", " ", { $toString: "$$this" }] }
                }
              },
              ""
            ]
          }
        }
      },

      // HARD REQUIREMENT: Title must match ≥1 whole keyword
      { $match: { $or: regexesBounded.map((r) => ({ title: { $regex: r } })) } },

      // Scoring booleans (also full-word)
      {
        $addFields: {
          coverageMatch: {
            $anyElementTrue: {
              $map: {
                input: "$_coverageArr",
                as: "c",
                in: { $regexMatch: { input: { $toString: "$$c" }, regex: pattern, options } }
              }
            }
          },
          stateMatch: { $regexMatch: { input: "$_statename", regex: pattern, options } },
          titleMatch: { $regexMatch: { input: "$title",      regex: pattern, options } },
          otherMatch: {
            $or: [
              { $regexMatch: { input: "$description",     regex: pattern, options } },
              { $regexMatch: { input: "$metaTitle",       regex: pattern, options } },
              { $regexMatch: { input: "$metaDescription", regex: pattern, options } },
              { $regexMatch: { input: "$metaKeywords",    regex: pattern, options } },
              { $regexMatch: { input: "$_featuresStr",    regex: pattern, options } }
            ]
          }
        }
      },

      // Weighted relevance score
      {
        $addFields: {
          score: {
            $add: [
              { $cond: [{ $eq: ["$coverageMatch", true] }, 3, 0] },
              { $cond: [{ $eq: ["$stateMatch",    true] }, 2, 0] },
              { $cond: [{ $eq: ["$titleMatch",    true] }, 1.5, 0] },
              { $cond: [{ $eq: ["$otherMatch",    true] }, 1, 0] }
            ]
          }
        }
      }
    ];

    // Dynamic sort
    let sortStage = { score: -1, updatedAt: -1, createdAt: -1 }; // default: relevance
    if (sortParam === "recent")      sortStage = { updatedAt: -1, createdAt: -1 };
    if (sortParam === "price_asc")   sortStage = { salePrice: 1,  regularPrice: 1, updatedAt: -1 };
    if (sortParam === "price_desc")  sortStage = { salePrice: -1, regularPrice: -1, updatedAt: -1 };
    if (sortParam === "rating_desc") sortStage = { avgRating: -1, ratingCount: -1, updatedAt: -1 };
    if (sortParam === "rating_asc")  sortStage = { avgRating:  1, ratingCount:  1, updatedAt: -1 };

    pipeline.push({ $sort: sortStage });

    // Pagination & projection
    pipeline.push({
      $facet: {
        results: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              title: 1,
              description: 1,
              pImage: 1,
              images: 1,
              slug: 1,
              salePrice: 1,
              regularPrice: 1,
              createdAt: 1,
              updatedAt: 1,
              user: { username: 1, statename: 1, coverage: 1 },
              // relevance flags
              score: 1,
              coverageMatch: 1,
              stateMatch: 1,
              titleMatch: 1,
              otherMatch: 1,
              // ratings
              avgRating: 1,
              ratingCount: 1
            }
          }
        ],
        totalCount: [{ $count: "count" }]
      }
    });

    const agg = await productModel.aggregate(pipeline);
    const results = agg?.[0]?.results || [];
    const total   = agg?.[0]?.totalCount?.[0]?.count || 0;

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      results,
      debug: { tokens, sortParam }
    });
  } catch (error) {
    console.error("Error fetching deep search:", error);
    return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getSellerDeepSearch_old = async (req, res) => {
  try {
    const { keywords } = req.query;
    if (!keywords) {
      return res.status(400).json({ success: false, message: "keywords is required" });
    }

    const page  = Math.max(parseInt(req.query.page  || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip  = (page - 1) * limit;
    const sortParam = String(req.query.sort || "relevance");

    // tokens & regex
    const tokens = tokenize(keywords);
    if (!tokens.length) {
      return res.status(400).json({ success: false, message: "No meaningful keywords" });
    }

    const regexes = tokens.map((t) => new RegExp(`\\b${escapeReg(t)}\\b`, "i"));
    const alt = tokens.map((t) => `\\b${escapeReg(t)}\\b`).join("|");
    const pattern = `(${alt})`;
    const options = "i";

    const pipeline = [
      { $match: { type: 3 } }, // sellers only

      // --- main keyword filter ---
      {
        $match: {
          $or: [
            ...regexes.map((r) => ({ username: { $regex: r } })),
            ...regexes.map((r) => ({ statename: { $regex: r } })),
            { coverage: { $elemMatch: { $regex: new RegExp(pattern, options) } } }
          ]
        }
      },

      // ratings join
      {
        $lookup: {
          from: "ratings",
          let: { uid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$vendorId", "$$uid"] } } },
            { $match: { status: "1" } },
            { $project: { rating: 1 } }
          ],
          as: "ratings"
        }
      },
      {
        $addFields: {
          ratingCount: { $size: "$ratings" },
          avgRating: {
            $cond: [
              { $gt: [{ $size: "$ratings" }, 0] },
              { $avg: "$ratings.rating" },
              null
            ]
          }
        }
      },

      // scoring signals
      {
        $addFields: {
          usernameMatch: { $regexMatch: { input: "$username", regex: pattern, options } },
          stateMatch:    { $regexMatch: { input: "$statename", regex: pattern, options } },
          coverageMatch: {
            $anyElementTrue: {
              $map: {
                input: "$coverage",
                as: "c",
                in: { $regexMatch: { input: "$$c", regex: pattern, options } }
              }
            }
          }
        }
      },

      {
        $addFields: {
          score: {
            $add: [
              { $cond: [{ $eq: ["$usernameMatch", true] }, 3, 0] },
              { $cond: [{ $eq: ["$coverageMatch", true] }, 2, 0] },
              { $cond: [{ $eq: ["$stateMatch", true] }, 1.5, 0] }
            ]
          }
        }
      }
    ];

    // dynamic sort
    let sortStage = { score: -1, updatedAt: -1 };
    if (sortParam === "recent") sortStage = { updatedAt: -1, createdAt: -1 };
    if (sortParam === "rating_desc") sortStage = { avgRating: -1, ratingCount: -1 };
    if (sortParam === "rating_asc")  sortStage = { avgRating: 1, ratingCount: 1 };

    pipeline.push({ $sort: sortStage });

    pipeline.push({
      $facet: {
        results: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              username: 1,
              email: 1,
              phone: 1,
              profile: 1,
              statename: 1,
              city: 1,
               gallery: 1,
              coverage: 1,
              avgRating: 1,
              ratingCount: 1,
              score: 1,
              usernameMatch: 1,
              coverageMatch: 1,
              stateMatch: 1,
            }
          }
        ],
        totalCount: [{ $count: "count" }]
      }
    });

    const agg = await userModel.aggregate(pipeline);
    const results = agg?.[0]?.results || [];
    const total   = agg?.[0]?.totalCount?.[0]?.count || 0;

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      results,
      debug: { tokens, sortParam }
    });
  } catch (error) {
    console.error("Error fetching seller deep search:", error);
    return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};
 
 export const getSellerDeepSearch_terms = async (req, res) => {
  try {
    const { keywords } = req.query;
    if (!keywords) {
      return res.status(400).json({ success: false, message: "keywords is required" });
    }

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip = (page - 1) * limit;
    const sortParam = String(req.query.sort || "relevance");

    // --- Tokenize & clean ---
    const stopwords = ["in", "the", "at", "for", "of", "and"];
    const tokens = keywords
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 1 && !stopwords.includes(t.toLowerCase()));

    if (!tokens.length) {
      return res.status(400).json({ success: false, message: "No meaningful keywords" });
    }

    const escapeReg = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const alt = tokens.map((t) => `\\b${escapeReg(t)}\\b`).join("|");
    const pattern = `(${alt})`;
    const options = "i";

    // --- Aggregation pipeline ---
    const pipeline = [
      { $match: { type: 3 } }, // Only sellers

      // --- ratings join ---
      {
        $lookup: {
          from: "ratings",
          let: { uid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$vendorId", "$$uid"] } } },
            { $match: { status: "1" } },
            { $project: { rating: 1 } }
          ],
          as: "ratings"
        }
      },
      {
        $addFields: {
          ratingCount: { $size: "$ratings" },
          avgRating: {
            $cond: [
              { $gt: [{ $size: "$ratings" }, 0] },
              { $avg: "$ratings.rating" },
              null
            ]
          }
        }
      },

      // --- Location match first ---
      {
        $addFields: {
          locationMatch: {
            $or: [
              { $regexMatch: { input: "$statename", regex: pattern, options } },
              { $regexMatch: { input: "$city", regex: pattern, options } }
            ]
          },
          dynamicTypeMatch: { $regexMatch: { input: "$dynamicType", regex: pattern, options } },
          usernameMatch: { $regexMatch: { input: "$username", regex: pattern, options } }
        }
      },

      // --- Filter: only show if location AND dynamicType match ---
      {
        $match: {
          locationMatch: true,
          dynamicTypeMatch: true
        }
      },

      // --- Calculate score ---
      {
        $addFields: {
          score: {
            $add: [
              { $cond: [{ $eq: ["$usernameMatch", true] }, 3, 0] },
              { $cond: [{ $eq: ["$dynamicTypeMatch", true] }, 2, 0] },
              { $cond: [{ $eq: ["$locationMatch", true] }, 1.5, 0] }
            ]
          }
        }
      },

      // --- Sort ---
      {
        $sort: (() => {
          if (sortParam === "recent") return { updatedAt: -1, createdAt: -1 };
          if (sortParam === "rating_desc") return { avgRating: -1, ratingCount: -1 };
          if (sortParam === "rating_asc") return { avgRating: 1, ratingCount: 1 };
          return { score: -1, updatedAt: -1 };
        })()
      },

      // --- Pagination & projection ---
      {
        $facet: {
          results: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                username: 1,
                dynamicType: 1,
                email: 1,
                phone: 1,
                profile: 1,
                statename: 1,
                city: 1,
                gallery: 1,
                avgRating: 1,
                ratingCount: 1,
                score: 1,
                usernameMatch: 1,
                dynamicTypeMatch: 1,
                locationMatch: 1
              }
            }
          ],
          totalCount: [{ $count: "count" }]
        }
      }
    ];

    const agg = await userModel.aggregate(pipeline);
    const results = agg?.[0]?.results || [];
    const total = agg?.[0]?.totalCount?.[0]?.count || 0;

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      results,
      debug: { tokens, sortParam, pattern }
    });
  } catch (error) {
    console.error("Error fetching seller deep search:", error);
    return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getSellerDeepSearch_old_old = async (req, res) => {
  try {
    const { keywords, location } = req.query;

    // --- Basic validations ---
    if (!keywords) {
      return res.status(400).json({ success: false, message: "keywords is required" });
    }
    // If you want location to be optional, comment this out and see the note below where we handle locationMatch.
    if (!location) {
      return res.status(400).json({ success: false, message: "location is required" });
    }

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip = (page - 1) * limit;
    const sortParam = String(req.query.sort || "relevance");

    // --- Tokenize & clean ---
    const stopwords = ["in", "the", "at", "for", "of", "and"];

    // tokens from keywords -> used for dynamicTypeMatch & usernameMatch (NOT location)
    const keywordTokens = String(keywords)
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 1 && !stopwords.includes(t.toLowerCase()));

    if (!keywordTokens.length) {
      return res.status(400).json({ success: false, message: "No meaningful keywords" });
    }

    // tokens from location -> used ONLY for locationMatch
    const locationTokens = String(location)
      .split(/[,\s]+/) // split by comma or whitespace
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !stopwords.includes(t.toLowerCase()));

    // If you made location optional, you can allow empty locationTokens and later set locationMatch to true.
    if (!locationTokens.length) {
      return res.status(400).json({ success: false, message: "No meaningful location tokens" });
    }

    const escapeReg = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Build regex string for keywords
    const keywordAlt = keywordTokens.map((t) => `\\b${escapeReg(t)}\\b`).join("|");
    const keywordPattern = `(${keywordAlt})`;

    // Build regex string for location
    const locationAlt = locationTokens.map((t) => `\\b${escapeReg(t)}\\b`).join("|");
    const locationPattern = `(${locationAlt})`;

    const options = "i";

    // --- Aggregation pipeline ---
    const pipeline = [
      { $match: { type: 3 } }, // Only sellers

      // --- ratings join ---
      {
        $lookup: {
          from: "ratings",
          let: { uid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$vendorId", "$$uid"] } } },
            { $match: { status: "1" } },
            { $project: { rating: 1 } }
          ],
          as: "ratings"
        }
      },
      {
        $addFields: {
          ratingCount: { $size: "$ratings" },
          avgRating: {
            $cond: [
              { $gt: [{ $size: "$ratings" }, 0] },
              { $avg: "$ratings.rating" },
              null
            ]
          }
        }
      },

      // --- Compute matches ---
      {
        $addFields: {
          // LOCATION now matches only against the `location` param
          locationMatch: {
            $or: [
              { $regexMatch: { input: "$statename", regex: locationPattern, options } },
              { $regexMatch: { input: "$city", regex: locationPattern, options } }
            ]
          },

          // These continue to use the keyword-based pattern
          dynamicTypeMatch: { $regexMatch: { input: "$dynamicType", regex: keywordPattern, options } },
          usernameMatch: { $regexMatch: { input: "$username", regex: keywordPattern, options } }
        }
      },

      // --- Filter: require both location AND dynamicType to match ---
      {
        $match: {
          locationMatch: true,
          dynamicTypeMatch: true
        }
      },

      // --- Calculate score ---
      {
        $addFields: {
          score: {
            $add: [
              { $cond: [{ $eq: ["$usernameMatch", true] }, 3, 0] },
              { $cond: [{ $eq: ["$dynamicTypeMatch", true] }, 2, 0] },
              { $cond: [{ $eq: ["$locationMatch", true] }, 1.5, 0] }
            ]
          }
        }
      },

      // --- Sort ---
      {
        $sort: (() => {
          if (sortParam === "recent") return { updatedAt: -1, createdAt: -1 };
          if (sortParam === "rating_desc") return { avgRating: -1, ratingCount: -1 };
          if (sortParam === "rating_asc") return { avgRating: 1, ratingCount: 1 };
          return { score: -1, updatedAt: -1 };
        })()
      },

      // --- Pagination & projection ---
      {
        $facet: {
          results: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                username: 1,
                dynamicType: 1,
                email: 1,
                phone: 1,
                profile: 1,
                statename: 1,
                city: 1,
                gallery: 1,
                avgRating: 1,
                ratingCount: 1,
                score: 1,
                usernameMatch: 1,
                dynamicTypeMatch: 1,
                locationMatch: 1
              }
            }
          ],
          totalCount: [{ $count: "count" }]
        }
      }
    ];

    const agg = await userModel.aggregate(pipeline);
    const results = agg?.[0]?.results || [];
    const total = agg?.[0]?.totalCount?.[0]?.count || 0;

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      results,
      debug: {
        keywordTokens,
        locationTokens,
        sortParam,
        keywordPattern,
        locationPattern
      }
    });
  } catch (error) {
    console.error("Error fetching seller deep search:", error);
    return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

 export const getSellerDeepSearch = async (req, res) => {
  try {
    const { keywords, location } = req.query;

    // --- Basic validations ---
    if (!keywords) {
      return res.status(400).json({ success: false, message: "keywords is required" });
    }
    if (!location) {
      return res.status(400).json({ success: false, message: "location is required" });
    }

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip = (page - 1) * limit;
    const sortParam = String(req.query.sort || "relevance");

    // --- Tokenize & clean ---
    const stopwords = ["in", "the", "at", "for", "of", "and"];

    const keywordTokens = String(keywords)
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 1 && !stopwords.includes(t.toLowerCase()));

    if (!keywordTokens.length) {
      return res.status(400).json({ success: false, message: "No meaningful keywords" });
    }

    const locationTokens = String(location)
      .split(/[,\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !stopwords.includes(t.toLowerCase()));

    if (!locationTokens.length) {
      return res.status(400).json({ success: false, message: "No meaningful location tokens" });
    }

    const escapeReg = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const keywordAlt = keywordTokens.map((t) => `\\b${escapeReg(t)}\\b`).join("|");
    const keywordPattern = `(${keywordAlt})`;

    const locationAlt = locationTokens.map((t) => `\\b${escapeReg(t)}\\b`).join("|");
    const locationPattern = `(${locationAlt})`;

    const options = "i";

    // --- Aggregation pipeline ---
    const pipeline = [
      { $match: { type: 3 } }, // Only sellers

      // --- ratings join ---
      {
        $lookup: {
          from: "ratings",
          let: { uid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$vendorId", "$$uid"] } } },
            { $match: { status: "1" } },
            { $project: { rating: 1 } }
          ],
          as: "ratings"
        }
      },
      {
        $addFields: {
          ratingCount: { $size: "$ratings" },
          avgRating: {
            $cond: [
              { $gt: [{ $size: "$ratings" }, 0] },
              { $avg: "$ratings.rating" },
              null
            ]
          }
        }
      },

      // --- Compute matches ---
      {
        $addFields: {
          locationMatch: {
            $or: [
              { $regexMatch: { input: "$statename", regex: locationPattern, options } },
              { $regexMatch: { input: "$city", regex: locationPattern, options } }
            ]
          },
          dynamicTypeMatch: { $regexMatch: { input: "$dynamicType", regex: keywordPattern, options } },
          usernameMatch: { $regexMatch: { input: "$username", regex: keywordPattern, options } }
        }
      },

      // --- Only show results that match keyword or dynamicType ---
      {
        $match: {
          $or: [
            { usernameMatch: true },
            { dynamicTypeMatch: true }
          ]
        }
      },

      // --- Calculate weighted score ---
      {
        $addFields: {
          score: {
            $add: [
              { $cond: [{ $eq: ["$usernameMatch", true] }, 10, 0] },
              { $cond: [{ $eq: ["$dynamicTypeMatch", true] }, 5, 0] },
              { $cond: [{ $eq: ["$locationMatch", true] }, 2, 0] }
            ]
          }
        }
      },

      // --- Sort logic ---
      {
        $sort: (() => {
          if (sortParam === "recent") return { updatedAt: -1, createdAt: -1 };
          if (sortParam === "rating_desc") return { avgRating: -1, ratingCount: -1 };
          if (sortParam === "rating_asc") return { avgRating: 1, ratingCount: 1 };
          return {
            usernameMatch: -1,
            dynamicTypeMatch: -1,
            locationMatch: -1,
            score: -1,
            updatedAt: -1
          };
        })()
      },

      // --- Pagination & projection ---
      {
        $facet: {
          results: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                username: 1,
                dynamicType: 1,
                email: 1,
                phone: 1,
                profile: 1,
                statename: 1,
                city: 1,
                gallery: 1,
                avgRating: 1,
                ratingCount: 1,
                score: 1,
                usernameMatch: 1,
                dynamicTypeMatch: 1,
                locationMatch: 1
              }
            }
          ],
          totalCount: [{ $count: "count" }]
        }
      }
    ];

    const agg = await userModel.aggregate(pipeline);
    const results = agg?.[0]?.results || [];
    const total = agg?.[0]?.totalCount?.[0]?.count || 0;

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      results,
      debug: {
        keywordTokens,
        locationTokens,
        sortParam,
        keywordPattern,
        locationPattern
      }
    });
  } catch (error) {
    console.error("Error fetching seller deep search:", error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`
    });
  }
};



export const SenderEnquireStatus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters
    const userId = req.query.userId; // Directly access userId from query parameters

    if (!userId) {
      return res.status(400).send({
        message: "userId is required",
        success: false,
      });
    }

    const skip = (page - 1) * limit;

    const query = {
      userId: userId, // Filter by senderId matching userId
    };

    if (searchTerm) {
      query.$or = [
        { 'phone': { $regex: searchTerm, $options: 'i' } }, // Case-insensitive regex search for phone
        { 'email': { $regex: searchTerm, $options: 'i' } }, // Case-insensitive regex search for email
        { 'userId.username': { $regex: searchTerm, $options: 'i' } } // Case-insensitive regex search for username
      ];
    }
    const total = await enquireModel.countDocuments(query); // Count only the documents matching the query

    const Enquire = await enquireModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email phone address') // Populate userId with username and address only
      .lean();

    if (!Enquire || Enquire.length === 0) {
      return res.status(200).send({
        message: "No Enquires found for the given user.",
        success: false,
      });
    }

    return res.status(200).send({
      message: "Enquire list retrieved successfully",
      EnquireCount: Enquire.length,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      success: true,
      Enquire,
    });

  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Enquire data: ${error}`,
      success: false,
      error,
    });
  }
};

// Custom waitForTimeout function
const waitForTimeout = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const adsImage = upload.fields([
  { name: "adsinput", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
]);

export const BuyAdsPlanByUser = async (req, res) => {
  try {

    const {
      adslink,
      type,
      Quantity,
      Category,
      state,
      coverage,
      userId,
      totalAmount,

    } = req.body;

    if(totalAmount === "0"){
  

    // const transactionId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // const paymentData = PayuHash(totalAmount, UserData.username, UserData.email, UserData.phone, transactionId);

    // Determine 'Local' based on the state
    let Local = 0;
    if (state) {
      const StateId = await zonesModel.findById(state);
      if (StateId && StateId.primary === 'true') {
        Local = 1;
      }
    }

    // Calculate the auto-increment ID for paymentId
    const lastLead = await buyPlanAdsModel.findOne().sort({ _id: -1 }).limit(1);
    let paymentId = 1;
    if (lastLead) {
      paymentId = parseInt(lastLead.paymentId || 1) + 1;
    }

    const updatedata = { 
      adslink,
      type,
      Quantity,
      Category,
      state,
      coverage, 
      userId,
      totalAmount,
      paymentId,
      note: 'Payment successfully added',
      payment: totalAmount === '0' ? 1 : 0, // Placeholder for actual payment value
      Local,
      }

     const adsinput = req.files ? req.files.adsinput : undefined;
      const thumbnail = req.files ? req.files.thumbnail : undefined;

	  if (adsinput && adsinput[0]) {
      updatedata.img = adsinput[0].path.replace(/\\/g, "/").replace(/^public\//, "");
    }
    
    if (thumbnail && thumbnail[0]) {
      updatedata.thumbnail = thumbnail[0].path.replace(/\\/g, "/").replace(/^public\//, "");
    }

    
     
    const newBuyPlan = new buyPlanAdsModel(updatedata);

    await newBuyPlan.save();
        res.status(200).json({
      success: true,
      buyAds: newBuyPlan, // Include the newly created buy plan in the response
      message: "Ads buy sucessfully.",
     });
    }else{
       const homeData = await homeModel.findOne({});
        if (!homeData) {
            return res.status(500).send({ message: 'Home data not found in the database', success: false });
        }

        console.log('homeData',homeData)
        const { keyId, keySecret } = homeData;
        if (!keyId || !keySecret) {
            return res.status(500).send({ message: 'Razorpay keys are missing in the database', success: false });
        }

         const instance = new razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
 
              const options = {
            amount: Number(totalAmount * 100), // Razorpay expects the amount in paise
            currency: "INR",
        };
        const order = await instance.orders.create(options);

    // const transactionId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // const paymentData = PayuHash(totalAmount, UserData.username, UserData.email, UserData.phone, transactionId);

    // Determine 'Local' based on the state
    let Local = 0;
    if (state) {
      const StateId = await zonesModel.findById(state);
      if (StateId && StateId.primary === 'true') {
        Local = 1;
      }
    }

    // Calculate the auto-increment ID for paymentId
    const lastLead = await buyPlanAdsModel.findOne().sort({ _id: -1 }).limit(1);
    let paymentId = 1;
    if (lastLead) {
      paymentId = parseInt(lastLead.paymentId || 1) + 1;
    }

    const updatedata = { 
      adslink,
      type,
      Quantity,
      Category,
      state,
      coverage, 
      userId,
      totalAmount,
      paymentId,
      note: 'Payment successfully added',
      payment: totalAmount === 0 ? 1 : 0, // Placeholder for actual payment value
      Local,
      razorpay_order_id: order.id,
     }

     const adsinput = req.files ? req.files.adsinput : undefined;
      const thumbnail = req.files ? req.files.thumbnail : undefined;

	  if (adsinput && adsinput[0]) {
      updatedata.img = adsinput[0].path.replace(/\\/g, "/").replace(/^public\//, "");
    }
    
    if (thumbnail && thumbnail[0]) {
      updatedata.thumbnail = thumbnail[0].path.replace(/\\/g, "/").replace(/^public\//, "");
    }

    
     
    const newBuyPlan = new buyPlanAdsModel(updatedata);

    await newBuyPlan.save();

        res.status(200).json({
      success: true,
      buyAds: newBuyPlan, // Include the newly created buy plan in the response
      message: "Ads buy sucessfully.",
     });
    }
      


  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: `Error occurred during Ads buying: ${error.message}`,
      success: false,
      error,
    });
  }
};


export const getAllAdsFillAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
    const searchTerm = req.query.search || ""; // Get search term from the query parameters
    const userId = req.query.userId || null; // Get search term from the query parameters

    const skip = (page - 1) * limit;

    const query = {};
    if (searchTerm) {
      // If search term is provided, add it to the query
      query.$or = [
        { adslink: { $regex: searchTerm, $options: "i" } }, // Case-insensitive username search
       ];
    }
 
    query.payment = 1;
    if(userId){
    query.userId = userId;
    }

    const totalCategory = await buyPlanAdsModel.countDocuments();

    const Ads = await buyPlanAdsModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in descending order
      .skip(skip)
      .limit(limit)
      .lean();

    if (!Ads) {
      return res.status(200).send({
        message: "NO ads found",
        success: false,
      });
    }
    return res.status(200).send({
      message: "All ads list ",
      CategoryCount: Ads.length,
      currentPage: page,
      totalPages: Math.ceil(totalCategory / limit),
      success: true,
      Ads,
    });
  } catch (error) {
    return res.status(500).send({
      message: `Error while getting Ads ${error}`,
      success: false,
      error,
    });
  }
};

export const AdsPaymentVerification = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  
        const homeData = await homeModel.findOne({});
        if (!homeData) {
            return res.status(500).send({ message: 'Home data not found in the database', success: false });
        }

        const { keyId, keySecret } = homeData;
        if (!keyId || !keySecret) {
            return res.status(500).send({ message: 'Razorpay keys are missing in the database', success: false });
        }


  const expectedsgnature = crypto
    .createHmac("sha256", keySecret)
    .update(body.toString())
    .digest("hex");

  const isauth = expectedsgnature === razorpay_signature;
  if (isauth) {
    // await Payment.create({
    //   razorpay_order_id,
    //   razorpay_payment_id,
    //   razorpay_signature,
    // });

      await buyPlanAdsModel.findOneAndUpdate(
      { razorpay_order_id: razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        payment: 1,
      },
      { new: true } // This option returns the updated document
    );
    console.log(
      "razorpay_order_id, razorpay_payment_id, razorpay_signature",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
 

    res.redirect(
      `${process.env.BACKWEB}all-plan-ads`
    );
  } else {
    await orderModel.findOneAndUpdate(
      { razorpay_order_id },
      {
        payment: 2,
      },
      { new: true } // This option returns the updated document
    );
 res.redirect(
      `${process.env.BACKWEB}all-plan-ads`
    );
    // res.status(400).json({ success: false });
  }
};


export const AdsUserPaymentVerification = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  
        const homeData = await homeModel.findOne({});
        if (!homeData) {
            return res.status(500).send({ message: 'Home data not found in the database', success: false });
        }

        const { keyId, keySecret } = homeData;
        if (!keyId || !keySecret) {
            return res.status(500).send({ message: 'Razorpay keys are missing in the database', success: false });
        }


  const expectedsgnature = crypto
    .createHmac("sha256", keySecret)
    .update(body.toString())
    .digest("hex");

  const isauth = expectedsgnature === razorpay_signature;
  if (isauth) {
    // await Payment.create({
    //   razorpay_order_id,
    //   razorpay_payment_id,
    //   razorpay_signature,
    // });

      await buyPlanAdsModel.findOneAndUpdate(
      { razorpay_order_id: razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        payment: 1,
      },
      { new: true } // This option returns the updated document
    );
    console.log(
      "razorpay_order_id, razorpay_payment_id, razorpay_signature",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
 

    res.redirect(
      `${process.env.LIVEWEB}account/all-ads`
    );
  } else {
    await orderModel.findOneAndUpdate(
      { razorpay_order_id },
      {
        payment: 2,
      },
      { new: true } // This option returns the updated document
    );
 res.redirect(
      `${process.env.LIVEWEB}account/all-ads`
    );
    // res.status(400).json({ success: false });
  }
};

// Function to minify HTML content manually
const minifyHTML = (html) => {
  return html
    .replace(/\n+/g, '') // Remove newlines
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space
    .replace(/>\s+</g, '><'); // Remove spaces between tags
};

export const GetWebsiteData_old = async (req, res) => {
  const Web_page = req.query.web;

  try {
    if (!Web_page) {
      return res.status(200).send('No webpage URL provided.');
    }

    // Launch browser with headless mode and optimized settings
    const browser = await puppeteer.launch({
      headless: true, // Run in headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Navigate to the page and wait until network is idle (all network requests are finished)
    await page.goto(Web_page, {
      waitUntil: 'networkidle0', timeout: 60000
    });

    // Get the HTML content after JavaScript is executed and DOM is fully loaded
    const content = await page.content();

    // // Minify the HTML content
    // const compressedContent = minifyHTML(content);

    // Close the browser after scraping
    await browser.close();

    // Return the compressed HTML content in the response
    return res.status(200).send(content);

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).send(`
      <html>
        <head>
          <title>Error</title>
        </head>
        <body>
          <h1>Error while getting data</h1>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
};



export const GetWebsiteData = async (req, res) => {
  const Web_page = req.query.web;

  try {
    if (!Web_page) {
      return res.status(200).send('No webpage URL provided.');
    }

    const browser = await puppeteer.launch({
      headless: true, // Run in headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Navigate to the page and wait for the DOM content to load
    await page.goto(Web_page, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for 2 seconds using waitForTimeout (works in Puppeteer v2.1.0 and later)
    await waitForTimeout(300);  // Wait for 2 seconds

    // Get the HTML content after JavaScript is executed
    const content = await page.content();

    // Close the browser after scraping the content
    await browser.close();

    // Return the wrapped HTML content in the response
    return res.status(200).send(content);

  } catch (error) {
    await execPromise("npx puppeteer browsers install chrome");
    console.error('Error:', error.message);
    return res.status(500).send(`
      <html>
        <head>
          <title>Error</title>
        </head>
        <body>
          <h1>Error while getting data</h1>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
};

