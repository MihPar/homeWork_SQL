import request from "supertest";
import dotenv from "dotenv";
import { stopDb } from "../../db/db";
import mongoose from "mongoose";
import { HTTP_STATUS } from "../../utils/utils";
import { initApp } from "../../settings";
dotenv.config();

const app = initApp();

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
  beforeAll(async () => {
    await mongoose.connect(mongoURI);
    const wipeAllRes = await request(app).delete("/testing/all-data").send();
    expect(wipeAllRes.status).toBe(HTTP_STATUS.NO_CONTENT_204);
  });

  afterAll(async () => {
    await stopDb();
  });

  afterAll((done) => {
    done();
  });

  beforeEach(async () => {
    const wipeAllRes = await request(app).delete("/testing/all-data").send();
  });
  let token1: string
  let refreshToken: string
  describe("get security devices", () => {
    it("return all devices with action sessions for current user => return 200 status code", async () => {
      const user = {
        login: "Mickhail",
        password: "qwerty",
        email: "mpara7274@gmail.com",
      };
      const createUser = await request(app)
        .post("/users")
        .auth("admin", "qwerty")
        .send(user);
      expect(createUser.body).toEqual({
        id: expect.any(String),
        login: user.login,
        email: user.email,
        createdAt: expect.any(String),
      });

      const createAuthLogin = await request(app).post("/auth/login").send({
        loginOrEmail: user.login,
        password: user.password,
      });
      expect(createAuthLogin.status).toBe(HTTP_STATUS.OK_200);
      expect(createAuthLogin.body).toEqual({
        accessToken: expect.any(String),
      });
	  token1 = createAuthLogin.body.accessToken;
      const refreshToken = createAuthLogin.headers["set-cookie"][0];
      const getAllDevicesCurrentUser = await request(app)
        .get(`/security/devices`)
        .set("Cookie", `${refreshToken}`);

      expect(getAllDevicesCurrentUser.status).toBe(HTTP_STATUS.OK_200);
      expect(getAllDevicesCurrentUser.body).toStrictEqual([
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(Date),
          deviceId: expect.any(String),
        },
      ]);
    });
    it("return all devices with action sessions for current user without authorization => return 401 status code", async () => {
      const getAllDevicesCurrentUser = await request(app)
        .get(`/security/devices`)
        .set("Cookie", expect.any(String));

      expect(getAllDevicesCurrentUser.status).toBe(
        HTTP_STATUS.NOT_AUTHORIZATION_401
      );
    });
  });
  describe("delete security devices", () => {
    it("terminate all other device`s sessions => return 204 status code", async () => {
      const user = {
        login: "Mickhail",
        password: "qwerty",
        email: "mpara7274@gmail.com",
      };
      const createUser = await request(app)
        .post("/users")
        .auth("admin", "qwerty")
        .send(user);
      expect(createUser.body).toEqual({
        id: expect.any(String),
        login: user.login,
        email: user.email,
        createdAt: expect.any(String),
      });

      const createAuthLogin = await request(app).post("/auth/login").send({
        loginOrEmail: user.login,
        password: user.password,
      });
      expect(createAuthLogin.status).toBe(HTTP_STATUS.OK_200);
      expect(createAuthLogin.body).toEqual({
        accessToken: expect.any(String),
      });
      const refreshToken = createAuthLogin.headers["set-cookie"][0];
      const deleteAllSessions = await request(app)
        .delete("/security/devices")
        .set("Cookie", `${refreshToken}`);
      expect(deleteAllSessions.status).toBe(HTTP_STATUS.NO_CONTENT_204);
    });
    it("terminate all other device`s sessions without authorization => return 401 status code", async () => {
      const deleteAllSessionsUnauthorization = await request(app)
        .delete("/security/devices")
        .set("Cookie", expect.any(String));
      expect(deleteAllSessionsUnauthorization.status).toBe(
        HTTP_STATUS.NOT_AUTHORIZATION_401
      );
    });
  });
  describe("delete session by device of id", () => {
	let deviceId: string
	
    it("terminate specified device session => return 204 status code", async () => {
      const user = {
        login: "Mickhail",
        password: "qwerty",
        email: "mpara7274@gmail.com",
      };
      const createUser = await request(app)
        .post("/users")
        .auth("admin", "qwerty")
        .send(user);
      expect(createUser.body).toEqual({
        id: expect.any(String),
        login: user.login,
        email: user.email,
        createdAt: expect.any(String),
      });

      const createAuthLogin = await request(app).post("/auth/login").send({
        loginOrEmail: user.login,
        password: user.password,
      });
      expect(createAuthLogin.status).toBe(HTTP_STATUS.OK_200);
      expect(createAuthLogin.body).toEqual({
        accessToken: expect.any(String),
      });
      refreshToken = createAuthLogin.headers["set-cookie"][0];
      const getAllDevicesCurrentUser = await request(app)
        .get(`/security/devices`)
        .set("Cookie", `${refreshToken}`);

      expect(getAllDevicesCurrentUser.status).toBe(HTTP_STATUS.OK_200);
      expect(getAllDevicesCurrentUser.body).toStrictEqual([
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(Date),
          deviceId: expect.any(String),
        },
      ]);
      deviceId = getAllDevicesCurrentUser.body[0].deviceId;
      const deleteSpecifiedSession = await request(app)
        .delete(`/security/devices/${deviceId}`)
        .set("Cookie", `${refreshToken}`);
      expect(deleteSpecifiedSession.status).toBe(HTTP_STATUS.NO_CONTENT_204);
    });
	it("terminate specified device session without authorization => return 401 status code", async() => {
      const deleteSpecifiedSession = await request(app)
        .delete(`/security/devices/${deviceId}`)
        .set("Cookie", expect.any(String));
      expect(deleteSpecifiedSession.status).toBe(HTTP_STATUS.NOT_AUTHORIZATION_401);
	})
	it("terminate specified device session if delete the device the other user => return 403 status code", async() => {
		const createUserNext = await request(app)
        .post("/users")
        .auth("admin", "qwerty")
        .send({
          login: "Tatiana",
          password: "qwerty2",
          email: "2mpara7472@gmail.com",
        });
      expect(createUserNext.status).toBe(HTTP_STATUS.CREATED_201);
      expect(createUserNext.body).toEqual({
        id: expect.any(String),
        login: "Tatiana",
        email: "2mpara7472@gmail.com",
        createdAt: expect.any(String),
      });
      const loginOrEmail = createUserNext.body.login;
      const createAccessTokenNew = await request(app).post("/auth/login").send({
        loginOrEmail: loginOrEmail,
        password: "qwerty2",
      });
      expect(createAccessTokenNew.status).toBe(HTTP_STATUS.OK_200);
      expect(createAccessTokenNew.body).toEqual({
        accessToken: expect.any(String),
      });
      const token2 = createAccessTokenNew.body.accessToken;
	  const refreshToken2 = createAccessTokenNew.headers["set-cookie"][0];

	  const getAllDevicesCurrentUser = await request(app)
        .get(`/security/devices`)
        .set("Cookie", `${refreshToken2}`);

      expect(getAllDevicesCurrentUser.status).toBe(HTTP_STATUS.OK_200);
      expect(getAllDevicesCurrentUser.body).toStrictEqual([
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(Date),
          deviceId: expect.any(String),
        },
      ]);
	  const deviceId = getAllDevicesCurrentUser.body[0].deviceId;
	  const deleteSpecifiedSession = await request(app)
        .delete(`/security/devices/${deviceId}`)
        .set("Cookie", `${refreshToken2}`)
		// .set("Authorization", `Bearer ${token1}`)
		.set("UserId", `${createUserNext.body.id}`)
      expect(deleteSpecifiedSession.status).toBe(HTTP_STATUS.FORBIDEN_403);
	})
	it("terminate specified device session with incorrect input data => return 404 status code", async() => {
		const user = {
			login: "Mickhail",
			password: "qwerty",
			email: "mpara7274@gmail.com",
		  };
		  const createUser = await request(app)
			.post("/users")
			.auth("admin", "qwerty")
			.send(user);
		  expect(createUser.body).toEqual({
			id: expect.any(String),
			login: user.login,
			email: user.email,
			createdAt: expect.any(String),
		  });
		  const createAuthLogin = await request(app).post("/auth/login").send({
			loginOrEmail: user.login,
			password: user.password,
		  });
		  expect(createAuthLogin.status).toBe(HTTP_STATUS.OK_200);
		  expect(createAuthLogin.body).toEqual({
			accessToken: expect.any(String),
		  });
		  const refreshToken = createAuthLogin.headers["set-cookie"][0];
		  const getAllDevicesCurrentUser = await request(app)
			.get(`/security/devices`)
			.set("Cookie", `${refreshToken}`);
	
		  expect(getAllDevicesCurrentUser.status).toBe(HTTP_STATUS.OK_200);
		  expect(getAllDevicesCurrentUser.body).toStrictEqual([
			{
			  ip: expect.any(String),
			  title: expect.any(String),
			  lastActiveDate: expect.any(Date),
			  deviceId: expect.any(String),
			},
		  ]);
		  const deviceId = getAllDevicesCurrentUser.body[0].deviceId;

		const deleteSpecifiedSession = await request(app)
        .delete(`/security/devices/123456789012345678901234`)
        .set("Cookie", `${refreshToken}`);
      expect(deleteSpecifiedSession.status).toBe(HTTP_STATUS.NOT_FOUND_404);
	})
  });
});
