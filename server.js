if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

//const mongoose = require('mongoose')
const express = require('express');
const app = express();
const bcrypt = require('bcrypt')
const passport = require('passport')
const initializePassport = require("./passport-config")
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

/*mongoose
.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("DB Connected");
})
.catch((err) => console.log(err));*/

initializePassport(
  passport,
  name => users.find(user => user.name === name),
  id => users.find(user => user.id === id)
)

const users = []

app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.post("/login", checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/games',
  failureRedirect: '/',
  failureFlash: true
}))

app.post("/register", checkNotAuthenticated, async(req, res) => {
  try {
    const existingUser = users.find(user => user.name === req.body.registerusername)
    if (existingUser) {
      req.flash('error', 'Username taken')
      return res.redirect('/')
    }
    const hashedPassword = await bcrypt.hash(req.body.registerpassword, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.registerusername,
      email: req.body.registeremail,
      password: hashedPassword,
    })
    console.log(users);
    res.redirect('/')
  } catch (e) {
    console.log(e);
    res.redirect('/')
  }
})

app.get('/', checkNotAuthenticated, (req, res) => {
  res.render('index.ejs', {messages: req.flash()});
})

app.get('/games', checkAuthenticated, (req, res) => {
  res.render('games.ejs', {name: req.user.name});
})

app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/games')
  }
  next()
}

console.log(users);
app.listen(3000)