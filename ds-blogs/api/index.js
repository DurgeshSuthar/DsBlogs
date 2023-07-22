const express = require('express');
const cors = require('cors');
const User = require('./models/User');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = 'ufzeruwjgwiu56g';
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const Post = require('./models/Post');
const fs = require('fs');

const app = express();

const salt = bcrypt.genSaltSync(10);
app.use(cors({ credentials: true, origin: 'https://ds-blogs.vercel.app' }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
mongoose.connect('mongodb+srv://captain:jacksparrow@cluster0.trorbhp.mongodb.net/?retryWrites=true&w=majority');

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
            jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token).json({
                    id: userDoc._id,
                    username,
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
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ error: 'Authentication failed. Please log in to create a post.' });
    else {
        fs.renameSync(path, newPath);
        jwt.verify(token, secret, {}, async (err, info) => {
            if (err) throw err;
            const { title, summary, content } = req.body;
            const postDoc = await Post.create({
                title,
                summary,
                content,
                cover: newPath,
                author: info.id,
            });
            res.json(postDoc);
        });
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
    let newPath = null;
    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
    }
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ error: 'Authentication failed. Please log in to edit a post.' });
    else {
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
                cover: newPath ? newPath : postDoc.cover,
            });

            res.json(postDoc);
        });
    }
})
// mongodb+srv://captain:jacksparrow@cluster0.trorbhp.mongodb.net/?retryWrites=true&w=majority
app.listen(4000);
