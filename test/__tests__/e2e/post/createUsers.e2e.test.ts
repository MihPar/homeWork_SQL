import request from 'supertest';
import dotenv from 'dotenv';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../../src/modules/app.module';
import { appSettings } from '../../../../src/setting';
import { HTTP_STATUS } from '../../../../src/utils/utils';
import { PostsViewModel } from '../../../../src/api/posts/posts.type';
import { InputModelClassCreateBody } from '../../../../src/api/users/user.class';
import { createAddUser, createToken } from '../../../../src/helpers/helpers';
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

let createUser
let createUser2
let createUser3
let createUser4

let createAccessToken
let createAccessToken2
let createAccessToken3
let createAccessToken4


describe('/blogs', () => {
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

    const wipeAllRes = await request(server).delete('/testing/all-data').send();
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
        field: 'name',
      },
      {
        message: expect.any(String),
        field: 'description',
      },
      {
        message: expect.any(String),
        field: 'websiteUrl',
      },
    ]),
  };

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
  let token1: string;
  let token2: string
  let token3: string
  let token4: string
  let postData: PostType;
  let blogName: string;
  let userLogin: string;
  let userId: string;

  let firstPost: PostsViewModel


  it('create four users', async () => {
    /***************************** create user1 ********************************************/
    const user = {
      login: 'Mickle1',
      password: 'qwerty1',
      email: '1mpara7473@gmail.com',
    };
    createUser = await createAddUser(server, user)

    userLogin = createUser.body.login;
    userId = createUser.body.id;
    expect(createUser.body).toStrictEqual({
      id: expect.any(String),
      login: user.login,
      email: user.email,
      createdAt: expect.any(String),
    });
    // createAccessToken = await request(server).post('/auth/login').send({
    //   loginOrEmail: user.login,
    //   password: user.password,
    // })

	createAccessToken = await createToken(server, user.login,  user.password)

	expect(createAccessToken.body).toEqual({
		accessToken: expect.any(String)
	})

    token1 = createAccessToken.body.accessToken;
    expect(createAccessToken.status).toBe(HTTP_STATUS.OK_200);
    expect(createAccessToken.body).toEqual({
      accessToken: expect.any(String),
    });

    /***************************** create user2 ********************************************/

	const user2 = {
    login: 'Mickle2',
    password: 'qwerty2',
    email: '2mpara7473@gmail.com',
  };
  createUser2 = await createAddUser(server, user2);
  createAccessToken2 = await createToken(server, user2.login, user2.password);
  token2 = createAccessToken2.body.accessToken;

    /***************************** create user3 ********************************************/

	const user3 = {
    login: 'Mickle3',
    password: 'qwerty3',
    email: '3mpara7473@gmail.com',
  };

  createUser3 = await createAddUser(server, user3);
  createAccessToken3 = await createToken(server, user3.login, user3.password);
  token3 = createAccessToken3.body.accessToken;

    /***************************** create user4 ********************************************/

	 createUser4 = await request(server)
      .post(`/users`)
      .auth('admin', 'qwerty')
      .send({
        login: 'Mickle4',
        password: 'qwerty4',
        email: '4mpara7473@gmail.com',
      });

    createAccessToken4 = await request(server).post('/auth/login').send({
      loginOrEmail: user.login,
      password: user.password,
    })

	token4 = createAccessToken4.body.accessToken

	/*************************** create blog *******************************/

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
        isMembership: false,
      });

      const blogId = createBlogs.body.id;
      blogName = createBlogs.body.name;

	/*************************** create post *******************************/

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

		firstPost = createPosts.body

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

	  const updatePostUser1 = await request(server)
	  .put(`/posts/${id}/like-status`)
	  .set("Authorization", `Bearer ${token1}`)
	  .send({
		"likeStatus": "Like"
	  })

	  const updatePostUser2 = await request(server)
	  .put(`/posts/${id}/like-status`)
	  .set("Authorization", `Bearer ${token2}`)
	  .send({
		"likeStatus": "Like"
	  })

	  const updatePostUser3 = await request(server)
	  .put(`/posts/${id}/like-status`)
	  .set("Authorization", `Bearer ${token3}`)
	  .send({
		"likeStatus": "Like"
	  })

	  const updatePostUser4 = await request(server)
	  .put(`/posts/${id}/like-status`)
	  .set("Authorization", `Bearer ${token4}`)
	  .send({
		"likeStatus": "Like"
	  })

	  /************************** getAllPost *******************************/

	// const pageNumber = '1';
    // const pageSize = '10';
    // const sortBy = 'createAt';
    // const sortDirection = 'desc';

    // const getAllPost = await request(server).get(
    //   `/posts?pageNumber=${pageNumber}&pageSize=${pageSize}&sortBy=${sortBy}&sortDirection=${sortDirection}`,
    // );
    // // .get('/posts').query({pageNumber: "1", pageSize: "10", sortBy: "createAt", sortDirection: "desc"})
    // expect(getAllPost.status).toBe(HTTP_STATUS.OK_200);
    // expect(getAllPost.body.pagesCount).toEqual(1);
    // expect(getAllPost.body.page).toEqual(1);
    // expect(getAllPost.body.pageSize).toEqual(10);
    // expect(getAllPost.body.totalCount).toEqual(1);
    // expect(getAllPost.body.items).toEqual([
    //   {
    //     ...firstPost,
    //     id: expect.any(String),
    //     createdAt: expect.any(String),
    //   },
    //   {
    //     id: expect.any(String),
    //     title: createPosts.body.title,
    //     shortDescription: createPosts.body.shortDescription,
    //     content: createPosts.body.content,
    //     blogId: createPosts.body.blogId,
    //     blogName: createBlogs.body.name,
    //     createdAt: expect.any(String),
    //     extendedLikesInfo: {
    //       likesCount: expect.any(Number),
    //       dislikesCount: expect.any(Number),
    //       myStatus: expect.any(String),
    //       // newestLikes: [
    //       //   {
    //       // 	"addedAt": "2023-12-13T11:39:16.432Z",
    //       // 	"userId": "string",
    //       // 	"login": "string"
    //       //   }
    //       // ]
    //     },
    //   },
    // ]);



	  const getPostById = await request(server)
	  .get(`/posts/${id}`)
	  .set("Authorization", `Bearer ${token1}`);

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
		  "likesCount": 1,
		  "dislikesCount": 0,
		  "myStatus": "Like",
		  "newestLikes": [
		    {
		  	"addedAt": expect.any(String),
		  	"userId": userId,
		  	"login": userLogin
		    }
		  ]
		}
	});
    });
  });
