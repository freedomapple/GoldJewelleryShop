const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/jewellerydb', { useNameUrlParser: true, useCreateIndex: true, });
var con = mongoose.Collection;
var userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    email: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    uname: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    pass: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }

});

var userModel = mongoose.model('users', userSchema);
module.exports = userModel;
