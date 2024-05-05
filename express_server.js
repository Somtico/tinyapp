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
// Databases
///////////////////////////////////////////////////////////////////////////////

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "q0ju1d",
  },
  x5YZab: {
    longURL: "https://www.example.com",
    userID: "aJ48lW", // Same userID as b6UTxQ
  },
  p9RstU: {
    longURL: "https://www.stackoverflow.com",
    userID: "x9kP2n",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user1@example.com",
    password: "p",
  },
  q0ju1d: {
    id: "q0ju1d",
    email: "user2@example.com",
    password: "d",
  },
  tra1dh: {
    id: "tra1dh",
    email: "somtoufondu@gmail.com",
    password: "1",
  },
};

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

// Function to get user by email
const getUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId]["email"] === email) {
      return users[userId];
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

// Function to delete all cookies
const cleanup = (req, res) => {
  // Get all cookie names
  const cookieNames = Object.keys(req.cookies);

  // Delete each cookie
  cookieNames.forEach((cookieName) => {
    res.clearCookie(cookieName);
  });
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
// User Registration / Login / Logout Routes
///////////////////////////////////////////////////////////////////////////////

/**
 * GET /register
 * Show the client the "New User Registration" page.
 */
app.get("/register", (req, res) => {
  // Get user info
  const { user_id, email, password } = getUserInfo(req);

  // Construct the template
  const templateVars = {
    urls: getUserUrls(user_id),
    user_id,
    email,
    password,
    error: null,
  };

  if (user_id) {
    // If a user_id is detected in the cookies
    const user = users[user_id]; // Attempt to get user data from the database

    if (user) {
      // If user data is found, check whether there is data in their urls database
      if (!Object.keys(getUserUrls(user_id)).length) {
        templateVars.error =
          "Your short URLs list is empty. Create one now to begin your list.";
        res.render("urls_new", templateVars);
      } else {
        // If userUrlDatabase is not empty, show only the short URLs created by the user
        res.render("urls_index", templateVars);
      }
    } else {
      // If user data is not found, allow request
      res.render("register", templateVars);
    }
  } else {
    // If user_id is not detected, allow request
    res.render("register", templateVars);
  }
});

/**
 * POST /register
 * Handle the registration form SUBMISSION!
 */
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const templateVars = { email };

  if (!email || !password) {
    // If email and password fields are empty
    res.status(400); // Set error status
    templateVars.error = "Email and password are required."; // Store error message in template

    res.render("register", templateVars);
  } else if (getUserByEmail(email)) {
    // If user email already exists
    res.status(400);
    templateVars.error = "User already exists. Please login";
    res.render("login", templateVars);
  } else {
    const user_id = generateUniqueId(); // Generate a unique id for new user

    users[user_id] = { id: user_id, email, password }; // Add user info to users database

    res.cookie("user_id", user_id); // Set user_id cookie and redirect to /urls page

    res.redirect("/urls");
  }
});

/**
 * GET /login
 * Show the client the sign-in page.
 */
app.get("/login", (req, res) => {
  // Get user info
  const { user_id, email, password } = getUserInfo(req);

  // Construct the template
  const templateVars = {
    urls: getUserUrls(user_id),
    user_id,
    email,
    password,
    error: null,
  };

  if (user_id) {
    // If a user_id is detected in the cookies
    const user = users[user_id]; // Attempt to get user data from the database

    if (user) {
      // If user data is found, check whether there is data in their urls database
      if (!Object.keys(getUserUrls(user_id)).length) {
        templateVars.error =
          "Your short URLs list is empty. Create one now to begin your list.";
        res.render("urls_new", templateVars);
      } else {
        // If userUrlDatabase is not empty, show only the short URLs created by the user
        res.render("urls_index", templateVars);
      }
    } else {
      // If user data is not found, allow request
      res.render("login", templateVars);
    }
  } else {
    // If user_id is not detected, allow request
    res.render("login", templateVars);
  }
});

/**
 * POST /login (in _header.ejs)
 * Handle the sign-in form SUBMISSION!
 */
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const templateVars = { email };
  const user = getUserByEmail(email); // Get user data

  if (!email || !password) {
    // If email and password fields are empty
    res.status(400);
    templateVars.error = "Email and password are required.";
    res.render("login", templateVars);
  } else if (!user) {
    // If user email does not exist, return an error
    res.status(403);
    templateVars.error =
      "The account was not found. Please register an account first.";
    res.render("register", templateVars);
  } else if (password !== user.password) {
    // If user provided password does not match the one in the database, return an error
    res.status(403);
    templateVars.error = "Password is incorrect!";
    res.render("login", templateVars);
  } else {
    // Get user_id
    const user_id = user.id;

    res.cookie("user_id", user_id);
    res.redirect("/urls");
  }
});

/**
 * POST /logout (in _header.ejs)
 * Handle the sign-out form SUBMISSION!
 */
app.post("/logout", (req, res) => {
  cleanup(req, res);
  res.redirect("/login");
});

///////////////////////////////////////////////////////////////////////////////
// URLs Routes
///////////////////////////////////////////////////////////////////////////////

/**
 * GET /urls
 * Show the urls page
 */
app.get("/urls", (req, res) => {
  // Get user info
  const { user_id, email, password } = getUserInfo(req);

  // Construct the template
  const templateVars = {
    urls: getUserUrls(user_id),
    user_id,
    email,
    password,
    error: null,
  };

  if (user_id) {
    // If a user_id is detected in the cookies
    const user = users[user_id]; // Attempt to get user data from the database

    if (user) {
      // If user data is found, check if userUrlDatabase is empty
      if (!Object.keys(getUserUrls(user_id)).length) {
        templateVars.error =
          "Your short URLs list is empty. Create one now to begin your list.";
        res.render("urls_new", templateVars);
      } else {
        // If userUrlDatabase is not empty, show only the short URLs created by the user
        res.render("urls_index", templateVars);
      }
    } else {
      // If user data is not found, redirect to login and show error
      res.status(401);
      templateVars.error = "Please sign in first to access that page.";
      res.redirect("login", templateVars);
    }
  } else {
    // If user_id is not detected, redirect to login and show error
    res.status(401);
    templateVars.error = "Please sign in first to access that page.";
    res.render("login", templateVars);
  }
  console.log(templateVars);
});

/**
 * GET /urls/new
 * Show the page for the new url form
 */
app.get("/urls/new", (req, res) => {
  // Get user info
  const { user_id, email, password } = getUserInfo(req);

  // Construct the template
  const templateVars = {
    urls: urlDatabase,
    user_id,
    email,
    password,
    error: null,
  };

  if (user_id) {
    // If a user_id is detected in the cookies
    const user = users[user_id]; // Attempt to get user data from the database

    if (user) {
      // If user data is found, allow the request
      res.render("urls_new", templateVars);
    } else {
      // If user data is not found, redirect to login and show error
      res.status(401);
      templateVars.error = "Please sign in first to access that page.";
      res.render("login", templateVars);
    }
  } else {
    // If user_id is not detected, redirect to login and show error
    res.status(401);
    templateVars.error = "Please sign in first to access that page.";
    res.render("login", templateVars);
  }
});

/**
 * POST /urls
 * Handle the NEW url submission form
 */
app.post("/urls", (req, res) => {
  // Get user info
  const { user_id, email, password } = getUserInfo(req);

  // Construct the template
  const templateVars = {
    urls: getUserUrls(user_id),
    id: req.params.id,
    user_id,
    email,
    password,
  };

  if (user_id) {
    // If a user_id is detected in the cookies
    const user = users[user_id]; // Attempt to get user data from the database

    if (user) {
      // If user data is found, allow the request
      const shortURL = generateUniqueId();
      const longURL = req.body.longURL;
      const userID = user_id;
      urlDatabase[shortURL] = { longURL, userID }; // Add new URL to database
      res.redirect(`/urls/${shortURL}`); // Redirect to the new URL page
    } else {
      // If user data is not found, redirect to login and show error
      res.status(401);
      templateVars.error = "Please sign in first to access that page.";
      res.render("login", templateVars);
    }
  } else {
    // If user_id is not detected, redirect to login and show error
    res.status(401);
    templateVars.error = "Please sign in first to access that page.";
    res.render("login", templateVars);
  }
  console.log(urlDatabase);
});

/**
 * GET /urls/:id
 * Show individual shortURL page
 */
app.get("/urls/:id", (req, res) => {
  const { user_id, email, password } = getUserInfo(req);

  const templateVars = {
    urls: getUserUrls(user_id),
    id: req.params.id,
    user_id,
    email,
    password,
    error: null,
  };
  if (user_id) {
    // If a user_id is detected in the cookies
    const user = users[user_id]; // Attempt to get user data from the database

    if (user) {
      // If the shortURL id exists in the urlDatabase
      if (urlDatabase[templateVars.id]) {
        // If the shortURL id exists in the userUrlDatabase, then allow the request
        if (templateVars.urls[templateVars.id]) {
          res.render("urls_show", templateVars);
        } else {
          // If the shortURL id dose not exist in the userUrlDatabase, redirect the user to the urls page
          res.redirect("/urls");
        }
      } else {
        // If it does not exist, render error
        res.status(400).render("error", templateVars);
      }
    } else {
      // If user data is not found, redirect to login and show error
      res.status(401);
      templateVars.error = "Please sign in first to access that page.";
      res.redirect("login", templateVars);
    }
  } else {
    // If user_id is not detected, redirect to login and show error
    res.status(401);
    templateVars.error = "Please sign in first to access that page.";
    res.render("login", templateVars);
  }
});

/**
 * GET /u/:id
 * Redirect to the longURL page
 */
app.get("/u/:id", (req, res) => {
  const { user_id, email, password } = getUserInfo(req);
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user_id,
    email,
    password,
    error: null,
  };

  if (!urlDatabase[templateVars.id]) {
    // If the shortURL does not exist in the database, render error
    res.status(400).render("error", templateVars);
  } else {
    // If it exists, then allow the request
    res.redirect(templateVars.longURL);
  }
});

/**
 * POST /urls/:id
 * Handle the UPDATE url submission form
 */
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;

  // Get user info
  const { user_id, email, password } = getUserInfo(req);

  // Construct the template
  const templateVars = {
    urls: getUserUrls(user_id),
    user_id,
    email,
    password,
    error: null,
  };

  if (user_id) {
    // If a user_id is detected in the cookies
    const user = users[user_id]; // Attempt to get user data from the database

    if (user) {
      // If user data is found, check if the shortURL id is in the userURLDatabase and allow the request
      if (templateVars.urls[shortURL]) {
        const newLongURL = req.body.newLongURL;
        urlDatabase[shortURL].longURL = newLongURL;
        res.redirect("/urls");
      } else {
        // If the shortURL id is in the userURLDatabase, show error message
        res.status(401).render("error", templateVars);
      }
    } else {
      // If user data is not found, redirect to login and show error
      res.status(401);
      templateVars.error = "Please sign in first to access that page.";
      res.redirect("login", templateVars);
    }
  } else {
    // If user_id is not detected, redirect to login and show error
    res.status(401);
    templateVars.error = "Please sign in first to access that page.";
    res.render("login", templateVars);
  }
});

/**
 * POST /urls/:id/delete
 * Handle the DELETE url submission form
 */
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;

  // Get user info
  const { user_id, email, password } = getUserInfo(req);

  // Construct the template
  const templateVars = {
    urls: getUserUrls(user_id),
    user_id,
    email,
    password,
    error: null,
  };

  if (user_id) {
    // If a user_id is detected in the cookies
    const user = users[user_id]; // Attempt to get user data from the database

    if (user) {
      // If user data is found, check if the shortURL id is in the userURLDatabase and allow the request
      if (templateVars.urls[shortURL]) {
        delete urlDatabase[req.params.id];
        res.redirect("/urls");
      } else {
        // If the shortURL id is in the userURLDatabase, show error message
        res.status(401).render("error", templateVars);
      }
    } else {
      // If user data is not found, redirect to login and show error
      res.status(401);
      templateVars.error = "Please sign in first to access that page.";
      res.redirect("login", templateVars);
    }
  } else {
    // If user_id is not detected, redirect to login and show error
    res.status(401);
    templateVars.error = "Please sign in first to access that page.";
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
const server = app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
