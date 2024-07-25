const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const isAuthenticated = require("../middleware/isAuthenticated");

router.get("/creators", isAuthenticated, productController.creators);
router.get("/about", isAuthenticated, productController.about);
router.get("/dashboard", isAuthenticated, productController.dashboard);
router.get("/sell", isAuthenticated, productController.sell);

router.get("/cart", isAuthenticated, productController.getCart);
router.post("/cart/add", isAuthenticated, productController.addToCart);
router.post("/cart/update", isAuthenticated, productController.updateCart);
router.post("/cart/delete", isAuthenticated, productController.deleteFromCart);

module.exports = router;
