const passport = require("passport");
const googleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const keys = require("../config/keys");

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user)
    });
});

passport.use(
  new googleStrategy({
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback",
      proxy: true
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("access token: ", accessToken);
      console.log("refresh token: ", refreshToken);
      console.log("profile: ", profile);
      User.findOne({
        googleID: profile.id
      }).then((existingUser) => {
        if (existingUser) {
          // we already have a record with the given profile ID
          done(null, existingUser)
        } else {
          // We dont have a user with this ID, make a new record
          new User({
            googleID: profile.id
          }).save().then(user => done(null, user));
        }
      })
    }
  )
);