const express = require('express');
const Worker = require('../models/Worker');
const User = require('../models/User');
const { isLoggedIn } = require('../middleware/auth');
const router = express.Router();

// Browse all workers
router.get('/', async (req, res) => {
    try {
        const { category, availability, search } = req.query;
        let query = {};
        
        if (category) {
            query.category = new RegExp(category, 'i');
        }
        
        if (availability === 'available') {
            query.available = true;
        }
        
        if (search) {
            query.$or = [
                { 'skills': new RegExp(search, 'i') },
                { 'description': new RegExp(search, 'i') }
            ];
        }
        
        const workers = await Worker.find(query)
            .populate('user', 'name email avatar')
            .sort({ rating: -1, createdAt: -1 });
        
        res.render('workers/index', { 
            title: 'Browse Workers - Hire Nest',
            workers,
            filters: { category, availability, search }
        });
    } catch (error) {
        console.error('Workers fetch error:', error);
        req.flash('error', 'Failed to load workers');
        res.redirect('/');
    }
});

// View worker profile
router.get('/:id', async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id)
            .populate('user', 'name email avatar');
        
        if (!worker) {
            req.flash('error', 'Worker not found');
            return res.redirect('/workers');
        }
        
        res.render('workers/profile', { 
            title: `${worker.user.name} - Hire Nest`,
            worker
        });
    } catch (error) {
        console.error('Worker profile error:', error);
        req.flash('error', 'Worker not found');
        res.redirect('/workers');
    }
});

module.exports = router;