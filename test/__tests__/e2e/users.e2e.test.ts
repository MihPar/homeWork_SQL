import request from "supertest";
import dotenv from "dotenv";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../src/app.module";
import { appSettings } from "../../../src/setting";
import { HTTP_STATUS } from "../../../src/utils/utils";
import { UserViewType } from "../../../src/api/users/user.type";
dotenv.config();

const mongoURI = process.env.MONGO_URL || "mongodb://0.0.0.0:27017";
let dbName = process.env.mongoDBName || "mongoose-example";


export function createErrorsMessageTest(fields: string[]) {
  const errorsMessages: any = [];
  for (const field of fields) {
    errorsMessages.push({
      message: expect.any(String),
      field: field ?? expect.any(String),
    });
  }
  return { errorsMessages: errorsMessages };
}

describe("/blogs", () => {
	let app: INestApplication;
	let server: any;
  beforeAll(async () => {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	  }).compile();
  
	  app = moduleFixture.createNestApplication();
	  appSettings(app);
  
	  await app.init();
	  server = app.getHttpServer();

    const wipeAllRes = await request(server).delete("/testing/all-data").send();
    expect(wipeAllRes.status).toBe(HTTP_STATUS.NO_CONTENT_204);
  });

  afterAll(async () => {
    await app.close();
  });

  afterAll((done) => {
    done();
  });
  const blogsValidationErrRes = {
    errorsMessages: expect.arrayContaining([
      {
        message: expect.any(String),
        field: "name",
      },
      {
        message: expect.any(String),
        field: "description",
      },
      {
        message: expect.any(String),
        field: "websiteUrl",
      },
    ]),
  };

    beforeEach(async () => {
      const wipeAllRes = await request(app).delete("/testing/all-data").send();
    });

  describe("add new user to the system", () => {
	let createUser: UserViewType;
    it("should create new user with correct input data => return status 201", async () => {
      const user = {
        login: "qwerty",
        password: "string",
        email: "mpara7473@gmail.com",
      };
      const resultOfUserCreation = await request(app)
        .post("/users")
        .auth("admin", "qwerty")
        .send(user);
      createUser = resultOfUserCreation.body;
	//   console.log(createUser.id)

      expect(resultOfUserCreation.status).toBe(HTTP_STATUS.CREATED_201);
      expect(createUser).toEqual({
        id: expect.any(String),
        login: user.login,
        email: user.email,
        createdAt: expect.any(String),
      });
    });
    it("should create new user without correct input data => return 400 status code", async () => {
      const user = {
        login: true,
        password: 123,
        email: true,
      };
      const resultOfUserCreation = await request(app)
        .post("/users")
		.auth("admin", "qwerty")
        .send(user);
      createUser = resultOfUserCreation.body;
      expect(resultOfUserCreation.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
	  expect(createUser).toStrictEqual(
		createErrorsMessageTest(["login", "password", "email"])
	  );
    });
	it("should create new user without authorization => return 401 status code", async () => {
		const user = {
			login: "qwerty",
			password: "string",
			email: "mpara7473@gmail.com",
		};
		const resultOfUserCreation = await request(app)
		  .post("/users")
		  .send(user);
		createUser = resultOfUserCreation.body;
		expect(resultOfUserCreation.status).toBe(HTTP_STATUS.NOT_AUTHORIZATION_401);
		
	  });
  });
  describe("return all users", () => {
    it("get all users with correct input data => return 200 status code", async () => {
      const user = {
        login: "qwerty",
        password: "string",
        email: "mpara7473@gmail.com",
      };
      const resultOfUserCreation = await request(app)
        .post("/users")
        .auth("admin", "qwerty")
        .send(user);
		// console.log(resultOfUserCreation.body.id)

      const id = resultOfUserCreation.body.id;
      const login = resultOfUserCreation.body.login;
      const email = resultOfUserCreation.body.email;

      let sortBy = "createdAt";
      let sortDirection = "desc";
      let pageNumber = "1";
      let pageSize = 50;
      let searchLoginTerm = "";
      let searchEmailTerm = "";
      const findUser = await request(app)
        .get(
          `/users?sortBy=${sortBy}&sortDirection=${sortDirection}&pageNumber=${pageNumber}&pageSize=${pageSize}&searchLoginTerm=${searchLoginTerm}&searchEmailTerm=${searchEmailTerm}`
        )
        .auth("admin", "qwerty");
		console.log(findUser.body.items)
      expect(findUser.status).toBe(HTTP_STATUS.OK_200);
	  expect(findUser.body.pagesCount).toEqual(1)
	  expect(findUser.body.page).toEqual(1)
	  expect(findUser.body.pageSize).toEqual(50)
	  expect(findUser.body.totalCount).toEqual(1)
	  expect(findUser.body.items).toEqual(
		[
          {
            id: id,
            login: login,
            email: email,
            createdAt: expect.any(String),
          },
        ],
      )
    });
	it("get all users without authorization => return 401 status code", async () => {
		let sortBy = "createdAt";
		let sortDirection = "desc";
		let pageNumber = "1";
		let pageSize = 50;
		let searchLoginTerm = null;
		let searchEmailTerm = null;
		const findUser = await request(app)
		  .get(
			`/users?sortBy=${sortBy}&sortDirection=${sortDirection}&pageNumber=${pageNumber}&pageSize=${pageSize}&searchLoginTerm=${searchLoginTerm}&searchEmailTerm=${searchEmailTerm}`
		  )
		expect(findUser.status).toBe(HTTP_STATUS.NOT_AUTHORIZATION_401);
	  });
  });

  describe("delete user specified by id", () => {
	let id: string
	it("delete user with correct input data => return 204 status code", async() => {
		const user = {
			login: "qwerty",
			password: "string",
			email: "mpara7473@gmail.com",
		  };
		  const resultOfUserCreation = await request(app)
			.post("/users")
			.auth("admin", "qwerty")
			.send(user);
	
		  id = resultOfUserCreation.body.id;
		  const login = resultOfUserCreation.body.login;
		  const email = resultOfUserCreation.body.email;
		const deleteUserById = await request(app)
		.delete(`/users/${id}`)
		.auth("admin", "qwerty")
		expect(deleteUserById.status).toBe(HTTP_STATUS.NO_CONTENT_204)
	})
	it("delete user without authorization => return 401 status code", async() => {
		const deleteUserById = await request(app)
		.delete(`/users/${id}`)
		expect(deleteUserById.status).toBe(HTTP_STATUS.NOT_AUTHORIZATION_401)
	})
	it("delete user with incorrect input data => return 404 status code", async() => {
		const deleteUserById = await request(app)
		.delete(`/users`)
		.auth("admin", "qwerty")
		expect(deleteUserById.status).toBe(HTTP_STATUS.NOT_FOUND_404)
	})
  })
});
