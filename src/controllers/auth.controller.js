const userModel = require("../models/user.model.js")
const jwt = require("jsonwebtoken")

/**
 * 
 * POST /api/auth/register
 * @description This controller handles user registration. It receives user data from the request body, validates it, hashes the password, and saves the new user to the database. If successful, it returns a success message; otherwise, it returns an error message.
 */

async function registerController(req, res){
    const {email, name, password} = req.body

    const isExist = await userModel.findOne({email: email})
    if(isExist){
        return res.status(422).json({
            message:"Email already exists",
            status:"failed"
        })
    }


    const user = await userModel.create({
        email, password, name
    })

    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:"1d"})

    res.cookie("token", token)

    return res.status(201).json({
        message:"User registered successfully",
        status:"success",
        data:{
            user:{
                id:user._id,
                email:user.email,
                name:user.name
            }
        }
    })
}

async function loginController(req, res){
    const {email, password} = req.body

    const user = await userModel.findOne({email})

    if(!user){
        return res.status(401).json({
            message : "Email or password is invalid"
        })
    }

    const isValidPassword = await user.comparePassword(password)

    if(!isValidPassword){
        return res.status(401).json({
            message : "Email or password is invalid"
        })
    }

    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:"1d"})

    res.cookie("token", token)

    return res.status(200).json({
        message:"User logged in successfully",
        status:"success",
        data:{
            user:{
                id:user._id,
                email:user.email,
                name:user.name
            }
        }
    })
}

    


module.exports = {
    registerController,
    loginController
}