import 'dotenv/config';
import app from "./src/app.js";
import connectDB from './src/db/db.js';
import { createServer } from 'node:http';
import { Server } from "socket.io";
import jwt from 'jsonwebtoken';
import User from './src/models/User.js';
import setupQuizSockets from './src/sockets/quizSocket.js';

const parseCookies = (header = "") =>
    Object.fromEntries(
        header.split(";").map((part) => {
            const i = part.indexOf("=");
            if (i < 0) return [part.trim(), ""];
            return [
                part.slice(0, i).trim(),
                decodeURIComponent(part.slice(i + 1).trim()),
            ];
        })
    );

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true
    }
});

io.use(async (socket, next) => {
    try {
        const cookieHeader = socket.request.headers.cookie;

        if (!cookieHeader) {
            return next(new Error("Authentication required"));
        }

        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        if (!token) {
            return next(new Error("Authentication required"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return next(new Error("User not found"));
        }

        socket.user = user;
        next();

    } catch (error) {
        console.error("Socket auth error:", error.name, error.message);
        next(new Error("Authentication failed"));
    }
});

setupQuizSockets(io);

const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 3000;

        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();