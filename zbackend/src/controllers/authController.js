const User = require("../models/User");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

exports.index = (req, res) => {
    res.render("index");
};

exports.renderLoginForm = (req, res) => {
    res.render("login");
};

exports.renderRegisterForm = (req, res) => {
    res.render("register");
};

exports.login = async(req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send("User not found");
        }

        //Change to required admin emailid
        if(user.emailid === "adminmafia" || user.emailid === "adminmafia1"){
            res.redirect("admindashboard");
        }
        else{
            res.redirect("dashboard"); 
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.register = async (req, res) => {
    const { firstname, lastname, emailid, password, confirmpassword } = req.body;

    if (password === confirmpassword) {
        try {

            const cart = new Cart({ items: [] });
            await cart.save();

            const registerUser = new User({
                firstname,
                lastname,
                emailid,
                password,
                cart: cart._id
            });

            await registerUser.save();
            req.login(registerUser, (err) => {
                if (err) return res.status(500).send(err.message);
                res.redirect("/dashboard");
            });
        } catch (error) {
            res.status(400).send(error.message);
        }
    } else {
        res.status(400).send("Passwords do not match");
    }
};

exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
};

exports.renderProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'cart',
            populate: {
                path: 'items.productId',
                model: 'Product'
            }
        });
        const orders = await Order.find({ user: req.user._id });
        console.log(orders);
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.render("profile", { user, cart: user.cart, orders });
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { firstname, lastname, emailid } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send("User not found");
        }
        
        user.firstname = firstname;
        user.lastname = lastname;
        user.emailid = emailid;
        
        if (req.body.password) {
            user.password = req.body.password;  
        }
        
        await user.save();
        res.redirect("/profile");
    } catch (error) {
        res.status(400).send(error.message);
    }
};
