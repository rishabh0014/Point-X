const campground = require('../models/campgrounds');

const middleWare = {};
middleWare.checkOwnership = function checkOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        campground.findById(req.params.id, (err, camp) => {
            if (!err) {
                if (camp.createdBy.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash('error', 'Access Denied!! You do not have the required permission :(');
                    res.redirect(`/campgrounds/${req.params.id}`);
                }
            } else {
                req.flash('error', 'Sorry! Campground not found');
            }
        });
    } else {
        req.flash('error', 'Log In Required');
        res.redirect(`/campgrounds/${req.params.id}`);
    }
};
middleWare.isLoggedIn = function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'Log In Required');
    res.redirect('/login');
};
module.exports = middleWare;
