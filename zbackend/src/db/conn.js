const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/UserData", {

}).then(() => {
    console.log(`Connection Succesful`);
}).catch((e) => {
    console.log(`No Connection`);
})