const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByName, getUserById) {
  const authenticateUsers = async(username, password, done) => {
    const user = getUserByName(username)
    if (user == null) {
      return done(null, false, { message: 'No user found with that username' })
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      console.log(e);
      return done(e)
    }
  }

  passport.use(new LocalStrategy({usernameField: 'username'}, authenticateUsers))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

module.exports = initialize