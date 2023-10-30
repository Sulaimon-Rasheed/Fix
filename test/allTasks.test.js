const supertest = require('supertest');
const app = require('../app');
const { connect } = require('./database');
const taskModel = require("../models/task")
const UserModel = require('../models/user');

describe('Authentication Tests', () => {
    let connection
    let token;
    // before hook
    beforeAll(async () => {
        connection = await connect()
        
    })

    beforeEach(async ()=>{
        await UserModel.create({
            username: "Sulaimon",
            password: "altschool123",
              
          });
  
          const response = await supertest(app)
          .post('/users/login')
          .type('form')
          .send({
            username: "Sulaimon",
            password: "altschool123",
          })

          token = response.body.token
    })

    afterEach(async () => {
        await connection.cleanup()
    })
    
    // after hook
    afterAll(async () => {
        await connection.disconnect()
    })


describe('tasks endpoint', () => {
    
    it('should render the tasks page', async ()=> {
        await taskModel.create({
         task_name: "Read a book",
         state:"pending",
         user_id:"652deb9af1382be99a38fb4f"   
        });
        const response = await supertest(app).get('/dashboard').set('content-type', 'text/html')
        .set('Cookie', token)
      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
      expect(response.text).toContain("Read a book");
    });
  
  });

})