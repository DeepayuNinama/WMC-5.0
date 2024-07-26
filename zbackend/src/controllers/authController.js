const User = require("../models/User");
const Cart = require("../models/Cart");

exports.index = (req, res) => {
    res.render("index");
};

exports.renderLoginForm = (req, res) => {
    res.render("login");
};

exports.renderRegisterForm = (req, res) => {
    res.render("register");
};

exports.login = (req, res) => {
    res.redirect("dashboard"); 
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
        res.send("Passwords do not match");
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
