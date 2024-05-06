// helpers.js

const { users, urlDatabase } = require("./database");

// Function to generate a unique id
const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 8);
};

// Function to get user information
const getUserInfo = (req) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const email = user ? user.email : null;
  return { user_id, email };
};

// Function to get user by email
const getUserByEmail = (email, users) => {
  for (const userId in users) {
    if (users[userId]["email"].toLowerCase() === email.toLowerCase()) {
      const user = users[userId];
      return {
        id: user.id,
        email: user.email,
        hashedPassword: user.hashedPassword,
      };
    }
  }
  return null;
};

// Function to return the URLs created by a user
const getUserUrls = (user_id) => {
  const userUrlDatabase = {};

  for (let id in urlDatabase) {
    if (urlDatabase[id].userID === user_id) {
      // If there are short URLs created by the user, add them to the userUrlDatabase object
      userUrlDatabase[id] = urlDatabase[id].longURL;
    }
  }

  return userUrlDatabase;
};

// Function to check if a user is logged in
const isUserLoggedIn = (req) => {
  const user_id = req.session.user_id;
  return user_id && users[user_id];
};

// Function to check if a user owns a specific URL
const isUserOwnedURL = (id, user_id) => {
  return urlDatabase[id] && urlDatabase[id].userID === user_id;
};

// Function to construct template variables
const constructTemplateVars = (req) => {
  const { user_id, email } = getUserInfo(req);

  return {
    urls: getUserUrls(user_id),
    id: req.params.id,
    user_id,
    email,
  };
};

module.exports = {
  generateUniqueId,
  getUserByEmail,
  isUserLoggedIn,
  isUserOwnedURL,
  constructTemplateVars,
};


