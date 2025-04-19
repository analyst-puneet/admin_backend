const express = require('express');
const connectDB = require('./config/database'); 
const cors = require("cors");
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const masterRoutes = require('./routes/MasterRoutes');
const leaveGroupMastRoutes = require('./routes/leaveGroupMast'); 
connectDB();

const app = express();
app.use(cookieParser());
app.use(express.json());
const allowedOrigins = [
  'https://admin-edu-assist.vercel.app',
  'http://localhost:3000' // dev
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use('/api/auth', authRoutes);
app.use('/api/master', masterRoutes);
const PORT = process.env.PORT || 5000;
app.use('/api/leave_group', leaveGroupMastRoutes);
app.get('/', (req, res) => {
    res.send('Welcome to Node.js and MongoDB backend');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
