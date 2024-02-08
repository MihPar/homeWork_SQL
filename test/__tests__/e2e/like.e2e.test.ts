import { stopDb } from "../../db/db";
import request from "supertest";
import { initApp } from "../../settings";
import { HTTP_STATUS } from "../../utils/utils";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoURI = process.env.MONGO_URL || "mongodb://0.0.0.0:27017";
let dbName = process.env.mongoDBName || "mongoose-example";

const app = initApp();

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

describe("/like", () => {
  beforeAll(async () => {
    // await runDb()
    // console.log(mongoURI, ': MongoURI')
    // console.log(mongoURI, ': e')
    await mongoose.connect(mongoURI);

    const wipeAllRes = await request(app).delete("/testing/all-data");
    expect(wipeAllRes.status).toBe(HTTP_STATUS.NO_CONTENT_204);

    const getPosts = await request(app).get("/posts");
    expect(getPosts.status).toBe(HTTP_STATUS.OK_200);

    expect(getPosts.body.items).toHaveLength(0);
  });

  afterAll(async () => {
    // await stop()
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

  beforeEach(async () => {
    const wipeAllRes = await request(app).delete("/testing/all-data").send();
  });

  it("PUT -> /comments/:commentId/like-status: create comment then: like the comment by user 1, user 2, user 3, user 4. get the comment after each like by user 1. ; status 204; used additional methods: POST => /blogs, POST => /posts, POST => /posts/:postId/comments, GET => /comments/:id;", async () => {
    // create user(login, psw)!!!!!!
    //accwessToken = loginUser
    //blogId = createBlog
    //postId = createPost
    //comment = createComment


	/************** crate users ***************/

    const createUser1 = await request(app).post('/users').auth("admin", "qwerty").send({
		"login": "Michail",
		"password": "qwerty1",
		"email": "1mpara7472@gmail.com"
	})
	//   console.log(createUser1.body)

    expect(createUser1.status).toBe(HTTP_STATUS.CREATED_201);
    expect(createUser1.body).toEqual({
      id: expect.any(String),
      login: "Michail",
      email: "1mpara7472@gmail.com",
      createdAt: expect.any(String),
    });


	const createUser2 = await request(app)
      .post("/users")
      .auth("admin", "qwerty")
      .send({
        login: "Alexander",
        password: "qwerty2",
        email: "2mpara7472@gmail.com",
      });

    expect(createUser2.status).toBe(HTTP_STATUS.CREATED_201);
    expect(createUser2.body).toEqual({
      id: expect.any(String),
      login: "Alexander",
      email: "2mpara7472@gmail.com",
      createdAt: expect.any(String),
    });

	const createUser3 = await request(app)
      .post("/users")
      .auth("admin", "qwerty")
      .send({
        login: "Iliya",
        password: "qwerty3",
        email: "3mpara7472@gmail.com",
      });

    expect(createUser3.status).toBe(HTTP_STATUS.CREATED_201);
    expect(createUser3.body).toEqual({
      id: expect.any(String),
      login: "Iliya",
      email: "3mpara7472@gmail.com",
      createdAt: expect.any(String),
    });

	const createUser4 = await request(app)
	.post("/users")
	.auth("admin", "qwerty")
	.send({
	  login: "Tatiana",
	  password: "qwerty4",
	  email: "4mpara7472@gmail.com",
	});

  expect(createUser4.status).toBe(HTTP_STATUS.CREATED_201);
  expect(createUser4.body).toEqual({
	id: expect.any(String),
	login: "Tatiana",
	email: "4mpara7472@gmail.com",
	createdAt: expect.any(String),
  });
  

/************** create access token **************************/

    const loginOrEmail1 = createUser1.body.login;
    const createAccessToken1 = await request(app).post("/auth/login").send({
      loginOrEmail: loginOrEmail1,
      password: "qwerty1",
    });

	expect(createAccessToken1.status).toBe(HTTP_STATUS.OK_200);
    expect(createAccessToken1.body).toEqual({
      accessToken: expect.any(String),
    });


	const loginOrEmail2 = createUser2.body.login;
    const createAccessToken2 = await request(app).post("/auth/login").send({
      loginOrEmail: loginOrEmail2,
      password: "qwerty2",
    });

	expect(createAccessToken2.status).toBe(HTTP_STATUS.OK_200);
    expect(createAccessToken2.body).toEqual({
      accessToken: expect.any(String),
    });


	const loginOrEmail3 = createUser3.body.login;
    const createAccessToken3 = await request(app).post("/auth/login").send({
      loginOrEmail: loginOrEmail3,
      password: "qwerty3",
    });

	expect(createAccessToken3.status).toBe(HTTP_STATUS.OK_200);
    expect(createAccessToken3.body).toEqual({
      accessToken: expect.any(String),
    });


	const loginOrEmail4 = createUser4.body.login;
    const createAccessToken4 = await request(app).post("/auth/login").send({
      loginOrEmail: loginOrEmail4,
      password: "qwerty4",
    });

	expect(createAccessToken4.status).toBe(HTTP_STATUS.OK_200);
    expect(createAccessToken4.body).toEqual({
      accessToken: expect.any(String),
    });


/****************************** create blogs ******************************/
    
    const createBlogs1 = await request(app)
      .post("/blogs")
      .auth("admin", "qwerty")
      .send({
        name: "Michail",
        description: "my description",
        websiteUrl: "https://learn.javascript.ru",
      });
    expect(createBlogs1.status).toBe(HTTP_STATUS.CREATED_201);
    expect(createBlogs1.body).toEqual({
      id: expect.any(String),
      name: "Michail",
      description: "my description",
      websiteUrl: "https://learn.javascript.ru",
      createdAt: expect.any(String),
      isMembership: true,
    });
    const blogId1 = createBlogs1.body.id;
    const blogName1 = createBlogs1.body.name;


  /******************************** create Posts ******************************/

    const createPosts1 = await request(app)
      .post("/posts")
      .auth("admin", "qwerty")
      .send({
        title: "new title",
        shortDescription: "new shortDescription",
        content:
          "myContent I like javascript and I will be a developer in javascript, back end developer",
        blogId: blogId1,
      });

    expect(createPosts1.status).toBe(HTTP_STATUS.CREATED_201);
    expect(createPosts1.body).toEqual({
      id: expect.any(String),
      title: "new title",
      shortDescription: "new shortDescription",
      content:
        "myContent I like javascript and I will be a developer in javascript, back end developer",
      blogId: blogId1,
      blogName: blogName1,
      createdAt: expect.any(String),
    });

    const postId1 = createPosts1.body.id;
    const userId1 = createUser1.body.id;
    const login1 = createUser1.body.login;


	/******************************* create comments by post id ***********************************/

    const createCommentPostByPostId = await request(app)
      .post(`/posts/${postId1}/comments`)
      .set("Authorization", `Bearer ${createAccessToken1.body.accessToken}`)
      .send({
        content:
          "My profession is a programmer, I work in javascript and I work for back end developer",
      });
    expect(createCommentPostByPostId.status).toBe(HTTP_STATUS.CREATED_201);
    expect(createCommentPostByPostId.body).toEqual({
      id: expect.any(String),
      content: expect.any(String),
      commentatorInfo: {
        userId: userId1,
        userLogin: login1,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
      },
    });

   
	/*************************** create comments by commentsId (like/dislike) ******************************/
	let getCommentUser1

	const commentId = createCommentPostByPostId.body.id;
  const updateCommentByCommentId1 = await request(app)
    .put(`/comments/${commentId}/like-status`)
    .set("Authorization", `Bearer ${createAccessToken1.body.accessToken}`)
    .send({ likeStatus: "Like" });
  expect(updateCommentByCommentId1.status).toBe(HTTP_STATUS.NO_CONTENT_204);
// console.log(updateCommentByCommentId1.status)
// console.log(updateCommentByCommentId1.body)
  const id = createCommentPostByPostId.body.id;

  getCommentUser1 = await request(app)
  .get(`/comments/${id}`)
  .set("Authorization", `Bearer ${createAccessToken1.body.accessToken}`)
  console.log(getCommentUser1.body.myStatus)

  expect(getCommentUser1.status).toBe(HTTP_STATUS.OK_200);
  expect(getCommentUser1.body).toEqual({
    id: id,
    content: expect.any(String),
    commentatorInfo: {
      userId: userId1,
      userLogin: login1,
    },
    createdAt: expect.any(String),
    likesInfo: {
      likesCount: 1,
      dislikesCount: 0,
      myStatus: "Like",
    },
  });
	  

	const updateCommentByCommentId2 = await request(app)
	.put(`/comments/${commentId}/like-status`)
	.set("Authorization", `Bearer ${createAccessToken2.body.accessToken}`)
	.send({"likeStatus": "Like"})
	  console.log(updateCommentByCommentId2.body)
	  expect(updateCommentByCommentId2.status).toBe(HTTP_STATUS.NO_CONTENT_204)

	  getCommentUser1 = await request(app)
	  .get(`/comments/${id}`)
	  .set("Authorization", `Bearer ${createAccessToken2.body.accessToken}`)

  console.log(getCommentUser1.body)

    expect(getCommentUser1.status).toBe(HTTP_STATUS.OK_200);
    expect(getCommentUser1.body).toEqual({
      id: id,
      content: expect.any(String),
      commentatorInfo: {
        userId: userId1,
        userLogin: login1,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 2,
        dislikesCount: 0,
        myStatus: "Like",
      },
    });

	const updateCommentByCommentId3 = await request(app)
	.put(`/comments/${commentId}/like-status`)
	.set("Authorization", `Bearer ${createAccessToken3.body.accessToken}`)
	.send({"likeStatus": "Dislike"})
	  console.log(updateCommentByCommentId3.body)
	  expect(updateCommentByCommentId3.status).toBe(HTTP_STATUS.NO_CONTENT_204)

	  getCommentUser1 = await request(app)
	  .get(`/comments/${id}`)
	  .set("Authorization", `Bearer ${createAccessToken3.body.accessToken}`)
  console.log(getCommentUser1.body)

    expect(getCommentUser1.status).toBe(HTTP_STATUS.OK_200);
    expect(getCommentUser1.body).toEqual({
      id: id,
      content: expect.any(String),
      commentatorInfo: {
        userId: userId1,
        userLogin: login1,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 2,
        dislikesCount: 1,
        myStatus: "Dislike",
      },
    });


	  const updateCommentByCommentId4 = await request(app)
	.put(`/comments/${commentId}/like-status`)
	.set("Authorization", `Bearer ${createAccessToken4.body.accessToken}`)
	.send({"likeStatus": "None"})
	  console.log(updateCommentByCommentId4.body)
	  expect(updateCommentByCommentId4.status).toBe(HTTP_STATUS.NO_CONTENT_204)

	  getCommentUser1 = await request(app)
	  .get(`/comments/${id}`)
	  .set("Authorization", `Bearer ${createAccessToken4.body.accessToken}`)
  console.log(getCommentUser1.body)

    expect(getCommentUser1.status).toBe(HTTP_STATUS.OK_200);
    expect(getCommentUser1.body).toEqual({
      id: id,
      content: expect.any(String),
      commentatorInfo: {
        userId: userId1,
        userLogin: login1,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 2,
        dislikesCount: 1,
        myStatus: "None",
      },
    });
  });
});


