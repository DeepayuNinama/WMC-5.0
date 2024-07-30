const Product = require("../models/Product");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const paypal = require('paypal-rest-sdk');

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
        const products = await Product.find({ adminApproved: false }).populate('seller');
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

exports.rejectProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).send("Product not found");
        }
        res.redirect("/admindashboard");
    } catch (error) {
        res.status(500).send("Error rejecting product");
    }
}

exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'cart',
            populate: {
                path: 'items.productId',
                model: 'Product'
            }
        });
        
        const cart = user && user.cart ? user.cart : { items: [] };
        res.render("cart", { cart, isEmpty: cart.items.length === 0 });
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

        res.redirect("/dashboard");
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

exports.pay = async (req, res) => {
    const user = await User.findById(req.user._id).populate({
        path: 'cart',
        populate: {
            path: 'items.productId',
            model: 'Product'
        }
    });

    if (!user || !user.cart || user.cart.items.length === 0) {
        return res.redirect('/cart');
    }

    const items = user.cart.items.map(item => ({
        name: item.productId.title,
        sku: item.productId._id.toString(),
        price: item.productId.price.toFixed(2),
        currency: 'USD',
        quantity: item.quantity
    }));

    const total = user.cart.items.reduce((acc, item) => acc + item.productId.price * item.quantity, 0).toFixed(2);

    req.session.total = total;

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal",
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/payment/success",
            "cancel_url": "http://localhost:3000/payment/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": items
            },
            "amount": {
                "currency": "USD",
                "total": total
            },
            "description": "This is the payment description."
        }]
    };

    paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
            console.log(error);
            res.status(500).send(error);
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
};

exports.paymentSuccess = async (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": req.session.total 
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
        if (error) {
            console.log(error.response);
            res.status(500).send(error);
        } else {
            const user = await User.findById(req.user._id).populate({
                path: 'cart',
                populate: {
                    path: 'items.productId',
                    model: 'Product'
                }
            });

            const orderItems = user.cart.items.map(item => ({
                productId: item.productId._id,
                title: item.productId.title,
                price: item.productId.price,
                quantity: item.quantity
            }));

            const order = new Order({
                user: user._id,
                items: orderItems,
                total: req.session.total,
                status: 'completed'
            });

            await order.save();

            user.cart.items = [];
            await user.cart.save();
            await user.save();

            res.render('success', { payment, order });
        }
    });
};

exports.paymentCancel = (req, res) => {
    res.render('cancel');
};