const isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'You must be logged in to access this page');
        return res.redirect('/auth/login');
    }
    next();
};

const isClient = (req, res, next) => {
    if (!req.session.user || req.session.user.userType !== 'client') {
        req.flash('error', 'Access denied');
        return res.redirect('/');
    }
    next();
};

const isWorker = (req, res, next) => {
    if (!req.session.user || req.session.user.userType !== 'worker') {
        req.flash('error', 'Access denied');
        return res.redirect('/');
    }
    next();
};

module.exports = {
    isLoggedIn,
    isClient,
    isWorker
};