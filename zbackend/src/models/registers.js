const mongooese = require("mongoose");
const bcrypt = require("bcryptjs");

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

userSchema.pre("save", async function(next){

    if(this.isModified("password")){
        console.log(`the current password is ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10);
        console.log(`the current password is ${this.password}`);

        // removing Confirm password field from userSchema table
        this.confirmpassword = undefined;
    }
    next();
    
} )


// Creating Collection
const Register = new mongooese.model("Register", userSchema);

module.exports = Register;