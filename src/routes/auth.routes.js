// all authentication routes will be defined here

const express = require("express")
const router=express.Router()
const authController = require("../controllers/auth.controller")

router.post("/register", authController.registerController)

router.post("/login", authController.loginController)

module.exports = router