    require("dotenv").config()
    const express = require('express');
    const session = require('express-session');
    const MongoStore = require('connect-mongo');
    const flash = require('express-flash');
    const ejsMate = require('ejs-mate');
    const methodOverride = require('method-override');
    const path = require('path');
    const connectDB = require('./config/database');

    // Import routes
    const indexRoutes = require('./routes/index');
    const authRoutes = require('./routes/auth');
    const workerRoutes = require('./routes/workers');
    const bookingRoutes = require('./routes/bookings');
    const dashboardRoutes = require('./routes/dashboard');

    const app = express();
    const PORT = process.env.PORT || 3000;

    // Connect to MongoDB
    connectDB();

    app.engine('ejs', ejsMate);
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    // Middleware
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(methodOverride('_method'));

    // Session configuration with MongoDB store
    app.use(session({
        secret: process.env.MONGO_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: `${process.env.MONGODB_URL}/hirenest`
        }),
        cookie: {
            httpOnly: true,
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    }));

    app.use(flash());

    // Global middleware for template variables
    app.use((req, res, next) => {
        res.locals.currentUser = req.session.user;
        res.locals.success = req.flash('success');
        res.locals.error = req.flash('error');
        next();
    });

    // Routes
    app.use('/', indexRoutes);
    app.use('/auth', authRoutes);
    app.use('/workers', workerRoutes);
    app.use('/bookings', bookingRoutes);
    app.use('/dashboard', dashboardRoutes);

    // 404 handler
    app.all('*', (req, res) => {
        res.status(404).render('error', { 
            title: 'Page Not Found',
            message: 'The page you are looking for does not exist.'
        });
    });

    // Error handler
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).render('error', { 
            title: 'Something went wrong!',
            message: 'Internal server error occurred.'
        });
    });

    app.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}`);
    });