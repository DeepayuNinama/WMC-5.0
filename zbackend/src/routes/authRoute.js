const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");
const isAuthenticated = require("../middleware/isAuthenticated");
const isAdmin = require("../middleware/adminCheck");

// Define routes
router.get("/", authController.index);
router.get("/login", authController.renderLoginForm);
router.post("/login",
    passport.authenticate("local", { failureRedirect: '/login' }),
    authController.login
);
router.get("/register", authController.renderRegisterForm);
router.post("/register", authController.register);
router.get("/logout", authController.logout);

router.get("/profile", isAuthenticated, authController.renderProfile);
router.post("/profile/update", isAuthenticated, authController.updateProfile);

module.exports = router;
