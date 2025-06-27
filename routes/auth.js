const express = require('express');
const User = require('../models/User');
const { validateUser } = require('../utils/validation');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'Login - Hire Nest' });
});

// Register page
router.get('/register', (req, res) => {
    res.render('auth/register', { title: 'Register - Hire Nest' });
});

// Login POST
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }
        
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }
        
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            avatar: user.avatar
        };
        
        req.flash('success', `Welcome back, ${user.name}!`);
        res.redirect('/dashboard');
        
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'Login failed. Please try again.');
        res.redirect('/auth/login');
    }
});

// Register POST
router.post('/register', async (req, res) => {
    try {
        const { error } = validateUser(req.body);
        if (error) {
            req.flash('error', error.details[0].message);
            return res.redirect('/auth/register');
        }
        
        const { name, email, password, userType } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            req.flash('error', 'User with this email already exists');
            return res.redirect('/auth/register');
        }
        
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password,
            userType
        });
        
        await newUser.save();
        
        req.session.user = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            userType: newUser.userType,
            avatar: newUser.avatar
        };
        
        req.flash('success', 'Registration successful! Welcome to Hire Nest.');
        res.redirect('/dashboard');
        
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'Registration failed. Please try again.');
        res.redirect('/auth/register');
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            req.flash('error', 'Could not log you out');
            return res.redirect('/dashboard');
        }
        res.redirect('/');
    });
});

module.exports = router;