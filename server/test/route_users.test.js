"use strict"
const request = require("supertest")
const baseURL = "http://localhost:3000"

// Todo: start server before running tests
xdescribe('GET /api/version', function() {
    it('Should return OK', async () => {
        const response = await request(baseURL).get("/api/version");
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBe(null);
        console.log(response.body);
    });
});