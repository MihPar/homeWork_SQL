import request from "supertest";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { UserViewType } from "../../../src/api/users/user.type";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../src/modules/app.module";
import { appSettings } from "../../../src/setting";
import { HTTP_STATUS } from "../../../src/utils/utils";
import { AuthController } from "../../../src/api/auth/auth.controller";
import { NewPasswordUseCase } from "../../../src/api/users/use-case/createNewPassword-use-case";
import { aDescribe } from "../../../src/helpers/helpers";

dotenv.config();

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

describe("/auth", () => {

	let app: INestApplication
  	// let httpServer: any
  	let server: any

  beforeAll(async () => {
    // const moduleFixture: TestingModule = await Test.createTestingModule({imports: [AppModule]}).compile()
    // app = moduleFixture.createNestApplication()
    // appSettings(app)
    // await app.init()
    // httpServer = app.getHttpServer()


	// const fooMock = () => { return  true }
	const fooMock = () => {
    sendMessage: jest.fn().mockImplementation(async () => {
      console.log('Call mock create new password');
      return true;
    });
  };
	// class MockClass {
	// 	sendMessage: () => true
	// }
	class MockClass {
		constructor(
			private newPasswordUseCase: NewPasswordUseCase
		) {}
		sendMessage: () => true
	}



    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).overrideProvider(NewPasswordUseCase)
	//   .useValue(fooMock)
	//   .useClass(MockClass)
	  .useFactory({
		factory: (userCase: NewPasswordUseCase) => {
			return new MockClass(userCase)
		},
		inject: [NewPasswordUseCase]
	  })
	  .compile();

    app = moduleFixture.createNestApplication();
    appSettings(app);
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
	await app.close()
  });

  afterAll((done) => {
    done();
  });

  const authValidationErrRes = {
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
  describe("/auth/login", () => {
    type UserType = {
      login: string;
      password: string;
      email: string;
    };
    let createUser: UserViewType;
    let user: UserType;
    it("try login user to the system => return 200 status code", async () => {
      user = {
        login: "Michail",
        password: "qwerty",
        email: "mpara7472@gmail.com",
      };
      const resultOfUserCreation = await request(app)
        .post("/users")
        .auth("admin", "qwerty")
        .send(user);
      createUser = resultOfUserCreation.body;

      expect(resultOfUserCreation.status).toBe(HttpStatus.CREATED);
      expect(createUser).toEqual({
        id: expect.any(String),
        login: user.login,
        email: user.email,
        createdAt: expect.any(String),
      });
      const createAuthLogin = await request(app).post("/auth/login").send({
        loginOrEmail: createUser.login,
        password: user.password,
      });
      expect(createAuthLogin.status).toBe(HttpStatus.OK);
      expect(createAuthLogin.body).toEqual({
        accessToken: expect.any(String),
      });
    });
    it("try user login to the system with incorrect inpute data => return 400 staus code", async () => {
      const user = {
        login: "Michail",
        password: "qwerty",
        email: "mpara7472@gmail.com",
      };
      const resultOfUserCreation = await request(app)
        .post("/users")
        .auth("admin", "qwerty")
        .send(user);

      expect(resultOfUserCreation.status).toBe(HttpStatus.CREATED);
      expect(resultOfUserCreation.body).toEqual({
        id: expect.any(String),
        login: user.login,
        email: user.email,
        createdAt: expect.any(String),
      });
      const createAuthLogin = await request(app).post("/auth/login").send({
        loginOrEmail: "Tatiana",
        password: 123,
      });
      expect(createAuthLogin.status).toBe(HttpStatus.BAD_REQUEST);
      //   expect(createAuthLogin.body).toStrictEqual(createErrorsMessageTest(["loginOrEmail", "password"]))
    });

    it("try user login to the system without authorization => return 401 staus code", async () => {
      const createAuthLogin = await request(app)
	  .post("/auth/login")
	  .send({
        loginOrEmail: "Tatiana",
        password: "qwerty1",
      });
      expect(createAuthLogin.status).toBe(HttpStatus.UNAUTHORIZED);
    });
    it("try login user to the system if more than 5 attempts from one IP-address during 10 seconds", async () => {
      const createAuthLogin = await request(app).post("/auth/login").send({
        loginOrEmail: "skdjfkdsajf",
        password: "slslslsl",
      });
      expect(createAuthLogin.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });
  });
  describe("/auth/password-recovery", () => {
    let createUser: UserViewType;
    it("create pasword recovery email confirmatioin => return 204 status code", async () => {
      const user = {
        login: "Michail",
        password: "qwerty",
        email: "mpara7472@gmail.com",
      };
      const resultOfUserCreation = await request(app)
        .post("/users")
        .auth("admin", "qwerty")
        .send(user);
      createUser = resultOfUserCreation.body;

      expect(resultOfUserCreation.status).toBe(HttpStatus.CREATED);
      expect(createUser).toEqual({
        id: expect.any(String),
        login: user.login,
        email: user.email,
        createdAt: expect.any(String),
      });
      const createAuthLogin = await request(app).post("/auth/login").send({
        loginOrEmail: createUser.login,
        password: user.password,
      });
      expect(createAuthLogin.status).toBe(HttpStatus.OK);
      expect(createAuthLogin.body).toEqual({
        accessToken: expect.any(String),
      });
      const passwordRecovery = await request(app)
        .post("/auth/password-recovery")
        .send({
          email: "mpara7274@gmail.com",
        });
      expect(passwordRecovery.status).toBe(HttpStatus.NO_CONTENT);
    });
    it("create pasword recovery email confirmatioin with incorrect input data => return 400 status code", async () => {
      const passwordRecovery = await request(app)
        .post("/auth/password-recovery")
        .send({
          email: "mpara72mail.com",
        });
      expect(passwordRecovery.status).toBe(HttpStatus.BAD_REQUEST);
      expect(passwordRecovery.body).toEqual(createErrorsMessageTest(["email"]));
    });
    it("create password recovery code confirmation if more than 5 attempts from one IP-address during 10 seconds", async () => {
      const passwordRecovery = await request(app)
        .post("/auth/password-recovery")
        .send({
          email: "7274@gmail.com",
        });
      expect(passwordRecovery.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });
  });

  describe("/auth/new-password", () => {
    let createUser: UserViewType;
    it("create new password with input data is correct => return 204 status code", async () => {
      const user = {
        login: "Michail",
        password: "qwerty",
        email: "mpara7472@gmail.com",
      };
      const resultOfUserCreation = await request(app)
        .post("/users")
        .auth("admin", "qwerty")
        .send(user);
      createUser = resultOfUserCreation.body;

      expect(resultOfUserCreation.status).toBe(HttpStatus.CREATED);
      expect(createUser).toEqual({
        id: expect.any(String),
        login: user.login,
        email: user.email,
        createdAt: expect.any(String),
      });
      const createAuthLogin = await request(app).post("/auth/login").send({
        loginOrEmail: createUser.login,
        password: user.password,
      });
      expect(createAuthLogin.status).toBe(HttpStatus.OK);
      expect(createAuthLogin.body).toEqual({
        accessToken: expect.any(String),
      });
      //   const recoveryCode = uuidv4();
      const passwordRecovery = await request(app)
        .post("/auth/password-recovery")
        .send({
          email: "mpara7274@gmail.com",
        });
      expect(passwordRecovery.status).toBe(HttpStatus.NO_CONTENT);
      // const recoveryCode = passwordRecovery.body.code
      const newPassword = await request(app).post("/auth/new-password").send({
        newPassword: "qwertyNew",
        recoveryCode: "",
      });
      expect(newPassword.status).toBe(HttpStatus.NO_CONTENT);
    });

    it("create new password with input data is incorrect => return 400 status code", async () => {
      const newPassword = await request(app).post("/auth/new-password").send({
        newPassword: true,
        recoveryCode: 123,
      });
      expect(newPassword.status).toBe(HttpStatus.BAD_REQUEST);
      expect(newPassword.body).toEqual(
        createErrorsMessageTest(["newPassword", "recoveryCode"])
      );
    });
    it("create new password with incorrent input data more than 5 attemption in during 10 seconds", async () => {
      const newPassword = await request(app).post("/auth/new-password").send({
        newPassword: true,
        recoveryCode: 123,
      });
      expect(newPassword.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });
  });

    describe("/auth/refresh-token", () => {
      type UserType = {
        login: string
        password: string
        email: string
      };
  	type CreateAuthLogin = {
  		accessToken: string
  	}
      let createUser: UserViewType;
      let user: UserType;
  	let authLogin: CreateAuthLogin
      it("generata new pair of access token and refresh token => return 200 status code", async () => {
        user = {
          login: "Michail",
          password: "qwerty",
          email: "mpara7472@gmail.com",
        };
        const resultOfUserCreation = await request(app)
          .post("/users")
          .auth("admin", "qwerty")
          .send(user);
        createUser = resultOfUserCreation.body;

        expect(resultOfUserCreation.status).toBe(HttpStatus.CREATED);
        expect(createUser).toEqual({
          id: expect.any(String),
          login: user.login,
          email: user.email,
          createdAt: expect.any(String),
        });
        const createAuthLogin = await request(app).post("/auth/login").send({
          loginOrEmail: createUser.login,
          password: user.password,
        });

  	  authLogin = createAuthLogin.body
        expect(createAuthLogin.status).toBe(HttpStatus.OK);
        expect(authLogin).toEqual({
          accessToken: expect.any(String),
        });
        const refreshToken = createAuthLogin.headers["set-cookie"][0];

        const createRefreshToken = await request(app)
          .post("/auth/refresh-token")
          .set("Cookie", `${refreshToken}`);
        expect(createRefreshToken.status).toBe(HttpStatus.OK);

        expect(createRefreshToken.body).toEqual({
          accessToken: expect.any(String),
        });
        expect(createRefreshToken.headers["set-cookie"][0]).toEqual(
          expect.any(String)
        );
        expect(createRefreshToken.body).not.toEqual(
          createAuthLogin.body.accessToken
        );
        expect(createRefreshToken.headers["set-cookie"][0]).not.toEqual(
          createAuthLogin.headers["set-cookie"][0]
        );
      });

  	it("generata new pair of access token and refresh token if JWT token incorrect => return 401 status code", async () => {
          const refreshToken = expect.any(String)
          const createRefreshToken = await request(app)
            .post("/auth/refresh-token")
            .set("Cookie", `${refreshToken}`);
          expect(createRefreshToken.status).toBe(HttpStatus.UNAUTHORIZED);
        });
    });
  describe("/auth/registration", () => {
    type UserType = {
      login: string;
      password: string;
      email: string;
    };
    type CreateAuthLogin = {
      accessToken: string;
    };
    let createUser: UserViewType;
    let user: UserType;
    let authLogin: CreateAuthLogin;
    it("registration in system => return 204 status code", async () => {
      user = {
        login: "Michail",
        password: "qwerty",
        email: "mpara7472@gmail.com",
      };
      const resultOfUserCreation = await request(app)
        .post("/users")
        .auth("admin", "qwerty")
        .send(user);
      createUser = resultOfUserCreation.body;

      expect(resultOfUserCreation.status).toBe(HttpStatus.CREATED);
      expect(createUser).toEqual({
        id: expect.any(String),
        login: user.login,
        email: user.email,
        createdAt: expect.any(String),
      });
      const createAuthLogin = await request(app).post("/auth/login").send({
        loginOrEmail: createUser.login,
        password: user.password,
      });

      authLogin = createAuthLogin.body;
      expect(createAuthLogin.status).toBe(HttpStatus.OK);
      expect(authLogin).toEqual({
        accessToken: expect.any(String),
      });

      const registration = await request(app)
	  .post("/auth/registration")
	  .send({
        login: user.login,
        password: user.password,
        email: user.email,
      });
      expect(registration.status).toBe(HttpStatus.NO_CONTENT);
    });
  });

  describe("/auth/registration-confirmationi", () => {
    type UserType = {
      login: string;
      password: string;
      email: string;
    };
    type CreateAuthLogin = {
      accessToken: string;
    };
    let createUser: UserViewType;
    let user: UserType;
    let authLogin: CreateAuthLogin;
    it("confirmation registration => return 204 status code", async () => {
      user = {
        login: "Michail",
        password: "qwerty",
        email: "mpara7472@gmail.com",
      };
      const resultOfUserCreation = await request(app)
        .post("/users")
        .auth("admin", "qwerty")
        .send(user);
      createUser = resultOfUserCreation.body;

      expect(resultOfUserCreation.status).toBe(HttpStatus.CREATED);
      expect(createUser).toEqual({
        id: expect.any(String),
        login: user.login,
        email: user.email,
        createdAt: expect.any(String),
      });
      const createAuthLogin = await request(app).post("/auth/login").send({
        loginOrEmail: createUser.login,
        password: user.password,
      });

      authLogin = createAuthLogin.body;
      expect(createAuthLogin.status).toBe(HttpStatus.OK);
      expect(authLogin).toEqual({
        accessToken: expect.any(String),
      });
      const recoveryCode = uuidv4();
      const registrationConfirmationCode = await request(app)
        .post("/auth/registration-confirmation")
        .send({
          code: recoveryCode,
        });
      expect(registrationConfirmationCode.status).toBe(
        HttpStatus.NO_CONTENT
      );
    });
  });
  describe("/auth/registration-email-resendign", () => {
	type UserType = {
		login: string;
		password: string;
		email: string;
	  };
	  type CreateAuthLogin = {
		accessToken: string;
	  };
	  let createUser: UserViewType;
	  let user: UserType;
	  let authLogin: CreateAuthLogin;
	it("resend confirmation registration if user exists => return 204 status code", async() => {
		user = {
			login: "Michail",
			password: "qwerty",
			email: "mpara7472@gmail.com",
		  };
		  const resultOfUserCreation = await request(app)
			.post("/users")
			.auth("admin", "qwerty")
			.send(user);
		  createUser = resultOfUserCreation.body;
	
		  expect(resultOfUserCreation.status).toBe(HttpStatus.CREATED);
		  expect(createUser).toEqual({
			id: expect.any(String),
			login: user.login,
			email: user.email,
			createdAt: expect.any(String),
		  });
		  const createAuthLogin = await request(app).post("/auth/login").send({
			loginOrEmail: createUser.login,
			password: user.password,
		  });
	
		  authLogin = createAuthLogin.body;
		  expect(createAuthLogin.status).toBe(HttpStatus.OK);
		  expect(authLogin).toEqual({
			accessToken: expect.any(String),
		  });
		  const resendEmailForConfirmation = await request(app)
		  .post("/auth/registration-email-resendign")
		  .send({
			"email": "mpara7274@gmail.com"
		  })
		  expect(resendEmailForConfirmation.status).toBe(HttpStatus.CREATED)
	})
  })
  aDescribe(true) ("/auth/logout", () => {
	it("in cookie client must send correct refresh token that will be revoked => return 204 status code", async() => {

	})
  })
  describe("/auth/me", () => {
	type UserType = {
		login: string;
		password: string;
		email: string;
	  };
	  type CreateAuthLogin = {
		accessToken: string;
	  };
	  let createUser: UserViewType;
	  let user: UserType;
	  let authLogin: CreateAuthLogin;
	it("get information about current user => return 200 status code", async() => {
		user = {
			login: "Michail",
			password: "qwerty",
			email: "mpara7472@gmail.com",
		  };
		  const resultOfUserCreation = await request(app)
			.post("/users")
			.auth("admin", "qwerty")
			.send(user);
		  createUser = resultOfUserCreation.body;
	
		  expect(resultOfUserCreation.status).toBe(HttpStatus.CREATED);
		  expect(createUser).toEqual({
			id: expect.any(String),
			login: user.login,
			email: user.email,
			createdAt: expect.any(String),
		  });
		  const createAuthLogin = await request(app).post("/auth/login").send({
			loginOrEmail: createUser.login,
			password: user.password,
		  });
	
		  authLogin = createAuthLogin.body;
		  expect(createAuthLogin.status).toBe(HttpStatus.OK);
		  expect(authLogin).toEqual({
			accessToken: expect.any(String),
		  });

		const informationUser = await request(app)
		.get("/auth/me")
		.set("Authorization", `Bearer ${authLogin.accessToken}`)

		expect(informationUser.status).toBe(HttpStatus.OK)
		expect(informationUser.body).toEqual({
			"email": user.email,
			"login": user.login,
			"userId": createUser.id
		})
	})
	it("get information about current user without authorization => return 401 status code", async() => {
		const withoutAuthorization = await request(app)
		.get("/auth/me")
		expect(withoutAuthorization.status).toBe(HttpStatus.UNAUTHORIZED)
	})
  })
});
