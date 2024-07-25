const Product = require("../models/Product");
const User = require("../models/User");
const Cart = require("../models/Cart");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.creators = (req, res) => {
    res.render("creators");
};

exports.about = (req, res) => {
    res.render("about");
};

exports.sell = (req, res) => {
    res.render("sell");
};

exports.sellProduct = async (req, res) => {
    try {
        const { title, description, type, price, date } = req.body;
        const imageurl = req.file ? req.file.filename : 'default.jpg'; // Use filename here
        const product = new Product({
            title,
            description,
            type,
            price,
            imageurl,
            seller: req.user._id,
            date
        });
        await product.save();
        res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

exports.dashboard = async (req, res) => {
    try {
        const products = await Product.find({ adminApproved: true });
        const user = await User.findById(req.user._id).populate({
            path: 'cart',
            populate: {
                path: 'items.productId',
                model: 'Product'
            }
        });

        if (!user || !user.cart) {
            return res.render("cart", { cart: { items: [] } });
        }

        res.render("dashboard", { products, cart: user.cart });
    } catch (error) {
        res.status(500).send("Error retrieving products");
    }
};

exports.admindashboard = async (req, res) => {
    try {
        const products = await Product.find({ adminApproved: false });
        res.render("admindashboard", { products });
    } catch (error) {
        res.status(500).send("Error retrieving products");
    }
}

exports.approveProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).send("Product not found");
        }
        product.adminApproved = true;
        await product.save();
        res.redirect("/admindashboard");
    } catch (error) {
        res.status(500).send("Error approving product");
    }
};

exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'cart',
            populate: {
                path: 'items.productId',
                model: 'Product'
            }
        });

        if (!user || !user.cart) {
            return res.render("cart", { cart: { items: [] } });
        }

        res.render("cart", { cart: user.cart });
    } catch (error) {
        console.error(error); 
        res.status(500).send("Error retrieving cart");
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const user = await User.findById(req.user._id).populate('cart');

        if (!user.cart) {
            user.cart = new Cart();
        }

        const existingItem = user.cart.items.find(item => item.productId.equals(productId));

        if (existingItem) {
            existingItem.quantity += parseInt(quantity, 10);
        } else {
            user.cart.items.push({ productId, quantity: parseInt(quantity, 10) });
        }

        await user.cart.save();
        await user.save();

        res.render("cart", { cart: user.cart });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error adding item to cart");
    }
};

exports.updateCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const user = await User.findById(req.user._id).populate({
            path: 'cart',
            populate: {
                path: 'items.productId',
                model: 'Product'
            }
        });

        if (!user || !user.cart) {
            return res.status(404).send("User or cart not found");
        }

        let itemToUpdate = null;

        user.cart.items.forEach(item => {
            if (item.productId._id.toString() === productId) {
                itemToUpdate = item;
            }
        });

        if (itemToUpdate) {
            itemToUpdate.quantity = parseInt(quantity, 10);
            await user.cart.save();
            await user.save();
            res.redirect('/dashboard');
        } else {
            res.status(404).send("Cart item not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating cart item");
    }
};


exports.deleteFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id).populate({
            path: 'cart',
            populate: {
                path: 'items.productId',
                model: 'Product'
            }
        });

        if (!user || !user.cart) {
            return res.status(404).send("User or cart not found");
        }

        let itemFound = false;

        user.cart.items.forEach(item => {
            console.log(`Product ID: ${item.productId._id}, Title: ${item.productId.title}, Quantity: ${item.quantity}`);
            if (item.productId._id.toString() === productId) {
                itemFound = true;
            }
        });

        if (itemFound) {
            user.cart.items = user.cart.items.filter(item => item.productId._id.toString() !== productId);
            await user.cart.save();
            await user.save();
            res.redirect('/dashboard');
        } else {
            res.status(404).send("Cart item not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error removing item from cart");
    }
};