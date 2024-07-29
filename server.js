const express = require('express');
const colors = require("colors");
const dotenv = require('dotenv');
const cors = require("cors");
const connectToDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const donationRoutes = require("./routes/donation.routes");
const requestRoutes = require("./routes/request.routes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const http = require('http');
const socketIo = require('socket.io');
const Message = require('./models/Message');


dotenv.config();
connectToDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json()); 

// response on / route
app.get("/", (req, res) => {
  res.send("API is running successfully");
});

// routes
app.use(cors());
app.use("/api/users", userRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/requests", requestRoutes);

// middlewares
app.use(notFound);
app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('sendMessage', async (data) => {
    const { senderId, receiverId, content } = data;
    const message = new Message({ sender: senderId, receiver: receiverId, content });
    await message.save();
    console.log('Message saved:', message); // Log saved message
    io.emit('newMessage', message);
    console.log('Message emitted:', message); // Log emitted message
  });
  

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.yellow.bold);
});
