// express_server.js

///////////////////////////////////////////////////////////////////////////////
// Dependencies
///////////////////////////////////////////////////////////////////////////////

const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

///////////////////////////////////////////////////////////////////////////////
// Set-Up / Initialize
///////////////////////////////////////////////////////////////////////////////

const app = express();
const PORT = 8080;

///////////////////////////////////////////////////////////////////////////////
// View Engine
///////////////////////////////////////////////////////////////////////////////

app.set("view engine", "ejs");

///////////////////////////////////////////////////////////////////////////////
// Middleware
///////////////////////////////////////////////////////////////////////////////

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

///////////////////////////////////////////////////////////////////////////////
// Helpers
///////////////////////////////////////////////////////////////////////////////

// Function to generate a unique id
const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 8);
};

// Function to get user information
const getUserInfo = (req) => {
  const user_id = req.cookies.user_id;
  const email = users[user_id] ? users[user_id].email : null;
  const password = users[user_id] ? users[user_id].password : null;
  return { user_id, email, password };
};

//Function to get user by email
const getUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId]["email"] === email) {
      return users[userId];
    }
  }
  return null;
};

///////////////////////////////////////////////////////////////////////////////
// Users "Database"
///////////////////////////////////////////////////////////////////////////////

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  user1RandomID: {
    id: "user1RandomID",
    email: "user1@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

///////////////////////////////////////////////////////////////////////////////
// Routes
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// Plain Text, JSON and HTML Routes
///////////////////////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>");
});

///////////////////////////////////////////////////////////////////////////////
// User Registration / Login Routes
///////////////////////////////////////////////////////////////////////////////

/**
 * GET /register
 * Show the client the "New User Registration" form.
 */
app.get("/register", (req, res) => {
  const { user_id, email, password } = getUserInfo(req);
  const templateVars = {
    urls: urlDatabase,
    user_id,
    email,
    password,
    error: null,
  };
  res.render("register", templateVars);
});

/**
 * POST /register
 * Handle the registration form SUBMISSION!
 */
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Check if email and password fields are empty
  if (!email || !password) {
    return res.status(400).send("Email and password fields cannot be empty.");
  }

  // Check if user already exists
  if (getUserByEmail(email)) {
    return res.status(400).send("User already exists.");
  }

  // Generate a unique id for new user
  const user_id = generateUniqueId();

  // Add user info to users database
  users[user_id] = { id: user_id, email, password };
  console.log(users);

  // Set user_id cookie and redirect to /urls page
  res.cookie("user_id", user_id);
  res.redirect("/urls");
});

/**
 * POST /login (in _header.ejs)
 * Handle the sign-in form SUBMISSION!
 */
app.post("/login", (req, res) => {
  res.cookie("email", req.body.email);
  res.redirect("/urls");
});

/**
 * POST /logout (in _header.ejs)
 * Handle the sign-out form SUBMISSION!
 */
app.post("/logout", (req, res) => {
  const cookies = Object.keys(req.cookies);
  cookies.forEach((cookie) => {
    res.clearCookie(cookie);
  });
  res.redirect("/urls");
});

/**
 * GET /urls
 * Show the urls page
 */
app.get("/urls", (req, res) => {
  const { user_id, email, password } = getUserInfo(req);
  const templateVars = {
    urls: urlDatabase,
    user_id,
    email,
    password,
  };
  res.render("urls_index", templateVars);
});

/**
 * GET /urls/new
 * Show the page for the new url form
 */
app.get("/urls/new", (req, res) => {
  const { user_id, email, password } = getUserInfo(req);
  const templateVars = {
    urls: urlDatabase,
    user_id,
    email,
    password,
  };
  res.render("urls_new", templateVars);
});

/**
 * POST /urls
 * Handle the NEW url submission form
 */
app.post("/urls", (req, res) => {
  const shortURL = generateUniqueId();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL; // Add new URL to database
  res.redirect(`/urls/${shortURL}`); // Redirect to the new URL page
});

/**
 * GET /urls/:id
 * Show the page for the newly created url
 */
app.get("/urls/:id", (req, res) => {
  const { user_id, email, password } = getUserInfo(req);
  const templateVars = {
    urls: urlDatabase,
    user_id,
    email,
    password,
  };
  res.render("urls_show", templateVars);
});

/**
 * GET /u/:id
 * Redirect to the longURL page
 */
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

/**
 * POST /urls/:id
 * Handle the UPDATE url submission form
 */
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.newLongURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

/**
 * POST /urls/:id/delete
 * Handle the DELETE url submission form
 */
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

///////////////////////////////////////////////////////////////////////////////
// Listener
///////////////////////////////////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

