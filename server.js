const express = require('express');
const colors = require('colors');
const dotenv = require('dotenv');
const cors = require('cors');
const connectToDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const donationRoutes = require('./routes/donation.routes');
const requestRoutes = require('./routes/request.routes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const http = require('http');
const socketIo = require('socket.io');
const Message = require('./models/Message');

dotenv.config();
connectToDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);

// Middlewares
app.use(notFound);
app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinChat', async ({ userId, donationId }) => {
    if (!userId || !donationId) {
      console.error('Missing userId or donationId:', { userId, donationId });
      return;
    }

    console.log('User joined chat:', { userId, donationId });

    // Fetch chat history
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: donationId },
        { sender: donationId, receiver: userId }
      ]
    }).sort({ createdAt: -1 });
    
    socket.emit('chatHistory', messages);
  });

  socket.on('sendMessage', async (data) => {
    const { senderId, receiverId, content } = data;

    if (!senderId || !receiverId || !content) {
      console.error('Invalid message data:', data);
      return;
    }

    console.log('Received message:', data);

    const message = new Message({ sender: senderId, receiver: receiverId, content });
    await message.save();
    io.emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.yellow.bold);
});
