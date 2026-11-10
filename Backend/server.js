import 'dotenv/config';
import app from "./src/app.js";
import connectDB from './src/db/db.js';
import {createServer} from 'node:http';
import { Server } from "socket.io";
import * as cookie from "cookie";
import jwt from 'jsonwebtoken'
import User from './src/models/User.js';
import setupQuizSockets from './src/sockets/quizSocket.js';




connectDB();

const httpServer=createServer(app);

const io=new Server(httpServer,{
    cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

io.use(async(socket,next)=>{
const cookieHeader = socket.request.headers.cookie;
if(!cookieHeader){
  const error = new Error("Authentication required");
   return next(error);
}
const cookies = cookie.parse(cookieHeader);
const token = cookies.token;
if(!token){
    return next(new Error("Authentication required"))
}
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
   
    const user = await User.findById(decoded.id).select('-password')
           if(!user){
               return next(new Error("User not found"))
           }

           socket.user=user;
           next();
})

setupQuizSockets(io);

httpServer.listen(3000,()=>{
    console.log("server is running on port 3000");
})