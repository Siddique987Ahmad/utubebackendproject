
import app from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
    path:'./env'
})



connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`SERVER IS RUNNING ON ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("Connection failed",err);
})



// import express  from "express";

// const app=express();
// (async()=>{

//     try {

//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("error",error);
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{

//         console.log(`App is running on ${process.env.PORT} `);

//         })
        
//     } catch (error) {
//         console.error("Error",error)
//     }

// })()