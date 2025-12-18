import mongoose from "mongoose";

const callSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model for the sender
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model for the receiver
        required: true,
    },
 
    start: {
        type: Date,
        default: Date.now,
    },
    end: {
        type: Date,
     },
    status: {
        type: String,
        enum: ['completed', 'missed'], // You can define statuses based on your need
        default: 'missed',
    },
    active: {
        type: Number,
        default: 1,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
},
{ timestamps: true });

const callModel = mongoose.model('Call', callSchema); // Changed 'Message' to 'Call'

export default callModel;
