import request from "supertest";
import dotenv from "dotenv";
import { stopDb } from "../../../db/db";
import mongoose from "mongoose";
import { HTTP_STATUS } from "../../../utils/utils";
import { initApp } from "../../../settings";
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
    let userLogin: string;
    let userId: string;
	let blogIdAllPost: string
    it("create new user, create blog, create post => return 201 status code", async () => {

		/***************************** create user1 ********************************************/
      const user = {
        login: "Mickle",
        password: "qwerty",
        email: "mpara7473@gmail.com",
      };
      const createUser = await request(app)
        .post(`/users`)
        .auth("admin", "qwerty")
        .send(user);

      userLogin = createUser.body.login;
      userId = createUser.body.id;
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

		/***************************** create user2 ********************************************/

		const createUser2 = await request(app)
        .post(`/users`)
        .auth("admin", "qwerty")
        .send({
			login: "1Mickle",
			password: "1qwerty",
			email: "1mpara7473@gmail.com",
		  });

		  const createAccessToken2 = await request(app).post("/auth/login").send({
			loginOrEmail: user.login,
			password: user.password,
		  });

		/***************************** create user3 ********************************************/

		const createUser3 = await request(app)
        .post(`/users`)
        .auth("admin", "qwerty")
        .send({
			login: "1Mickle",
			password: "1qwerty",
			email: "1mpara7473@gmail.com",
		  });

		  const createAccessToken3 = await request(app).post("/auth/login").send({
			loginOrEmail: user.login,
			password: user.password,
		  });

		/***************************** create user3 ********************************************/

		const createUser4 = await request(app)
        .post(`/users`)
        .auth("admin", "qwerty")
        .send({
			login: "1Mickle",
			password: "1qwerty",
			email: "1mpara7473@gmail.com",
		  });

		  const createAccessToken4 = await request(app).post("/auth/login").send({
			loginOrEmail: user.login,
			password: user.password,
		  });

		/***************************** create user3 ********************************************/

		const createUser5 = await request(app)
        .post(`/users`)
        .auth("admin", "qwerty")
        .send({
			login: "1Mickle",
			password: "1qwerty",
			email: "1mpara7473@gmail.com",
		  });

		  const createAccessToken5 = await request(app).post("/auth/login").send({
			loginOrEmail: user.login,
			password: user.password,
		  });

		/***************************** create user3 ********************************************/

		const createUser6 = await request(app)
        .post(`/users`)
        .auth("admin", "qwerty")
        .send({
			login: "1Mickle",
			password: "1qwerty",
			email: "1mpara7473@gmail.com",
		  });

		  const createAccessToken6 = await request(app).post("/auth/login").send({
			loginOrEmail: user.login,
			password: user.password,
		  });

		/***************************** create blogs ********************************************/


      const createBlogs = await request(app)
        .post("/blogs")
        .auth("admin", "qwerty")
        .send({
          name: "Mickle",
          description: "my description",
          websiteUrl: "https://learn.javascript.ru",
        });
		blogIdAllPost = createBlogs.body.id
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

      const createPosts1 = await request(app)
        .post("/posts")
        .auth("admin", "qwerty")
        .send({
          title: "new title",
          shortDescription: "new shortDescription",
          content:
            "myContent I like javascript and I will be a developer in javascript, back end developer",
          blogId: blogId,
        });

      id = createPosts1.body.id;
      postData = createPosts1.body;
      //   console.log(postData)
      expect(createPosts1.status).toBe(HTTP_STATUS.CREATED_201);
      expect(postData).toEqual({
        id: expect.any(String),
        title: createPosts1.body.title,
        shortDescription: createPosts1.body.shortDescription,
        content: createPosts1.body.content,
        blogId: blogId,
        blogName: blogName,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: "None",
          newestLikes: [
            //   {
            // 	"addedAt": expect.any(String),
            // 	"userId": userId,
            // 	"login": userLogin
            //   }
          ],
        },
      })

	  const  createPosts2 = await request(app)
        .post("/posts")
        .auth("admin", "qwerty")
        .send({
          title: "2new title",
          shortDescription: "2new shortDescription",
          content:
            "2myContent I like javascript and I will be a developer in javascript, back end developer",
          blogId: blogId,
        })

		const  createPosts3 = await request(app)
        .post("/posts")
        .auth("admin", "qwerty")
        .send({
          title: "3new title",
          shortDescription: "3new shortDescription",
          content:
            "3myContent I like javascript and I will be a developer in javascript, back end developer",
          blogId: blogId,
        })


		const  createPosts4 = await request(app)
        .post("/posts")
        .auth("admin", "qwerty")
        .send({
          title: "4new title",
          shortDescription: "4new shortDescription",
          content:
            "4myContent I like javascript and I will be a developer in javascript, back end developer",
          blogId: blogId,
        })

		const  createPosts5 = await request(app)
        .post("/posts")
        .auth("admin", "qwerty")
        .send({
          title: "5new title",
          shortDescription: "5new shortDescription",
          content:
            "5myContent I like javascript and I will be a developer in javascript, back end developer",
          blogId: blogId,
        })

		const  createPosts6 = await request(app)
        .post("/posts")
        .auth("admin", "qwerty")
        .send({
          title: "6new title",
          shortDescription: "6new shortDescription",
          content:
            "6myContent I like javascript and I will be a developer in javascript, back end developer",
          blogId: blogId,
        })



/************************************** create like **********************************************/
		const createLikePost1User1 = await request(app)
		.put(`/posts/${id}/like-status`)
		.set("Authorization", `Bearer ${token}`)
		.send({
			"likeStatus": "Like"
		})

		const createLikePost1User2 = await request(app)
		.put(`/posts/${createPosts2.body.id}/like-status`)
		.set("Authorization", `Bearer ${createAccessToken2.body.accessToken}`)
		.send({
			"likeStatus": "Like"
		})

		const createLikePost2User2 = await request(app)
		.put(`/posts/${createPosts2.body.id}/like-status`)
		.set("Authorization", `Bearer ${createAccessToken2.body.accessToken}`)
		.send({
			"likeStatus": "Like"
		})

		const createdislikePost2User3 = await request(app)
		.put(`/posts/${createPosts2.body.id}/like-status`)
		.set("Authorization", `Bearer ${createAccessToken3.body.accessToken}`)
		.send({
			"likeStatus": "Like"
		})

		const createDislikePos3tUser1 = await request(app)
		.put(`/posts/${createPosts3.body.id}/like-status`)
		.set("Authorization", `Bearer ${token}`)
		.send({
			"likeStatus": "Dislike"
		})

		const createLikePost4User1 = await request(app)
		.put(`/posts/${createPosts4.body.id}/like-status`)
		.set("Authorization", `Bearer ${token}`)
		.send({
			"likeStatus": "Like"
		})

		const createLikePost4User4 = await request(app)
		.put(`/posts/${createPosts4.body.id}/like-status`)
		.set("Authorization", `Bearer ${createAccessToken4.body.accessToken}`)
		.send({
			"likeStatus": "Like"
		})

		const createLikePost4User2 = await request(app)
		.put(`/posts/${createPosts4.body.id}/like-status`)
		.set("Authorization", `Bearer ${createAccessToken2.body.accessToken}`)
		.send({
			"likeStatus": "Like"
		})

		const createLikePost4User3 = await request(app)
		.put(`/posts/${createPosts4.body.id}/like-status`)
		.set("Authorization", `Bearer ${createAccessToken3.body.accessToken}`)
		.send({
			"likeStatus": "Like"
		})

		const createLikePost5User2 = await request(app)
		.put(`/posts/${createPosts5.body.id}/like-status`)
		.set("Authorization", `Bearer ${createAccessToken2.body.accessToken}`)
		.send({
			"likeStatus": "Like"
		})

		const createDislikePost5User3 = await request(app)
		.put(`/posts/${createPosts5.body.id}/like-status`)
		.set("Authorization", `Bearer ${createAccessToken3.body.accessToken}`)
		.send({
			"likeStatus": "Dislike"
		})

		const createLikePost6User1 = await request(app)
		.put(`/posts/${createPosts6.body.id}/like-status`)
		.set("Authorization", `Bearer ${token}`)
		.send({
			"likeStatus": "Like"
		})

		const createDislikePost6User2 = await request(app)
		.put(`/posts/${createPosts6.body.id}/like-status`)
		.set("Authorization", `Bearer ${createAccessToken2.body.accessToken}`)
		.send({
			"likeStatus": "Dislike"
		})


     
    });
	it("get post by user1 => return 200 status code", async () => {
        const getPostById1 = await request(app)
          .get(`/posts/${id}`)
          .set("Authorization", `Bearer ${token}`);

        console.log(getPostById1.body);
        expect(getPostById1.status).toBe(HTTP_STATUS.OK_200);
        expect(getPostById1.body).toStrictEqual({
          id: id,
          title: postData.title,
          shortDescription: postData.shortDescription,
          content: postData.content,
          blogId: postData.blogId,
          blogName: blogName,
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: expect.any(Number),
            dislikesCount: expect.any(Number),
            myStatus: expect.any(String),
            newestLikes: [
                {
              	"addedAt": expect.any(String),
              	"userId": userId,
              	"login": userLogin
                }
            ],
          },
        });
      });
	  it("get all post", async() => {
		const getAllPosts = await request(app)
          .get(`/posts/`)
          .set("Authorization", `Bearer ${token}`);

        console.log(getAllPosts.body);
        expect(getAllPosts.status).toBe(HTTP_STATUS.OK_200);

		const getAllPostByBlogId = await request(app)
		.get(`/blogs/${blogIdAllPost}/posts`)
		.set("Authorization", `Bearer ${token}`);
		expect(getAllPosts.body).toEqual(getAllPostByBlogId.body)
	  })
  });
});
