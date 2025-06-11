const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByName, getUserById) {
  const authenticateUsers = async(req, done) => {
    const user = getUserByName(req.body.loginusername)
    if (user == null) {
      return done(null, false, { message: 'No user found with that username' })
    }
    try {
      if (await bcrypt.compare(req.body.loginpassword, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      console.log(e);
      return done(e)
    }
  }

  passport.use(new LocalStrategy({usernameField: 'loginusername'}, authenticateUsers))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

module.exports = initialize