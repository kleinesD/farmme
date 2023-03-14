const mongoose = require('mongoose');

const clientScheme = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phoneNumberCode: String,
    phoneNumber: String,
    adress: String,
    photo: String,
    creationDate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    pricePer: Number,
    unit: String,
    productType: ['milk', 'meat']
});

const Client = mongoose.model('Client', clientScheme);
module.exports = Client;