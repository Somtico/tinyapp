# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Table of Contents

- [Final Product](#final-product)
- [Dependencies](#dependencies)
- [Getting Started](#getting-started)
- [Key Features](#key-features)
- [Routes](#routes)
- [Code Structure](#code-structure)
- [Contributing](#contributing)
- [License](#license)

## Final Product

Registration page:
!["Screenshot of registration page"](https://github.com/Somtico/tinyapp/blob/main/docs/screenshots/register-page.png?raw=true)

URLs page:
!["Screenshot of URLs page"](https://github.com/Somtico/tinyapp/blob/main/docs/screenshots/urls-page.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- morgan

## Getting Started

1. Install all dependencies using the `npm install` command.
2. Run the development web server using the `node express_server.js` command.

## Key Features

- User registration and login functionality
- Ability to create short URLs for long URLs
- Redirect short URLs to their corresponding long URLs
- Display a list of URLs created by the logged-in user
- Update and delete existing short URLs
- Secure password hashing using bcrypt

## Routes

The application has the following routes:

- `GET /`: Redirects to `/urls` if the user is logged in, otherwise redirects to `/login`.
- `GET /urls`: Displays a list of URLs created by the logged-in user. If the user is not logged in, redirects to `/login`.
- `GET /urls/new`: Displays a form to create a new short URL. If the user is not logged in, redirects to `/login`.
- `POST /urls`: Handles the submission of the new URL form. If the user is not logged in, redirects to `/login`.
- `GET /urls/:id`: Displays the details of a specific short URL. If the user is not logged in or does not own the URL, shows an error page.
- `POST /urls/:id`: Handles the update of an existing short URL. If the user is not logged in or does not own the URL, shows an error page.
- `POST /urls/:id/delete`: Handles the deletion of an existing short URL. If the user is not logged in or does not own the URL, shows an error page.
- `GET /u/:id`: Redirects the user to the corresponding long URL.
- `GET /register`: Displays the registration form. If the user is already logged in, redirects to `/urls`.
- `POST /register`: Handles the registration form submission. If the email or password is missing, shows an error. If the email already exists, redirects to `/login`.
- `GET /login`: Displays the login form. If the user is already logged in, redirects to `/urls`.
- `POST /login`: Handles the login form submission. If the email or password is missing, shows an error. If the email does not exist or the password is incorrect, shows an error.
- `POST /logout`: Logs out the user by clearing the session and redirecting to `/login`.

## Code Structure

The application is structured into the following files:

- `express_server.js`: Contains the main Express server setup, middleware, and route definitions.
- `helpers.js`: Includes helper functions used throughout the application, such as generating unique IDs, getting user information, and checking user ownership of URLs.
- `database.js`: Contains the `urlDatabase` and `users` objects that store the URLs and user information used by the application.
- `views/`: Contains the EJS templates for rendering the application pages.
- `test/`: Contains code files to test the helper functions and authentication routes. You can run the tests using `npm test`.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the [MIT License](LICENSE).
