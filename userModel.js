// userModel.js
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email: { type: String },
    password: { type: String }
});

const User = mongoose.model('usercred', userSchema);
module.exports = User;