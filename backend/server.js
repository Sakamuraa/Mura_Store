import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import stripeLib from 'stripe';

import User from './models/User.js';
import Profile from './models/Profile.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: 'uploads/' });
/* const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); 
    // ✅ NAMANYA SEKARANG = waktu + nama asli
    // kalau mau persis sama tanpa timestamp ganti ke cb(null, file.originalname)
  }
});

const upload = multer({ storage }); */


const PORT = process.env.PORT || 4242;
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lynk_personal';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const stripe = stripeLib(process.env.STRIPE_SECRET_KEY || '');

mongoose.connect(MONGO).then(()=>console.log('Mongo connected')).catch(e=>console.error(e));

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function genToken(user){ return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' }); }
async function authMiddleware(req,res,next){
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({ error:'No token' });
  const token = h.split(' ')[1];
  try{
    const p = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(p.id);
    next();
  }catch(e){ return res.status(401).json({ error:'Invalid token' }); }
}

app.post('/auth/register', async (req,res)=>{
  const { email, password } = req.body;
  if(!email||!password) return res.status(400).json({ error:'Missing' });
  const ex = await User.findOne({ email });
  if(ex) return res.status(400).json({ error:'User exists' });
  const hash = await bcrypt.hash(password,10);
  const user = await User.create({ email, passwordHash: hash });
  res.json({ token: genToken(user) });
});

app.post('/auth/login', async (req,res)=>{
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.status(400).json({ error:'Invalid' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if(!ok) return res.status(400).json({ error:'Invalid' });
  res.json({ token: genToken(user) });
});

app.post('/auth/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ error: 'Missing fields' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const hash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = hash;
  await user.save();

  res.json({ success: true, message: "Password updated ✅" });
});


app.post('/upload', authMiddleware, upload.single('file'), (req,res)=>{
  const tmp = req.file;
  if(!tmp) return res.status(400).json({ error:'No file' });
  const ext = path.extname(tmp.originalname) || '';
  const target = path.join(process.cwd(), 'uploads', tmp.filename + ext);
  fs.renameSync(tmp.path, target);
  res.json({ url: `/uploads/${path.basename(target)}` });
});
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.post('/profiles', authMiddleware, async (req,res)=>{
  const body = req.body;
  if(!body.username) return res.status(400).json({ error:'username required' });
  const exists = await Profile.findOne({ username: body.username });
  if(exists && String(exists.owner)!==String(req.user._id)) return res.status(400).json({ error:'username taken' });
  let profile = await Profile.findOne({ owner: req.user._id });
  if(!profile){
    profile = await Profile.create({ ...body, owner: req.user._id });
  } else {
    Object.assign(profile, body);
    await profile.save();
  }
  res.json(profile);
});

app.get('/profiles/:username', async (req,res)=>{
  const profile = await Profile.findOne({ username: req.params.username }).lean();
  if(!profile) return res.status(404).json({ error:'not found' });
  res.json(profile);
});

app.put('/profiles/:username', authMiddleware, async (req, res) => {
  const profile = await Profile.findOne({ username: req.params.username });
  if (!profile) return res.status(404).json({ error: 'not found' });
  if (!profile.owner.equals(req.user._id)) return res.status(403).json({ error: 'not owner' });

  if (req.body.items) {
    profile.items = req.body.items; // ✅ Replace array items full
  }

  if (req.body.displayName !== undefined) profile.displayName = req.body.displayName;
  if (req.body.bio !== undefined) profile.bio = req.body.bio;
  if (req.body.links !== undefined) profile.links = req.body.links;

  await profile.save();
  res.json(profile);
});


app.get('/me/profile', authMiddleware, async (req,res)=>{
  const profile = await Profile.findOne({ owner: req.user._id });
  res.json(profile || {});
});

app.post('/create-checkout', async (req,res)=>{
  const { creator, itemId } = req.body;
  const profile = await Profile.findOne({ username: creator });
  if(!profile) return res.status(404).json({ error:'creator not found' });
  const item = profile.items.id(itemId) || profile.items.find(i=>String(i._id)===String(itemId));
  if(!item) return res.status(404).json({ error:'item not found' });
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'idr',
        product_data: { name: item.title, description: item.description || '' },
        unit_amount: Math.round(item.price)
      },
      quantity: 1
    }],
    mode: 'payment',
    success_url: (process.env.CLIENT_URL || 'http://localhost:5173') + '/success',
    cancel_url: (process.env.CLIENT_URL || 'http://localhost:5173') + '/' + creator,
    metadata: { creator, itemId: String(item._id) }
  });
  res.json({ url: session.url });
});

app.use(express.static(path.join(process.cwd(), '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), '../frontend/dist/index.html'));
});

app.listen(PORT, ()=>console.log('Server running on', PORT));
