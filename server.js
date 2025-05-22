const express = require('express');
const app = express();
const bcrypt = require('bcrypt')

const users = []

app.use(express.urlencoded({extended: false}))

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