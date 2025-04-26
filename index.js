const express = require('express');
const connectDB = require('./config/database'); 
const cors = require("cors");
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const masterRoutes = require('./routes/MasterRoutes');
const leaveGroupMastRoutes = require('./routes/leaveGroupMast'); 
const userDetailsRoutes = require('./routes/UserDetailsRoutes');
// const {validate_request} = require('./controllers/common/validate_request');
const {checkUserToken, authenticate} = require('./middleware/Authenticate_User');

connectDB();


const app = express();
app.use(cookieParser());
app.use(express.json());
const allowedOrigins = [
  'https://admin-edu-assist.vercel.app',
  'http://localhost:5173' // dev
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
app.use('/api/master',{authenticate,checkUserToken},masterRoutes);
app.use('/api/user_details',{authenticate,checkUserToken},userDetailsRoutes);
app.use('/api/leave_group', leaveGroupMastRoutes);
const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
    res.send('Welcome to Node.js and MongoDB backend');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
