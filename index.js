const express = require('express');
const connectDB = require('./config/database'); 
const cors = require("cors");
const cookieParser = require('cookie-parser');
connectDB();

const app = express();
app.use(cookieParser());
app.use(express.json());
const authRoutes = require('./routes/auth');
const corsOption = {
    origin: ['http://localhost:5173'],
    credentials: true,
};
app.use(cors(corsOption));
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
    res.send('Welcome to Node.js and MongoDB backend');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});