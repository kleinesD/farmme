const mongoose = require('mongoose');

const clientScheme = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phoneNumberCode: String,
    phoneNumber: String,
    email: String,
    adress: String,
    photo: String,
    creationDate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    products: [
        {
            productName: String,
            pricePer: Number,
            unit: String
        }
    ],
    note: String,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    farm: {
        type: mongoose.Schema.ObjectId,
        ref: 'Farm'
    },
    editedAtBy: [
        {
            date: Date,
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }

        }
    ]
});

const Client = mongoose.model('Client', clientScheme);
module.exports = Client;