const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true, "Email is required"],
        trim:true,
        lowercase:true,
        unique:[true, "Email already exists"],
        match:[/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
    },
    name:{
        type:String,
        required:[true, "Name is required"],
    },
    password:{
        type:String,
        required:[true, "Password is required"],
        minlength:[6, "Password must be at least 6 characters long"],
        validate:{
            validator:function(value){
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(value)
            },
            message:"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        }
    }
},{
    timestamps:true
})

userSchema.pre("save", async function(){
    if(!this.isModified("password")){
        return
    }
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash
    return
}
)

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

const userModel = mongoose.model("user", userSchema)

module.exports = userModel