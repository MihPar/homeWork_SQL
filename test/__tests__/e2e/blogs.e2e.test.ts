import { HTTP_STATUS } from './../../../src/utils/utils';
import { appSettings } from './../../../src/setting';
import { AppModule } from './../../../src/modules/app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from "supertest";
import dotenv from "dotenv";
import { UserViewType } from '../../../src/api/users/user.type';
import { PostsViewModel } from '../../../src/api/posts/posts.type';
import { InputDataModelClassAuth } from '../../../src/api/auth/auth.class';
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
	let server: any
	
  beforeAll(async () => {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule]
	  }).compile();
  
	  app = moduleFixture.createNestApplication();
	  appSettings(app)

	await app.init()
	server = app.getHttpServer()

    const wipeAllRes = await request(server).delete("/testing/all-data").send();
    expect(wipeAllRes.status).toBe(HTTP_STATUS.NO_CONTENT_204);
  });

  afterAll(async () => {
	await app.close()
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
  let createUser: UserViewType;
  let name: string;
  let description: string;
  let websiteUrl: string;
  let blogId: string;
  let userId: string;
  let token: InputDataModelClassAuth
  let login: string

  describe("get and create blog tests", () => {
    describe("create user and acces token", () => {
      it("get blogs", async () => {
        const getBlogsBefore = await request(server).get("/blogs").send();
        expect(getBlogsBefore.status).toBe(HTTP_STATUS.OK_200);
        expect(getBlogsBefore.body.items).toHaveLength(0);
      });

      it("create user, create accessToken", async () => {
        const testUser = {
          login: "Michail",
          password: "qwerty",
          email: "mpara7274@gamil.com",
        };

		login = testUser.login
        const createUserResponse = await request(server)
          .post("/users")
          .auth("admin", "qwerty")
          .send(testUser);
        createUser = createUserResponse.body;
        expect(createUserResponse.status).toBe(HTTP_STATUS.CREATED_201);
        expect(createUser).toEqual({
          id: expect.any(String),
          login: testUser.login,
          email: testUser.email,
          createdAt: expect.any(String),
        });

        const loginOrEmail = createUser.login;
        let createAccessToken = await request(server).post("/auth/login").send({
          loginOrEmail: loginOrEmail,
          password: "qwerty",
        });
		token = createAccessToken.body.accessToken
        expect(createAccessToken.status).toBe(HTTP_STATUS.OK_200);
        expect(createAccessToken.body).toEqual({
          accessToken: expect.any(String),
        });
        userId = createUser.id;
      });
    });

    describe("create new blog", () => {
      it("create new blog", async () => {
        const getBlogsBefore = await request(server).get("/blogs").send();
        expect(getBlogsBefore.status).toBe(HTTP_STATUS.OK_200);
        expect(getBlogsBefore.body.items).toHaveLength(0);

        const createBlogs = await request(server)
          .post("/blogs")
          .auth("admin", "qwerty")
          .send({
            name: "Mickle",
            description: "I am a programmer",
            websiteUrl: "https://google.com",
          });

        description = createBlogs.body.description;
        websiteUrl = createBlogs.body.websiteUrl;
        name = createBlogs.body.name;
        blogId = createBlogs.body.id;

        expect(createBlogs.status).toBe(HTTP_STATUS.CREATED_201);
        expect(createBlogs.body).toEqual({
          id: expect.any(String),
          name: name,
          description: description,
          websiteUrl: websiteUrl,
          createdAt: expect.any(String),
          isMembership: false,
        });

        const getBlogsAfter = await request(server).get("/blogs").send();
        expect(getBlogsAfter.status).toBe(HTTP_STATUS.OK_200);
        expect(getBlogsAfter.body.items).toHaveLength(1);
      });

    //   it("create new blogs with incorrect input data (body), should return status 400 and errorMessage", async () => {
    //     const createBlogsWithIncorrectData = await request(server)
    //       .post("/blogs")
    //       .auth("admin", "qwerty")
    //       .send({
    //         name: 102,
    //         description: true,
    //         webseiteUrl: false,
    //       });
    //     expect(createBlogsWithIncorrectData.status).toBe(
    //       HTTP_STATUS.BAD_REQUEST_400
    //     );
    //     expect(createBlogsWithIncorrectData.body).toStrictEqual(
    //       blogsValidationErrRes
    //     );
    //   });

//       it("create blog with empty body => should return 400 status code and createErrorsMessageTest", async () => {
//         const createBlogWithEmptyBody = await request(server)
//           .post("/blogs")
//           .auth("admin", "qwerty")
//           .send({});

//         expect(createBlogWithEmptyBody.status).toBe(
//           HTTP_STATUS.BAD_REQUEST_400
//         );
//         expect(createBlogWithEmptyBody.body).toStrictEqual(
//           createErrorsMessageTest(["name", "description", "websiteUrl"])
//         );
//       });

//       it("create blogs without authorization => should return 401 status code", async () => {
//         const creteBlogsWithoutAuth = await request(server)
//           .post("/blogs")
//           .send({});
//         expect(creteBlogsWithoutAuth.status).toBe(
//           HTTP_STATUS.NOT_AUTHORIZATION_401
//         );
//       });

//       it("create blog with incorrect auth => should return 401 status code", async () => {
//         const createBlogWithIncorrectHeaders = await request(server)
//           .post("/blogs")
//           .auth("123", "456")
//           .send({});
//         expect(createBlogWithIncorrectHeaders.status).toBe(
//           HTTP_STATUS.NOT_AUTHORIZATION_401
//         );
//       });
//     });

//     describe("return blogs with pagin", () => {
//       it("return blogs with pagin", async () => {
//         const searchNameTerm = "";
//         const sortBy = "createdAt";
//         const sortDirection = "desc";
//         const pageNumber = "1";
//         const pageSize = "10";

//         const getBlogs = await request(server).get(`/blogs`).query({
//           searchNameTerm: "",
//           sortBy: "createAt",
//           sortDirection: "desc",
//           pageNumber: "1",
//           pageSize: "10",
//         });

//         // await request(server).get(`/blogs?searchNameTerm=${searchNameTerm}&sortBy=${sortBy}
//         // &sortDirection=${sortDirection}&pageNumber=${pageNumber}&pageSize=${pageSize}`)

//         expect(getBlogs.status).toBe(HTTP_STATUS.OK_200);
//         expect(getBlogs.body).toEqual({
//           pagesCount: 1,
//           page: 1,
//           pageSize: 10,
//           totalCount: 1,
//           items: [
//             {
//               id: expect.any(String),
//               name: name,
//               description: description,
//               websiteUrl: websiteUrl,
//               createdAt: expect.any(String),
//               isMembership: true,
//             },
//           ],
//         });
//       });
//     });

/************************************** create and get post by blogId ************************************/

    describe("return all posts for specified blog", () => {
      it("return all posts for specified blog", async () => {
        const createPostByBlogId = await request(server)
          .post("/posts")
          .auth("admin", "qwerty")
          .send({
            title: "PROGRAMMER",
            shortDescription: "My profession the back end developer!",
            content:
              "I am a programmere and work at backend, I like javascript!!!",
            blogId: blogId,
          })
		//   console.log(createPostByBlogId.body)
          expect(createPostByBlogId.status).toBe(HTTP_STATUS.CREATED_201)
		  

        const title = createPostByBlogId.body.title;
        const shortDescription = createPostByBlogId.body.shortDescription;
        const content = createPostByBlogId.body.content;
        const postIdBy = createPostByBlogId.body.blogId;

		const pageNumber = '1';
		const pageSize = '10';
		const sortBy = 'createAt';
		const sortDirection = 'desc';

        const getPostByBlogId = await request(server)
		.get(`/blogs/${blogId}/posts`)
		.set(`Authorization`, `Bearer ${token}`)
		.query({pageNumber: "1", pageSize: "10", sortBy: "createAt", sortDirection: "desc"})

        // console.log("getPostByBlogId.body: ", getPostByBlogId.body);

        expect(getPostByBlogId.status).toBe(HTTP_STATUS.OK_200);
		// console.log("getPostByBlogId.body.items: ", getPostByBlogId.body.items)
        expect(getPostByBlogId.body).toEqual({
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [
            {
              id: expect.any(String),
              title: title,
              shortDescription: shortDescription,
              content: content,
              blogId: blogId,
              blogName: name,
              createdAt: expect.any(String),
			  "extendedLikesInfo": {
				"likesCount": 0,
				"dislikesCount": 0,
				"myStatus": "None",
				"newestLikes": [
				//   {
				// 	"addedAt": expect.any(String),
				// 	"userId": userId,
				// 	"login": login
				//   }
				]
			  }
            },
          ],
        });
      });

      it("if specified blog is not exist", async () => {
        const getAllPostByBlogId = await request(server)
		.get(
          `/blogs/123456789012345678901234/posts`
        //   `/blogs/${blogId}/posts`
        )
		// .set(`Authorization`, `Bearer ${token}`)
		.query({pageNumber: "1", pageSize: "10", sortBy: "createAt", sortDirection: "desc"})

		console.log(getAllPostByBlogId.body)

        expect(getAllPostByBlogId.status).toBe(HTTP_STATUS.NOT_FOUND_404);
      });
    });

    let reqBodyResponse: PostsViewModel;

	// /*********************************** create new post by blogId *****************************************/
	
    // describe("create new post for specific blog", () => {
    //   type BodyBlog = {
    //     title: string;
    //     shortDescription: string;
    //     content: string;
    //   };

    //   let testBodyBlog: BodyBlog;
    //   it("create post by blogId", async () => {
    //     testBodyBlog = {
    //       title: "New title",
    //       shortDescription: "My new short description",
    //       content:
    //         "I am a progremmer and I like coding, my profession the back end developer.",
    //     };
    //     const createNewPost = await request(server)
    //       .post(`/blogs/${blogId}/posts`)
    //       .auth("admin", "qwerty")
    //       .send(testBodyBlog);

    //     reqBodyResponse = createNewPost.body;
    //     expect(createNewPost.status).toBe(HTTP_STATUS.CREATED_201);
    //     expect(reqBodyResponse).toStrictEqual({
    //       id: expect.any(String),
    //       title: reqBodyResponse.title,
    //       shortDescription: reqBodyResponse.shortDescription,
    //       content: reqBodyResponse.content,
    //       blogId: blogId,
    //       blogName: name,
    //       createdAt: expect.any(String),
    //     });
    //   });

    //   it("create blog with incorrect input data => return 400 errorMessage", async () => {
    //     const createBlogs = await request(server)
    //       .post("/blogs")
    //       .auth("admin", "qwerty")
    //       .send({
    //         name: "Mickle",
    //         description: "I am a programmer",
    //         websiteUrl: "https://google.com",
    //       });
    //     expect(createBlogs.status).toBe(HTTP_STATUS.CREATED_201);
    //     expect(createBlogs.body).toEqual({
    //       id: expect.any(String),
    //       name: name,
    //       description: description,
    //       websiteUrl: websiteUrl,
    //       createdAt: expect.any(String),
    //       isMembership: true,
    //     });
    //     const blogId = createBlogs.body.id;

    //     const createPostWithIncorrectData = await request(server)
    //       .post(`/blogs/${blogId}/posts`)
    //       .auth("admin", "qwerty")
    //       .send({
    //         title: 123,
    //         shortDescription: true,
    //         content: 456,
    //       });
    //     expect(createPostWithIncorrectData.status).toBe(
    //       HTTP_STATUS.BAD_REQUEST_400
    //     );
    //     expect(createPostWithIncorrectData.body).toStrictEqual(
    //       createErrorsMessageTest(["content", "title", "shortDescription"])
    //     );
    //   });

    //   it("create blog with incorrect input data => return 400 status code errorMessage", async () => {
    //     const createBlogs = await request(server)
    //       .post("/blogs")
    //       .auth("admin", "qwerty")
    //       .send({
    //         name: "Mickle",
    //         description: "I am a programmer",
    //         websiteUrl: "https://google.com",
    //       });
    //     expect(createBlogs.status).toBe(HTTP_STATUS.CREATED_201);
    //     expect(createBlogs.body).toEqual({
    //       id: expect.any(String),
    //       name: name,
    //       description: description,
    //       websiteUrl: websiteUrl,
    //       createdAt: expect.any(String),
    //       isMembership: true,
    //     });
    //     const blogId = createBlogs.body.id;
    //     const createPostWithIncorrectData = await request(server)
    //       .post(`/blogs/${blogId}/posts`)
    //       .auth("admin", "qwerty")
    //       .send({});
    //     expect(createPostWithIncorrectData.status).toBe(
    //       HTTP_STATUS.BAD_REQUEST_400
    //     );
    //     expect(createPostWithIncorrectData.body).toStrictEqual(
    //       createErrorsMessageTest(["content", "title", "shortDescription"])
    //     );
    //   });

    //   it("create new blog without authorization => return 401 status code", async () => {
    //     const createBlogs = await request(server)
    //       .post("/blogs")
    //       .auth("admin", "qwerty")
    //       .send({
    //         name: "Mickle",
    //         description: "I am a programmer",
    //         websiteUrl: "https://google.com",
    //       });
    //     expect(createBlogs.status).toBe(HTTP_STATUS.CREATED_201);
    //     expect(createBlogs.body).toEqual({
    //       id: expect.any(String),
    //       name: name,
    //       description: description,
    //       websiteUrl: websiteUrl,
    //       createdAt: expect.any(String),
    //       isMembership: true,
    //     });
    //     const blogId = createBlogs.body.id;
    //     const createNewPostWithoutAuth = await request(server)
    //       .post(`/blogs/${blogId}/posts`)
    //       .send({
    //         title: "New title",
    //         shortDescription: "My new short description",
    //         content:
    //           "I am a progremmer and I like coding, my profession the back end developer.",
    //       });
    //     expect(createNewPostWithoutAuth.status).toBe(
    //       HTTP_STATUS.NOT_AUTHORIZATION_401
    //     );
    //   });

    //   it("create new blog if specify blog doesn`t exist => return 404 status code", async () => {
    //     const createPostWithoutBlogId = await request(server)
    //       .post(`/blogs/123456789012345678901234/posts`)
    //       .auth("admin", "qwerty")
    //       .send(testBodyBlog);
    //     expect(createPostWithoutBlogId.status).toBe(HTTP_STATUS.NOT_FOUND_404);
    //   });
    // });

	// /************************************* get blog by id *******************************/

    // describe("return blog by id", () => {
    // 	let id: any
    //   it("return blog by id", async () => {
	// 	const modelObj = {
    //         name: "Mickle",
    //         description: "I am a programmer",
    //         websiteUrl: "https://google.com",
    //       }
    // 	const createBlogs = await request(server)
    //       .post("/blogs")
    //       .auth("admin", "qwerty")
    //       .send(modelObj);

    // 	  expect(createBlogs.status).toBe(HTTP_STATUS.CREATED_201);
    // 	  expect(createBlogs.body).toEqual({
    // 		id: expect.any(String),
    // 		name: modelObj.name,
    // 		description: modelObj.description,
    // 		websiteUrl: modelObj.websiteUrl,
    // 		createdAt: expect.any(String),
    // 		isMembership: false,
    // 	  });
    // 	id = createBlogs.body.id
	// 	let name = createBlogs.body.name
	// 	let description = createBlogs.body.description
	// 	let websiteUrl = createBlogs.body.websiteUrl

    //     const getblogById = await request(server).get(`/blogs/${id}`);
	// 	// console.log(getblogById.body)
    //     expect(getblogById.status).toBe(HTTP_STATUS.OK_200);
    //     expect(getblogById.body).toEqual({
    //       id: id,
    //       name: name,
    //       description: description,
    //       websiteUrl: websiteUrl,
    //       createdAt: expect.any(String),
    //       isMembership: false,
    //     });
    //   });

    //   it("get post by incorrect blogId => return 404 status code", async () => {
    //     const getblogById = await request(server).get(`/blogs/123456789012345678901234`);
    //     expect(getblogById.status).toBe(HTTP_STATUS.NOT_FOUND_404);
    //   });
    // });

//     describe("update existing blog by id with input date", () => {
//       let id: string
//       it("update existing blog by id", async () => {
// 		const createBlogs = await request(server)
//           .post("/blogs")
//           .auth("admin", "qwerty")
//           .send({
//             name: "Mickle",
//             description: "I am a programmer",
//             websiteUrl: "https://google.com",
//           });
//         expect(createBlogs.status).toBe(HTTP_STATUS.CREATED_201);
//         expect(createBlogs.body).toEqual({
//           id: expect.any(String),
//           name: name,
//           description: description,
//           websiteUrl: websiteUrl,
//           createdAt: expect.any(String),
//           isMembership: true,
//         });
//         id = createBlogs.body.id;
//         const updateBlog = await request(server)
//           .put(`/blogs/${id}`)
//           .auth("admin", "qwerty")
//           .send({
//             name: "Tatiana",
//             description: "I am a wife",
//             websiteUrl: "https://GG5I65-a7ercNP.ru",
//           });
//         expect(updateBlog.status).toBe(HTTP_STATUS.NO_CONTENT_204);
//       });
//       it("update existion blog by id with empty body input date => return 400 status code", async () => {
//         const updateBlog = await request(server)
//           .put(`/blogs/${id}`)
//           .auth("admin", "qwerty")
//           .send({});
//         expect(updateBlog.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
//         expect(updateBlog.body).toStrictEqual(
//           createErrorsMessageTest(["name", "description", "websiteUrl"])
//         );
//       });

//       it("update existion blog by id with incorrect input date => return 400 status code", async () => {
//         const updateBlog = await request(server)
//           .put(`/blogs/${id}`)
//           .auth("admin", "qwerty")
//           .send({
//             name: 123,
//             description: true,
//             websiteUrl: "",
//           });
//         expect(updateBlog.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
//         expect(updateBlog.body).toStrictEqual(
//           createErrorsMessageTest(["name", "description", "websiteUrl"])
//         );
//       });

//       it("update blog without authorization => return 401 status code", async () => {
//         const updateBlog = await request(server).put(`/blogs/${id}`).send({
//           name: "Tatiana",
//           description: "I am a wife",
//           websiteUrl: "https://GG5I65-a7ercNP.ru",
//         });
//         expect(updateBlog.status).toBe(HTTP_STATUS.NOT_AUTHORIZATION_401);
//       });

//       it("update blog if id of blog is not correct", async () => {
//         const updateBlog = await request(server)
//           .put(`/blogs/123456789012345678901234`)
//           .auth("admin", "qwerty")
//           .send({
//             name: "Tatiana",
//             description: "I am a wife",
//             websiteUrl: "https://GG5I65-a7ercNP.ru",
//           });
//     	  expect(updateBlog.status).toBe(HTTP_STATUS.NOT_FOUND_404)
//       });
//     });

//     describe("delete blog specified by id", () => {
//       let id: string;
//       it("delete blog by id", async () => {
//         const createBlogs = await request(server)
//           .post("/blogs")
//           .auth("admin", "qwerty")
//           .send({
//             name: "Mickle",
//             description: "I am a programmer",
//             websiteUrl: "https://google.com",
//           });
//         expect(createBlogs.status).toBe(HTTP_STATUS.CREATED_201);
//         expect(createBlogs.body).toEqual({
//           id: expect.any(String),
//           name: name,
//           description: description,
//           websiteUrl: websiteUrl,
//           createdAt: expect.any(String),
//           isMembership: true,
//         });
//         id = createBlogs.body.id;

//         const wipeBlogById = await request(server)
//           .delete(`/blogs/${id}`)
//           .auth("admin", "qwerty");
//         expect(wipeBlogById.status).toBe(HTTP_STATUS.NO_CONTENT_204);
//       });
//       it("delete blog by id without authorization", async () => {
//         const wipeBlogById = await request(server).delete(`/blogs/${id}`);
//         expect(wipeBlogById.status).toBe(HTTP_STATUS.NOT_AUTHORIZATION_401);
//       });
//       it("delete blog by id with incorrect id", async () => {
//         const wipeBlogId = await request(server)
//           .delete(`/blogs/147852369874563215987532`)
//           .auth("admin", "qwerty");
//         expect(wipeBlogId.status).toBe(HTTP_STATUS.NOT_FOUND_404);
//       });
//     });
  });
});
})
