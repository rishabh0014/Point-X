const express = require('express');

const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const usersRoute = require('./routers/users');

dotenv.config();
const passport = require('passport');
const User = require('./models/user');
const localStrategy = require('passport-local');
const authRoutes = require('./routers/auth');
const campgroundRoutes = require('./routers/campgrounds');
const commentRoutes = require('./routers/comments');
const connectFlash = require('connect-flash');
const methodOverride = require('method-override');
const session = require('express-session');

mongoose.connect('mongodb://127.0.0.1:27017/point-X')
    .then(() => {
        console.log("Connection establish successfully :)")
    }).catch(err => {
        console.log("Connection field :(")
        console.log(err)
    })
app.use(connectFlash());
const MongoStore = require('connect-mongo')(session);

app.use(
  session({
    secret: 'something special',
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    }),
    resave: false,
    saveUninitialized: false
  })
);

app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());
const body_parser = require('body-parser');

app.set('view engine', 'ejs');
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.github = 'https://github.com/abhagsain';
  next();
});
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(
  body_parser.urlencoded({
    extended: true
  })
);

app.use(authRoutes);
app.use(campgroundRoutes);
app.use(commentRoutes);
app.use(usersRoute);
app.get('*', (req, res) => {
  res.render('notfound');
});
app.listen(5000,() => {
  console.log('Running on PORT 5000 :)');
});