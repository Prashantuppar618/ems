import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once('open', () => console.log('Connected to MongoDB Atlas'));

// Schemas
const bookingSchema = new mongoose.Schema({
  fullName: String,
  aadharNumber: String,
  phoneNumber: String,
  gender: String,
  address: String,
  age: Number,
  email: String,
  eventDate: Date,
  event: String,
  hall: String,
  BID: String,
});

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
});

const Booking = mongoose.model('Booking', bookingSchema);
const User = mongoose.model('User', userSchema);

let loggedInUserEmail = null;
let loggedInUserName = null;

// API Routes
app.get('/', (req, res) => {
  res.send('Backend API is running!');
});

app.post('/submit-form', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(200).json({ message: 'Booking registered successfully!', ok: true });
  } catch (error) {
    res.status(500).json({ message: 'Error in registration.', ok: false });
  }
});

app.post('/submit-signup', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists!' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashedPassword });
    await newUser.save();

    res.status(200).json({ message: 'Signup successful!' });
  } catch (error) {
    res.status(500).json({ message: 'Error in signup.' });
  }
});

app.post('/submit-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ message: 'Invalid email or password' });

    loggedInUserEmail = user.email;
    loggedInUserName = user.username;

    res.status(200).json({ message: 'Login successful!', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error in login.' });
  }
});

app.post('/bookings', async (req, res) => {
  try {
    const { email } = req.body;
    if (email !== loggedInUserEmail) return res.status(403).json({ message: 'Unauthorized access' });

    const userBookings = await Booking.find({ email });
    res.status(userBookings.length ? 200 : 404).json(userBookings.length ? userBookings : { message: 'No bookings found' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings.' });
  }
});

app.get('/is-logged-in', (req, res) => {
  res.status(200).json({ loggedIn: !!loggedInUserEmail });
});

app.post('/logout', (req, res) => {
  loggedInUserEmail = null;
  loggedInUserName = null;
  res.status(200).json({ message: 'Logged out successfully!' });
});

// Serve React build (client/build)
const buildPath = path.join(__dirname, '../frontend/emsys/src');
app.use(express.static(buildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
