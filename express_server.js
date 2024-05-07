// express_server.js

///////////////////////////////////////////////////////////////////////////////
// Dependencies
///////////////////////////////////////////////////////////////////////////////

const express = require("express");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs/dist/bcrypt");
const helpers = require("./helpers");
const { users, urlDatabase } = require("./database");

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
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

////////////////////////////////////////////////////////////////////////////
// User Registration / Login / Logout Routes
///////////////////////////////////////////////////////////////////////////////

/**
 * GET /register
 * Show the client the "New User Registration" page.
 */
app.get("/register", (req, res) => {
  const templateVars = helpers.constructTemplateVars(req);
  templateVars.error = null;

  if (helpers.isUserLoggedIn(req)) {
    // Redirect to the URLs page
    res.status(302).redirect("/urls");
  } else {
    // If user is not logged in, allow request
    res.render("register", templateVars);
  }
});

/**
 * POST /register
 * Handle the registration form SUBMISSION!
 */
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const templateVars = helpers.constructTemplateVars(req);
  templateVars.error = null;

  if (!email || !password) {
    // If email and password fields are empty
    res.status(400); // Set error status
    templateVars.error = "Email and password are required."; // Store error message in template

    res.render("register", templateVars);
  } else if (helpers.getUserByEmail(email, users)) {
    // If user email already exists
    res.status(400);
    templateVars.email = null;
    templateVars.error = "User already exists. Please login";
    res.render("login", templateVars);
  } else {
    const user_id = helpers.generateUniqueId();

    // Add user info to users database
    users[user_id] = { id: user_id, email, hashedPassword };

    // Set user session
    req.session.user_id = user_id;

    res.redirect("/urls");
  }
});

/**
 * GET /login
 * Show the client the sign-in page.
 */
app.get("/login", (req, res) => {
  const templateVars = helpers.constructTemplateVars(req);
  templateVars.error = null;

  if (helpers.isUserLoggedIn(req)) {
    // Redirect to the URLs page
    res.status(302).redirect("/urls");
  } else {
    // If user is not logged in, allow request
    templateVars.error = req.query.error;
    res.render("login", templateVars);
  }
});

/**
 * POST /login (in _header.ejs)
 * Handle the sign-in form SUBMISSION!
 */
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const templateVars = helpers.constructTemplateVars(req);
  templateVars.error = null;

  // Get user data
  const user = helpers.getUserByEmail(email, users);

  if (!email || !password) {
    // If email and password fields are empty
    res.status(400);
    templateVars.error = "Email and password are required.";
    res.render("login", templateVars);
  } else if (!user) {
    // If user email does not exist, return an error
    res.status(401);
    templateVars.email = null;
    templateVars.error =
      "The account was not found. Please register an account first.";
    res.render("register", templateVars);
  } else {
    try {
      const passwordMatch = bcrypt.compareSync(password, user.hashedPassword);
      if (!passwordMatch) {
        // If user provided password does not match the one in the database, return an error
        res.status(401);
        templateVars.email = null;
        templateVars.error = "Password is incorrect!";
        res.render("login", templateVars);
      } else {
        // If valid, set session data
        req.session.user_id = user.id;

        res.redirect("/urls");
      }
    } catch (error) {
      // Handle bcrypt error
      res.status(500).send("Internal Server Error");
    }
  }
});

/**
 * POST /logout (in _header.ejs)
 * Handle the sign-out form SUBMISSION!
 */
app.post("/logout", (req, res) => {
  // Clear session data
  req.session = null;
  res.redirect("/login");
});

///////////////////////////////////////////////////////////////////////////////
// URLs Routes
///////////////////////////////////////////////////////////////////////////////

/**
 * GET home page
 * Show the urls page
 */
app.get("/", (req, res) => {
  if (helpers.isUserLoggedIn(req)) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

/**
 * GET /urls
 * Show the urls page
 */
app.get("/urls", (req, res) => {
  const templateVars = helpers.constructTemplateVars(req);
  templateVars.error = null;

  if (helpers.isUserLoggedIn(req)) {
    // Check whether there is data in their urls database
    if (!Object.keys(templateVars.urls).length) {
      res
        .status(302)
        .redirect(
          "/urls/new?error=Your short URLs list is empty. Create one now to begin your list."
        );
    } else {
      // If userUrlDatabase is not empty, show only the short URLs created by the user
      res.render("urls_index", templateVars);
    }
  } else {
    // If user is not logged in, redirect to login and show error
    res.status(302);
    templateVars.error = "Please login first to access that page.";
    res.render("login", templateVars);
  }
});

/**
 * GET /urls/new
 * Show the page for the new url form
 */
app.get("/urls/new", (req, res) => {
  const templateVars = helpers.constructTemplateVars(req);
  templateVars.error = null;

  if (helpers.isUserLoggedIn(req)) {
    templateVars.error = req.query.error;
    res.render("urls_new", templateVars);
  } else {
    // If user is not logged in, redirect to login and show error
    res.status(302);
    res.redirect("/login?error=Please login first to access that page");
  }
});

/**
 * POST /urls
 * Handle the NEW url submission form
 */
app.post("/urls", (req, res) => {
  const templateVars = helpers.constructTemplateVars(req);
  templateVars.error = null;

  if (helpers.isUserLoggedIn(req)) {
    const shortURL = helpers.generateUniqueId();
    const longURL = req.body.longURL;
    const userID = templateVars.user_id;
    urlDatabase[shortURL] = { longURL, userID }; // Add new URL to database
    res.redirect(`/urls/${shortURL}`); // Redirect to the new URL page
  } else {
    // If user is not logged in, redirect to login and show error
    res.status(401);
    templateVars.error = "Please login first to access that page.";
    res.render("login", templateVars);
  }
});

/**
 * GET /urls/:id
 * Show individual shortURL page
 */
app.get("/urls/:id", (req, res) => {
  const templateVars = helpers.constructTemplateVars(req);
  templateVars.error = null;

  if (helpers.isUserLoggedIn(req)) {
    if (helpers.isUserOwnedURL(templateVars.id, templateVars.user_id)) {
      res.render("urls_show", templateVars);
    } else {
      res.status(403).render("error", templateVars);
    }
  } else {
    // If user is not logged in, redirect to login and show error
    res.status(302);
    templateVars.error = "Please login first to access that page.";
    res.render("login", templateVars);
  }
});

/**
 * GET /u/:id
 * Redirect to the longURL page
 */
app.get("/u/:id", (req, res) => {
  const templateVars = helpers.constructTemplateVars(req);
  templateVars.error = null;

  if (!urlDatabase[templateVars.id]) {
    // If the shortURL does not exist in the database, render error
    res.status(400).render("error", templateVars);
  } else {
    let longURL = urlDatabase[templateVars.id].longURL;

    // Check if longURL starts with "http://" or "https://"
    if (!longURL.startsWith("http://") && !longURL.startsWith("https://")) {
      // If not, prepend "http://"
      longURL = "http://" + longURL;
    }

    // Allow the request
    res.redirect(longURL);
  }
});

/**
 * POST /urls/:id
 * Handle the UPDATE url submission form
 */
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;

  const templateVars = helpers.constructTemplateVars(req);
  templateVars.error = null;

  if (helpers.isUserLoggedIn(req)) {
    // If user is logged in, check if the shortURL id is in the userURLDatabase and allow the request
    if (templateVars.urls[shortURL]) {
      const newLongURL = req.body.newLongURL;
      urlDatabase[shortURL].longURL = newLongURL;
      res.redirect("/urls");
    } else {
      // If the shortURL id is not in the userURLDatabase, show error message
      res.status(401).render("error", templateVars);
    }
  } else {
    // If user is not logged in, redirect to login and show error
    res.status(401);
    templateVars.error = "Please login first to access that page.";
    res.render("login", templateVars);
  }
});

/**
 * POST /urls/:id/delete
 * Handle the DELETE url submission form
 */
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;

  const templateVars = helpers.constructTemplateVars(req);
  templateVars.error = null;

  if (helpers.isUserLoggedIn(req)) {
    // If user is logged in, check if the shortURL id is in the userURLDatabase and allow the request
    if (templateVars.urls[shortURL]) {
      delete urlDatabase[req.params.id];
      res.redirect("/urls");
    } else {
      // If the shortURL id is in the userURLDatabase, show error message
      res.status(401).render("error", templateVars);
    }
  } else {
    // If user_id is not detected, redirect to login and show error
    res.status(401);
    templateVars.error = "Please login first to access that page.";
    res.render("login", templateVars);
  }
});

///////////////////////////////////////////////////////////////////////////////
// Listeners
///////////////////////////////////////////////////////////////////////////////

// Listen for the SIGINT signal (Ctrl+C) to gracefully shutdown
process.on("SIGINT", () => {
  console.log("\nCtrl+C pressed, server is shutting down...");
  process.exit(0);
});

// Listen for server startup command
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = { users, urlDatabase };


