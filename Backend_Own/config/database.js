const mongoose=require('mongoose')
require('dotenv').config()

const MONGO_URL=process.env.MONGO_URL
async function DBconnect(){
try{
await mongoose.connect(MONGO_URL,{
    autoIndex:true,
})
console.log('mongodb connection success')
}
catch(err){
console.log("mongodb connection failed")
console.error(err.message)
}
}


module.exports=DBconnect