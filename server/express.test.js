const request = require("supertest");

describe("Express Server Port Test", () => {
  test("Server should be listening on port 8000", async () => {
    // Try to connect to port 8000
    try {
      // Send a direct request to the port
      const response = await request("http://localhost:8000").get("/");

      // If we get any response (even an error), the server is running on port 8000
      expect(response).toBeDefined();
    } catch (error) {
      // If we get a connection error, handle it differently based on the type
      if (error.code === "ECONNREFUSED") {
        // This means nothing is running on port 8000
        throw new Error("No server running on port 8000");
      } else if (error.status) {
        // If we got a status code, even an error one, the server is running
        expect(error.status).toBeDefined();
      } else {
        // Unexpected error
        throw new Error(`Error connecting to server: ${error.message}`);
      }
    }
  });
});
