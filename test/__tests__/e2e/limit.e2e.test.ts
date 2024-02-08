// import { initApp } from "../../settings";
// import request from "supertest";
// import dotenv from "dotenv";
// import { runDb, stopDb } from "../../db/db";
// import mongoose from 'mongoose'

// dotenv.config();

// const mongoURI = process.env.mongoURI || "mongodb://0.0.0.0:27017";
// let dbName = process.env.mongoDBName || 'mongoose-example'

// const app = initApp()



// describe('Testing rate limit middleware', () => {
// 	jest.setTimeout(60000)
// 	beforeAll(async () => {
		
// 	await runDb();
//   	await request(app).delete('/testing/all-data').expect(204)
// 	await mongoose.connect(mongoURI + '/' + dbName)
// 	})

// 	it('should return 429 after 6 calls to login and 400 after waiting', async() => {
// // first call
// await request(app).post('/auth/login').expect(400)

// //second call
// await request(app).post('/auth/login').expect(400)

// //third call
// await request(app).post('/auth/login').expect(400)
// //fourth call
// await request(app).post('/auth/login').expect(400)
// //fifth call
// await request(app).post('/auth/login').expect(400)
// //sixth call
// await request(app).post('/auth/login').expect(429)

// 	})

// 	afterAll(async () => {
// 	  await stopDb();
// 	  await mongoose.connection.close()
// });
// 	  afterAll((done) => {
// 		done()
// 	  })
	
// })