const mongooese = require("mongoose");

// Schema
const userSchema = new mongooese.Schema({
    firstname: {
        type: String,
        require:true
    },
    lastname: {
        type: String,
        require:true
    },
    emailid: {
        type: String,
        require:true,
        unique:true
    },
    password: {
        type: String,
        require:true
    },
    confirmpassword: {
        type: String,
        require:true
    },
})

// Creating Collection
const Register = new mongooese.model("Register", userSchema);

module.exports = Register;