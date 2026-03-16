const express = require('express')
require('dotenv').config()
const http = require('http');
const { initSocket } = require('./utils/socket');
const authRoutes=require('./routes/auth.routes')
const listingRoutes=require('./routes/listing.routes')
const DBconnect=require('./config/database')
const app=express();
const server = http.createServer(app);
initSocket(server);
app.use(express.json());
const cors = require("cors");
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const forumRoutes = require('./routes/forum.routes');
const jobRoutes = require('./routes/job.routes');
const path = require("path");

const searchRoutes = require('./routes/search.routes');
const marketRoutes = require('./routes/market.routes');
const newsRoutes = require('./routes/news.routes');

app.use(express.urlencoded({extended:true}))

const port=process.env.PORT || 3000


app.get('/',(req,res)=>{
    res.send('hi,running')
})

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


app.use("/api/auth", authRoutes)
app.use("/api/listings",listingRoutes)
app.use('/api/booking', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/forum', forumRoutes);
app.use(
  "/api/uploads",
  express.static(path.join(__dirname, "uploads"))
);
app.use('/api/jobs', jobRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/news", newsRoutes);



DBconnect()
.then(()=>{
server.listen(port,()=>{
console.log(`http://localhost:${port}`)

})
 
})
.catch((err)=>{
    console.error('Server startup failed:', err.message)

})
