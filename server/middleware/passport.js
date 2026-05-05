const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

const findOrCreateOAuthUser = async ({ provider, providerId, email, name, avatar }) => {
  // Try find by provider+providerId first
  let user = await User.findOne({ provider, providerId });
  if (user) return user;

  // Try find by email (link accounts)
  if (email) {
    user = await User.findOne({ email });
    if (user) {
      user.provider = provider;
      user.providerId = providerId;
      if (!user.avatar && avatar) user.avatar = avatar;
      await user.save();
      return user;
    }
  }

  // Create new user
  return User.create({ name, email: email || `${provider}_${providerId}@oauth.local`, avatar, provider, providerId });
};

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  'http://localhost:5000/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreateOAuthUser({
      provider:   'google',
      providerId: profile.id,
      email:      profile.emails?.[0]?.value,
      name:       profile.displayName,
      avatar:     profile.photos?.[0]?.value,
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

passport.use(new GitHubStrategy({
  clientID:     process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL:  'http://localhost:5000/api/auth/github/callback',
  scope:        ['user:email'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    const user = await findOrCreateOAuthUser({
      provider:   'github',
      providerId: String(profile.id),
      email,
      name:       profile.displayName || profile.username,
      avatar:     profile.photos?.[0]?.value,
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

module.exports = passport;
