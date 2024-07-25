const Product = require("../models/Product");
const User = require("../models/User");

exports.creators = (req, res) => {
    res.render("creators");
};

exports.about = (req, res) => {
    res.render("about");
};

exports.sell = (req, res) => {
    res.render("sell");
};

exports.dashboard = async (req, res) => {
    try {
        const products = await Product.find({});
        res.render("dashboard", { products });
    } catch (error) {
        res.status(500).send("Error retrieving products");
    }
};

exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("cart.items.productId");
        res.status(200).json({ cart: user.cart });
    } catch (error) {
        res.status(500).send("Error retrieving cart");
    }
}

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const user = await User.findById(req.user._id);

        const existingItem = user.cart.items.find(item => item.productId.equals(productId));

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            user.cart.items.push({ productId, quantity });
        }

        await user.save();
        res.status(200).json({ message: "Item added to cart successfully" });
    } catch (error) {
        res.status(500).send("Error adding item to cart");
    }
};

exports.updateCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const user = await User.findById(req.user._id);

        const item = user.cart.items.find(item => item.productId.equals(productId));
        if (item) {
            item.quantity = quantity;
            await user.save();
            res.status(200).json({ message: "Cart item updated successfully" });
        } else {
            res.status(404).send("Cart item not found");
        }
    } catch (error) {
        res.status(500).send("Error updating cart item");
    }
};

exports.deleteFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);

        user.cart.items = user.cart.items.filter(item => !item.productId.equals(productId));
        await user.save();
        res.status(200).json({ message: "Item removed from cart successfully" });
    } catch (error) {
        res.status(500).send("Error removing item from cart");
    }
};
