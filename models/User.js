//create user model
var mongoose = require('mongoose');
const initialHtml = require('../resouces');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    branch:{
        type: String,
        required: true
    },
    year:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone:{
        type: String,
    },
    instagram: {
        type: String,
    },
    shareInstagram: {
        type: Boolean,
        default: false
    },
    html: {
        type: String,
        default: initialHtml
    },
    modifiedCount: {
        type: Number,
        default: 0
    }}
    );

module.exports = mongoose.model('User', UserSchema);
