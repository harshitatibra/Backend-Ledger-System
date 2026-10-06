const mongoose = require("mongoose")

function connectToDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Server is conncted to DB")
    })
    .catch(err =>{
        console.log("Error connecting to db", err)
        process.exit(1)
    })
}

module.exports=connectToDB