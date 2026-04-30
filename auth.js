const GoogleStrategy = require('passport-google-oauth2').Strategy;
const passport = require('passport')


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/google/callback'
},
function(accessToken, refreshToken, profile, done){
  // UserActivation.findOrCreate({exampleId: profile.id}, function (err, user) {
  //   return cb(err, user);
  // })
  const user = {
    email: profile.emails[0].value,
    name: profile.displayName
  }
  return done(null, user);
}
));

passport.serializeUser(function(user, done){
  done(null, user)
})
passport.deserializeUser(function(user, done){
  done(null, user)
})