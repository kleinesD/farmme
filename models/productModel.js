const mongoose = require('mongoose');

const productScheme = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['milk', 'meat']
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
    creationDate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    distributionResult: {
        type: String,
        required: true,
        enum: ['sold', 'personal-use', 'processed', 'calf-feeding']
    },
    calf: {
        type: mongoose.Schema.ObjectId,
        ref: 'Animal'
    },
});

const Product = mongoose.model('Product', productScheme);
module.exports = Product;