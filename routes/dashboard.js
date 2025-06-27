const express = require('express');
const { isLoggedIn } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const User = require('../models/User');
const router = express.Router();

// Dashboard
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const currentUser = req.session.user;
        let userBookings = [];
        let workerProfile = null;
        let stats = {};
        
        if (currentUser.userType === 'client') {
            // Get bookings made by this client
            userBookings = await Booking.find({ client: currentUser.id })
                .populate('worker')
                .populate({
                    path: 'worker',
                    populate: {
                        path: 'user',
                        select: 'name email avatar'
                    }
                })
                .sort({ createdAt: -1 });
                
            stats = {
                totalBookings: userBookings.length,
                acceptedBookings: userBookings.filter(b => b.status === 'accepted').length,
                pendingBookings: userBookings.filter(b => b.status === 'pending').length,
                totalSpent: userBookings.filter(b => b.status === 'accepted').reduce((sum, b) => sum + b.totalCost, 0)
            };
        } else if (currentUser.userType === 'worker') {
            // Get worker profile
            workerProfile = await Worker.findOne({ user: currentUser.id });
            
            if (workerProfile) {
                // Get bookings for this worker
                userBookings = await Booking.find({ worker: workerProfile._id })
                    .populate('client', 'name email avatar')
                    .sort({ createdAt: -1 });
                    
                stats = {
                    totalBookings: userBookings.length,
                    acceptedBookings: userBookings.filter(b => b.status === 'accepted').length,
                    pendingBookings: userBookings.filter(b => b.status === 'pending').length,
                    totalEarnings: userBookings.filter(b => b.status === 'accepted').reduce((sum, b) => sum + b.totalCost, 0)
                };
            }
        }
        
        res.render('dashboard/index', { 
            title: 'Dashboard - Hire Nest',
            bookings: userBookings,
            workerProfile,
            stats
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error', 'Failed to load dashboard');
        res.redirect('/');
    }
});

// Worker profile management
router.get('/profile', isLoggedIn, async (req, res) => {
    try {
        if (req.session.user.userType !== 'worker') {
            req.flash('error', 'Access denied');
            return res.redirect('/dashboard');
        }
        
        const workerProfile = await Worker.findOne({ user: req.session.user.id });
        
        res.render('dashboard/profile', { 
            title: 'Manage Profile - Hire Nest',
            workerProfile
        });
    } catch (error) {
        console.error('Profile page error:', error);
        req.flash('error', 'Failed to load profile');
        res.redirect('/dashboard');
    }
});

// Update worker profile
router.post('/profile', isLoggedIn, async (req, res) => {
    try {
        if (req.session.user.userType !== 'worker') {
            req.flash('error', 'Access denied');
            return res.redirect('/dashboard');
        }
        
        const { category, skills, dailyRate, description, available } = req.body;
        const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
        
        let workerProfile = await Worker.findOne({ user: req.session.user.id });
        
        if (!workerProfile) {
            // Create new worker profile
            workerProfile = new Worker({
                user: req.session.user.id,
                category,
                skills: skillsArray,
                dailyRate: parseFloat(dailyRate),
                description,
                available: available === 'on'
            });
        } else {
            // Update existing profile
            workerProfile.category = category;
            workerProfile.skills = skillsArray;
            workerProfile.dailyRate = parseFloat(dailyRate);
            workerProfile.description = description;
            workerProfile.available = available === 'on';
        }
        
        await workerProfile.save();
        
        req.flash('success', 'Profile updated successfully!');
        res.redirect('/dashboard');
        
    } catch (error) {
        console.error('Profile update error:', error);
        req.flash('error', 'Profile update failed. Please try again.');
        res.redirect('/dashboard/profile');
    }
});

module.exports = router;