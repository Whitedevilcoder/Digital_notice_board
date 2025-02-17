const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API frontends)
app.use(express.json());
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'frontend/public' directory
app.use('/public', express.static(path.join(__dirname, '../frontend/public')));
// app.use('/src', express.static(path.join(__dirname, '../frontend/src')));
app.use('/css', express.static(path.join(__dirname, '../frontend/public/css')));
app.use('/img', express.static(path.join(__dirname, '../frontend/public/img')));
app.use('/js', express.static(path.join(__dirname, '../frontend/public/js')));

mongoose.connect('mongodb://localhost:27017/noticeboard', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB connected");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

const noticeSchema = new mongoose.Schema({
    title: String,
    content: String,
    category: String,
    author: String,
    createdAt: { type: Date, default: Date.now }
});

const Notice = mongoose.model('Notice', noticeSchema);

app.get('/', async (req, res) => {
    const category = req.query.category || null; 
    console.log("Category selected:", category);  // Log category to debug
    let notices = [];

    if (category) {
        notices = await Notice.find({ category });
    } else {
        notices = await Notice.find();
    }

    res.render('index', { notices, category });
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/add', async (req, res) => {
    console.log(req.body);  // Log the request body to check if category is included
    const newNotice = new Notice(req.body);
    await newNotice.save();
    res.redirect('/');
});


app.post('/remove/:id', async (req, res) => {
    await Notice.findByIdAndDelete(req.params.id);
    res.redirect('/');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));