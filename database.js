// database.js

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
    longURL: "example.com",
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
    hashedPassword:
      "$2a$10$.IgPiVpfS0epKdTSITGImegbTOn0RoSQF7aJj1fQCg4ef90RkGZTW",
  },
  q0ju1d: {
    id: "q0ju1d",
    email: "user2@example.com",
    hashedPassword:
      "$2a$10$4.RsNwoi.RY5vj9VbOb06OVcs31fHASDr/HIGubimpqbu6WY9lhZq",
  },
  tra1dh: {
    id: "tra1dh",
    email: "somtoufondu@gmail.com",
    hashedPassword:
      "$2a$10$3r/AImilECJRH6AqGAteIuYq79PXVeh0Fd7A.C.WKAXLGYY3e.pYO",
  },
};

module.exports = { urlDatabase, users };

