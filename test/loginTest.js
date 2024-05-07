// loginTest.js

const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Login and Access Control Test", () => {
  it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/i3BoGr"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user1@example.com", password: "p" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/i3BoGr").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });

  it('should redirect GET request to "/" with status code 302 to "/login"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    return agent.get("/").then((res) => {
      expect(res).to.redirectTo("http://localhost:8080/login");
    });
  });

  it('should redirect GET request to "/urls/new" with status code 302 to "/login"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    return agent.get("/urls/new").then((res) => {
      expect(res).to.redirectTo("http://localhost:8080/login?error=Please%20login%20first%20to%20access%20that%20page.");
    });
  });

  it('should return status code 403 for GET request to "/urls/NOTEXISTS"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user1@example.com", password: "p" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a non-existent resource
        return agent.get("/urls/NOTEXISTS").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });
});