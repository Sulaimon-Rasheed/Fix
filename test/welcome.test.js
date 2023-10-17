const app = require("../app")
const supertest = require("supertest")

describe("Index route", ()=>{
    it("should respond with an HTML page", async ()=>{
        const response = await supertest(app).get("/").set("content-type", "text/html")

        expect(response.status).toEqual(200)
    })

    it("should resond with an HTML page if the route does not exist", async()=>{
        const response = await supertest(app).get("/undefined").set("content-type", "text/html")
        expect(response.status).toEqual(404)
    })
})