// helpersTest.js

const { assert } = require("chai");

const {
  generateUniqueId,
  getUserByEmail,
  isUserLoggedIn,
  isUserOwnedURL,
  constructTemplateVars,
} = require("../helpers");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: "dishwasher-funk",
  },
};

describe("getUserByEmail", () => {
  it("Should return a user id with valid email (lowercase)", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUser = {
      id: "userRandomID",
      email: "user@example.com",
      hashedPassword: "purple-monkey-dinosaur",
    };
    assert.deepEqual(user, expectedUser);
  });

  it("Should return a user id with valid email (uppercase)", () => {
    const user = getUserByEmail("USER@EXAMPLE.COM", testUsers);
    const expectedUser = {
      id: "userRandomID",
      email: "user@example.com",
      hashedPassword: "purple-monkey-dinosaur",
    };
    assert.deepEqual(user, expectedUser);
  });

  it("Should return a user with valid email (mixed case)", () => {
    const user = getUserByEmail("UsEr@ExAmPlE.cOm", testUsers);
    const expectedUser = {
      id: "userRandomID",
      email: "user@example.com",
      hashedPassword: "purple-monkey-dinosaur",
    };
    assert.deepEqual(user, expectedUser);
  });

  it("Should return null with invalid email", () => {
    const user = getUserByEmail("user1@example.com", testUsers);
    const expectedUser = null;
    assert.equal(user, expectedUser);
  });

  it("Should return null with empty users object", () => {
    const user = getUserByEmail("user@example.com", {});
    const expectedUser = null;
    assert.equal(user, expectedUser);
  });
});
