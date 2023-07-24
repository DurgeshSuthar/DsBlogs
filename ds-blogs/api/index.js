const express = require('express');
const cors = require('cors');
const User = require('./models/User');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = 'ufzeruwjgwiu56g';
const cookieParser = require('cookie-parser');
const multer = require('multer');
const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage });
const Post = require('./models/Post');
const fs = require('fs');
require("dotenv").config();
const cloudinary = require('cloudinary').v2;
const app = express();

const salt = bcrypt.genSaltSync(10);
app.use(cors({ credentials: true, origin: 'https://ds-blogs-livid.vercel.app' }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
mongoose.connect(process.env.MONGO_URI);
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
  });

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
        });
        jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token).json({
                id: userDoc._id,
                username,
            });
        });
    }
    catch (e) {
        console.log(e);
        res.status(400).json(e);
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    try {
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            //logged in
            const options={
                httpOnly:true,
                secure: true,
                sameSite:'None',
            };  
            jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token, options).json({
                    id: userDoc._id,
                    username,
                    token,
                });
            });
        }
        else {
            res.status(400).json('Wrong credentials');
        }
    }
    catch(err){
        res.status(400).json('Wrong credentials');
    }
})

app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) throw err;
        res.json(info);
    });
});

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
})

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const { token } = req.cookies;
    if (!token) return res.status(401).json("Authentication Failed! Please login to create post.");
    else {
        try{
            const result = await cloudinary.uploader.upload(dataURI);
            jwt.verify(token, secret, {}, async (err, info) => {
                if (err) throw err;
                const { title, summary, content } = req.body;
                const postDoc = await Post.create({
                    title,
                    summary,
                    content,
                    cover: result.secure_url,
                    author: info.id,
                });
                res.json(postDoc);
            });
        }
        catch(err){
            console.log(err);
            res.status(401).json('Unable to upload image, Please try again!');
        }
    }
});

app.get('/post', async (req, res) => {
    res.json(await Post.find().populate('author', ['username']).sort({ createdAt: -1 }).limit(30));
})

app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
})

app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ error: 'Authentication failed. Please log in to edit a post.' });
    else {
        try{
            const result = await cloudinary.uploader.upload(dataURI);
            jwt.verify(token, secret, {}, async (err, info) => {
                if (err) throw err;
                const { title, summary, content, id } = req.body;
                const postDoc = await Post.findById(id);
                const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
                if (!isAuthor) {
                    return res.status(400).json('you are not the author');
                }
                await postDoc.updateOne({
                    title,
                    summary,
                    content,
                    cover: result.secure_url,
                });
                res.json(postDoc);
            });
        }
        catch(err){
            res.status(400).json('Unable to edit the post');
        }
        
    }
})

app.listen(4000);
