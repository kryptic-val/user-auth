if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt')
const passport = require('passport')
const initializePassport = require("./passport-config")
const flash = require('express-flash')
const session = require('express-session')

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

app.post("/login", passport.authenticate('local', {
  successRedirect: '/success',
  failureRedirect: '/fail',
  failureFlash: true
}))

app.post("/register", async(req, res) => {
  try {
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

app.get('/', (req, res) => {
  res.render('index.ejs');
})

console.log(users);
app.listen(3000)