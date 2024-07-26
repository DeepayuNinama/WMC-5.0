const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const isAuthenticated = require("../middleware/isAuthenticated");
const upload = require("../middleware/upload");

router.get("/creators",  productController.creators);
router.get("/about",  productController.about);
router.get("/dashboard", isAuthenticated, productController.dashboard);
router.get("/sell", isAuthenticated, productController.sell);
router.post("/sell", isAuthenticated, upload, productController.sellProduct);
router.get("/admindashboard", isAuthenticated, productController.admindashboard);
router.post("/admindashboard/:id", isAuthenticated, productController.approveProduct);

router.get("/cart", isAuthenticated, productController.getCart);
router.post("/cart/add", isAuthenticated, productController.addToCart);
router.post("/cart/update", isAuthenticated, productController.updateCart);
router.post("/cart/delete", isAuthenticated, productController.deleteFromCart);

module.exports = router;
