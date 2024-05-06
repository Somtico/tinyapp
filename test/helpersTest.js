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
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", () => {
  it("Should return a user id with valid email", () => {
    const user_id = getUserByEmail("user@example.com", testUsers).id;
    const expectedUserID = "userRandomID";
    assert.equal(user_id, expectedUserID);
  });

  it("Should return undefined with invalid email", () => {
    const user = getUserByEmail("user1@example.com", testUsers);
    const expectedUser = undefined;
    assert.equal(user, expectedUser);
  });
});
