const express = require('express');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const { isLoggedIn } = require('../middleware/auth');
const router = express.Router();

// Create booking
router.post('/create', isLoggedIn, async (req, res) => {
    try {
        const { workerId, startDate, endDate, message } = req.body;
        
        const worker = await Worker.findById(workerId);
        if (!worker) {
            req.flash('error', 'Worker not found');
            return res.redirect('/workers');
        }
        
        if (!worker.available) {
            req.flash('error', 'Worker is currently not available');
            return res.redirect(`/workers/${workerId}`);
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            req.flash('error', 'End date must be after start date');
            return res.redirect(`/workers/${workerId}`);
        }

        // Calculate days and totalCost here
        const diffTime = Math.abs(end - start);
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const totalCost = days * worker.dailyRate;

        const newBooking = new Booking({
            client: req.session.user.id,
            worker: workerId,
            startDate: start,
            endDate: end,
            days,
            dailyRate: worker.dailyRate,
            totalCost,
            message
        });
        
        await newBooking.save();
        
        req.flash('success', `Booking request sent successfully! Total cost: ₹${newBooking.totalCost}`);
        res.redirect('/dashboard');
        
    } catch (error) {
        console.error('Booking creation error:', error);
        req.flash('error', 'Booking failed. Please try again.');
        res.redirect('/workers');
    }
});

// Accept/Reject booking (for workers)
router.post('/:id/update-status', isLoggedIn, async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id)
            .populate('worker');
        
        if (!booking) {
            req.flash('error', 'Booking not found');
            return res.redirect('/dashboard');
        }
        
        // Check if current user is the worker for this booking
        if (booking.worker.user.toString() !== req.session.user.id) {
            req.flash('error', 'Unauthorized action');
            return res.redirect('/dashboard');
        }
        
        booking.status = status;
        await booking.save();
        
        // Update worker stats if accepted
        if (status === 'accepted') {
            await Worker.findByIdAndUpdate(booking.worker._id, {
                $inc: { completedProjects: 1, totalEarnings: booking.totalCost }
            });
        }
        
        req.flash('success', `Booking ${status} successfully`);
        res.redirect('/dashboard');
        
    } catch (error) {
        console.error('Booking status update error:', error);
        req.flash('error', 'Action failed. Please try again.');
        res.redirect('/dashboard');
    }
});

module.exports = router;