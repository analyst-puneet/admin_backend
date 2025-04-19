const express = require('express');
const connectDB = require('./config/database'); 
const cors = require("cors");
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const masterRoutes = require('./routes/masterRoutes');
const leaveGroupMastRoutes = require('./routes/leaveGroupMast'); 
connectDB();

const app = express();
app.use(cookieParser());
app.use(express.json());

const corsOption = {
    origin: ['http://localhost:5173',
            'https://admin-edu-assist.vercel.app/'
    ],
    credentials: true,
};
app.use(cors(corsOption));
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