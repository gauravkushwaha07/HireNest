const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'Web Development',
            'Mobile Development',
            'Graphic Design',
            'UI/UX Design',
            'Content Writing',
            'Digital Marketing',
            'Data Entry',
            'Translation',
            'Video Editing',
            'Photography',
            'Other'
        ]
    },
    skills: [{
        type: String,
        required: true
    }],
    dailyRate: {
        type: Number,
        required: [true, 'Daily rate is required'],
        min: [1, 'Daily rate must be at least $1']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    available: {
        type: Boolean,
        default: true
    },
    portfolio: [{
        title: String,
        description: String,
        image: String,
        url: String
    }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    completedProjects: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Virtual for populated user data
workerSchema.virtual('userData', {
    ref: 'User',
    localField: 'user',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model('Worker', workerSchema);