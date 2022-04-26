const express = require('express');
const campground = require('../models/campgrounds');
const Comment = require('../models/comments');

const router = express.Router();
router.get('/campgrounds/:id/comments/new', isLoggedIn, (req, res) => {
    const id = req.params.id;
    campground.findById(id, (err, page) => {
        if (err) {
            console.log('Error');
        } else {
            res.render('./comments/new', {
                camp: page
            });
        }
    });
});
router.post('/campgrounds/:id/comments', isLoggedIn, (req, res) => {
    Comment.create(req.body.comment, (err, comment) => {
        campground.findById(req.params.id, (_err, camp) => {
            comment.author.id = req.user._id;
            comment.author.username = req.user.username;
            comment.save();
            camp.comment.push(comment);
            camp.save(); 
            res.redirect(`/campgrounds/${req.params.id}`);
        });
    });
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    console.log('Couldn\'t authenticate the User');
    res.redirect('/login');
}
module.exports = router;
