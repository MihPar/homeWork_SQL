import request from "supertest";
import dotenv from "dotenv";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../src/modules/app.module";
import { appSettings } from "../../../../src/setting";
import { HTTP_STATUS } from "../../../../src/utils/utils";
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

//   beforeEach(async () => {
//     const wipeAllRes = await request(app).delete("/testing/all-data").send();
//   });


  describe("POST -> /posts: should create new post for an existing blog; status 201; content: created post; used additional methods: POST -> /blogs, GET -> /posts/:id", () => {
    type PostType = {
      id: string;
      title: string;
      shortDescription: string;
      content: string;
      blogId: string;
      blogName: string;
      createdAt: string;
    };
    let id: string;
    let token: string;
    let postData: PostType;
    let blogName: string;
	let userLogin: string
	let userId: string
    it("create new user, create blog, create post => return 201 status code", async () => {
      const user = {
        login: "Mickle",
        password: "qwerty",
        email: "mpara7473@gmail.com",
      };
      const createUser = await request(server)
        .post(`/users`)
        .auth("admin", "qwerty")
        .send(user);

		userLogin = createUser.body.login
		userId = createUser.body.id
      expect(createUser.body).toStrictEqual({
        id: expect.any(String),
        login: user.login,
        email: user.email,
        createdAt: expect.any(String),
      });
      const createAccessToken = await request(app).post("/auth/login").send({
        loginOrEmail: user.login,
        password: user.password,
      });

      token = createAccessToken.body.accessToken;
      expect(createAccessToken.status).toBe(HTTP_STATUS.OK_200);
      expect(createAccessToken.body).toEqual({
        accessToken: expect.any(String),
      });

      const createBlogs = await request(server)
        .post("/blogs")
        .auth("admin", "qwerty")
        .send({
          name: "Mickle",
          description: "my description",
          websiteUrl: "https://learn.javascript.ru",
        });
      expect(createBlogs.status).toBe(HTTP_STATUS.CREATED_201);
      expect(createBlogs.body).toEqual({
        id: expect.any(String),
        name: "Mickle",
        description: "my description",
        websiteUrl: "https://learn.javascript.ru",
        createdAt: expect.any(String),
        isMembership: true,
      });

      const blogId = createBlogs.body.id;
      blogName = createBlogs.body.name;

      const createPosts = await request(server)
        .post("/posts")
        .auth("admin", "qwerty")
        .send({
          title: "new title",
          shortDescription: "new shortDescription",
          content:
            "myContent I like javascript and I will be a developer in javascript, back end developer",
          blogId: blogId,
        });

      id = createPosts.body.id;
      postData = createPosts.body;
	//   console.log(postData)
      expect(createPosts.status).toBe(HTTP_STATUS.CREATED_201);
      expect(postData).toEqual({
        id: expect.any(String),
        title: createPosts.body.title,
        shortDescription: createPosts.body.shortDescription,
        content: createPosts.body.content,
        blogId: blogId,
        blogName: blogName,
        createdAt: expect.any(String),
		extendedLikesInfo: {
			"likesCount": 0,
			"dislikesCount": 0,
			"myStatus": "None",
			"newestLikes": [
			//   {
			// 	"addedAt": expect.any(String),
			// 	"userId": userId,
			// 	"login": userLogin
			//   }
			]
		  }
      });
	  const getPostById = await request(server)
	  .get(`/posts/${id}`)
	  .set("Authorization", `Bearer ${token}`);

	  console.log(getPostById.body)
	expect(getPostById.status).toBe(HTTP_STATUS.OK_200);
	expect(getPostById.body).toStrictEqual({
	  id: id,
	  title: postData.title,
	  shortDescription: postData.shortDescription,
	  content: postData.content,
	  blogId: postData.blogId,
	  blogName: blogName,
	  createdAt: expect.any(String),
	  extendedLikesInfo: {
		  "likesCount": 0,
		  "dislikesCount": 0,
		  "myStatus": "None",
		  "newestLikes": [
		  //   {
		  // 	"addedAt": expect.any(String),
		  // 	"userId": userId,
		  // 	"login": userLogin
		  //   }
		  ]
		}
	});
    });
    // it("get post by id => return 200 status code", async () => {
    //   const getPostById = await request(server)
    //     .get(`/posts/${id}`)
    //     .set("Authorization", `Bearer ${token}`);
    //   expect(getPostById.status).toBe(HTTP_STATUS.OK_200);
    //   expect(getPostById.body).toStrictEqual({
    //     id: id,
    //     title: postData.title,
    //     shortDescription: postData.shortDescription,
    //     content: postData.content,
    //     blogId: postData.blogId,
    //     blogName: blogName,
    //     createdAt: expect.any(String),
	// 	extendedLikesInfo: {
	// 		"likesCount": 0,
	// 		"dislikesCount": 0,
	// 		"myStatus": "None",
	// 		"newestLikes": [
	// 		//   {
	// 		// 	"addedAt": expect.any(String),
	// 		// 	"userId": userId,
	// 		// 	"login": userLogin
	// 		//   }
	// 		]
	// 	  }
    //   });
    // });
  });
});
