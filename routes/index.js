const express = require('express');
const router = express.Router();

// Require your Worker model at the top of the file
const Worker = require('../models/Worker'); // Adjust the path as needed

// Home page
router.get('/', (req, res) => {
    res.render('index', { title: 'Hire Nest - Find & Hire Skilled Workers' });
});

// About page
router.get('/about', (req, res) => {
    res.render('about', { title: 'About - Hire Nest' });
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact - Hire Nest' });
});

// Contact form submission
router.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    // In a real app, you'd save this to a database or send an email
    console.log('Contact form submission:', { name, email, message });
    
    req.flash('success', 'Thank you for your message! We\'ll get back to you soon.');
    res.redirect('/contact');
});

// Get hired page (become a worker)
router.get('/get-hired', (req, res) => {
    res.render('get-hired', { title: 'Get Hired - Hire Nest' });
});

module.exports = router;