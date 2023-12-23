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
            message: String,
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }

        }
    ]
});

/* clientScheme.virtual('sales', {
  ref: 'Product',
  foreignField: 'client',
  localField: '_id'
}); */

const Client = mongoose.model('Client', clientScheme);
module.exports = Client;