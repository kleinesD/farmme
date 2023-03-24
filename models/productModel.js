const mongoose = require('mongoose');

const productScheme = new mongoose.Schema({
    rawProduct: {
        type: String,
        required: true,
        enum: ['milk', 'meat']
    },
    size: {
        type: Number
    },
    price: {
        type: Number
    },
    pricePer: {
        type: Number
    },
    unit: {
        type: String
    },
    buyer: {
        type: mongoose.Schema.ObjectId,
        ref: 'Client'
    },
    finalProduct: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product'
    },
    date: {
        type: Date,
        required: true
    },
    expDate: {
        type: Date
    },
    creationDate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    distributionResult: {
        type: String,
        required: true,
        enum: ['waiting', 'sold', 'personal-use', 'processed', 'calf-feeding'],
        default: 'waiting'
    },
    calf: {
        type: mongoose.Schema.ObjectId,
        ref: 'Animal'
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    note: String
});

const Product = mongoose.model('Product', productScheme);
module.exports = Product;