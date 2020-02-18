const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/jewellerydb', { useNameUrlParser: true, useCreateIndex: true, });
var con = mongoose.Collection;
var adminSchema = new mongoose.Schema({
    aname: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    aemail: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    admin: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    apass: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }

});

var adminModel = mongoose.model('admins', adminSchema);
module.exports = adminModel;
