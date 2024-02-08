import request from 'supertest';
import dotenv from 'dotenv';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../../src/modules/app.module';
import { appSettings } from '../../../../src/setting';
import { HTTP_STATUS } from '../../../../src/utils/utils';
import { PostsViewModel } from '../../../../src/api/posts/posts.type';
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

describe('/posts', () => {
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

    const wipeAllRes = await request(server).delete('/testing/all-data');
    expect(wipeAllRes.status).toBe(HTTP_STATUS.NO_CONTENT_204);

    const getPosts = await request(server).get('/posts');
    expect(getPosts.status).toBe(HTTP_STATUS.OK_200);
    expect(getPosts.body.items).toHaveLength(0);
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

  const blogsValidationErrResId = {
    errorsMessages: expect.arrayContaining([
      {
        message: expect.any(String),
        field: 'id',
      },
    ]),
  };

  const postsValidationErrResPost = {
    errorsMessages: expect.arrayContaining([
      {
        message: expect.any(String),
        field: 'title',
      },
      {
        message: expect.any(String),
        field: 'shortDescription',
      },
      {
        message: expect.any(String),
        field: 'content',
      },
      {
        message: expect.any(String),
        field: 'blogId',
      },
    ]),
  };

  //   beforeEach(async() => {
  // 	const wipeAllRes = await request(app).delete('/testing/all-data').send()
  // })

  type token = {
    accessToken: string;
  };
  let firstPost: PostsViewModel;
  let createAccessTokenBody: token;
  let userId: string;
  let login: string;
  let postId1: string;

  it('POST -> /posts/:postId/comments: should create new comment; status 201; content: created comment; used additional methods: POST -> /blogs, POST -> /posts, GET -> /comments/:commentId;', async () => {
    const createUser = await request(server)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Mickle',
        password: 'qwerty',
        email: 'mpara7472@gmail.com',
      });
    expect(createUser.status).toBe(HTTP_STATUS.CREATED_201);
    expect(createUser.body).toEqual({
      id: expect.any(String),
      login: 'Mickle',
      email: 'mpara7472@gmail.com',
      createdAt: expect.any(String),
    });

    const loginOrEmail = createUser.body.login;
    const createAccessToken = await request(server).post('/auth/login').send({
      loginOrEmail: loginOrEmail,
      password: 'qwerty',
    });

    createAccessTokenBody = createAccessToken.body;

    expect(createAccessToken.status).toBe(HTTP_STATUS.OK_200);
    expect(createAccessToken.body).toEqual({
      accessToken: expect.any(String),
    });

    const createBlogs = await request(server)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send({
        name: 'Mickle',
        description: 'my description',
        websiteUrl: 'https://learn.javascript.ru',
      });
    expect(createBlogs.status).toBe(HTTP_STATUS.CREATED_201);
    expect(createBlogs.body).toEqual({
      id: expect.any(String),
      name: 'Mickle',
      description: 'my description',
      websiteUrl: 'https://learn.javascript.ru',
      createdAt: expect.any(String),
      isMembership: false,
    });

    const blogId = createBlogs.body.id;
    const blogName = createBlogs.body.name;

    const createPosts = await request(server)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'new title',
        shortDescription: 'new shortDescription',
        content:
          'myContent I like javascript and I will be a developer in javascript, back end developer',
        blogId: blogId,
      });
    postId1 = createPosts.body.id;
    //   console.log("postId1: " , postId1 )
    // console.log(createPosts.body)
    expect(createPosts.status).toBe(HTTP_STATUS.CREATED_201);
    expect(createPosts.body).toEqual({
      id: expect.any(String),
      title: 'new title',
      shortDescription: 'new shortDescription',
      content:
        'myContent I like javascript and I will be a developer in javascript, back end developer',
      blogId: blogId,
      blogName: blogName,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [
          //   {
          // 	"addedAt": expect.any(String),
          // 	"userId": userId,
          // 	"login": login
          //   }
        ],
      },
    });

    firstPost = createPosts.body;

    const postId = createPosts.body.id;
    userId = createUser.body.id;
    login = createUser.body.login;

    /*************************** create comment by postId *****************************/

    const createCommentPostByPostId = await request(server)
      .post(`/posts/${postId1}/comments`)
      .set('Authorization', `Bearer ${createAccessToken.body.accessToken}`)
      .send({
        content:
          'My profession is a programmer, I work in javascript and I work for back end developer',
      });

    //   console.log('postId1: ', postId1)

    expect(createCommentPostByPostId.status).toBe(HTTP_STATUS.CREATED_201);
    expect(createCommentPostByPostId.body).toEqual({
      id: expect.any(String),
      content: expect.any(String),
      commentatorInfo: {
        userId: userId,
        userLogin: login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    });

    const createCommentWithIncorrectData = await request(server)
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${createAccessToken.body.accessToken}`)
      .send({ content: "dkdk" });
    expect(createCommentWithIncorrectData.status).toBe(
      HTTP_STATUS.BAD_REQUEST_400,
    );
    expect(createCommentWithIncorrectData.body).toStrictEqual(
      createErrorsMessageTest(['content']),
    );

    /*************************** get comment by postId *****************************/

    const id = createCommentPostByPostId.body.id;
    const getComment = await request(server)
      .get(`/comments/${id}`)
      .set('Authorization', `Bearer ${createAccessToken.body.accessToken}`);
    // console.log('getComment.body: ', getComment.body);
    expect(getComment.status).toBe(HTTP_STATUS.OK_200);
    expect(getComment.body).toEqual({
      id: id,
      content: expect.any(String),
      commentatorInfo: {
        userId: userId,
        userLogin: login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    });
  });

  it('PUT -> `/posts/:postId/like-status` shoukd return status 204 if created like status', async () => {
    const makeLikeDislike = await request(server)
      .put(`/posts/${postId1}/like-status`)
      .set('Authorization', `Bearer ${createAccessTokenBody.accessToken}`)
      .send({
        likeStatus: 'None',
      });
    expect(makeLikeDislike.status).toBe(HTTP_STATUS.NO_CONTENT_204);
  });
  it('PUT -> `/posts/:postId/like-status`: should return error if :id from uri param not found; status 404;', async () => {
    const makeLikeDislike = await request(server)
      .put(`/posts/123456789012345678901234/like-status`)
      .set('Authorization', `Bearer ${createAccessTokenBody.accessToken}`)
      .send({
        likeStatus: 'None',
      });
    expect(makeLikeDislike.status).toBe(HTTP_STATUS.NOT_FOUND_404);
  });

  it('PUT -> `/posts/:postId/like-status`: should return error If the inputModel has incorrect values 400', async () => {
    const makeLikeDislike = await request(server)
      .put(`/posts/${postId1}/like-status`)
      .set('Authorization', `Bearer ${createAccessTokenBody.accessToken}`)
      .send({
        likeStatus: true,
      });
    expect(makeLikeDislike.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
  });

  it('PUT -> `/posts/:postId/like-status`: should return error If Unauthorized 401', async () => {
    const makeLikeDislike = await request(server)
      .put(`/posts/${postId1}/like-status`)
      .send({
        likeStatus: 'None',
      });
    expect(makeLikeDislike.status).toBe(HTTP_STATUS.NOT_AUTHORIZATION_401);
  });

  /********************************************************************************************/

  type inputDataBlogType = {
    name: string;
    description: string;
    websiteUrl: string;
  };

  type inputDataPostType = {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
  };
  let blogId: string;
  let inputDataBlog: inputDataBlogType;
  let inputDataPost: inputDataPostType;

  let id: string;

  let postId: string;
  it('make status like/dislike => return 204 status code', async () => {
    const updateLikeDiske = await request(server)
      .put(`/posts/${postId1}/like-status`)
      .set('Authorization', `Bearer ${createAccessTokenBody.accessToken}`)
      .send({
        likeStatus: 'None',
      });
    // console.log("updateLikeStatus: ", updateLikeDiske.body)
    expect(updateLikeDiske.status).toBe(HTTP_STATUS.NO_CONTENT_204);
  });

  it('make status like/dislike with incorrect input data => return 400 status code', async () => {
    const updateLikeDiske = await request(server)
      .put(`/posts/${postId1}/like-status`)
      .set('Authorization', `Bearer ${createAccessTokenBody.accessToken}`)
      .send({
        likeStatus: true,
      });
    expect(updateLikeDiske.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
    expect(updateLikeDiske.body).toStrictEqual(
      createErrorsMessageTest(['likeStatus']),
    );
  });

  it('make status like/dislike with empty input data of body  => return 400 status code', async () => {
    const updateLikeDiske = await request(server)
      .put(`/posts/${postId1}/like-status`)
      .set('Authorization', `Bearer ${createAccessTokenBody.accessToken}`)
      .send({});
    expect(updateLikeDiske.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
    expect(updateLikeDiske.body).toStrictEqual(
      createErrorsMessageTest(['likeStatus']),
    );
  });

  it('make status like/dislike without authorization => return 401 status code', async () => {
    const updateLikeDiske = await request(server)
      .put(`/posts/${postId1}/like-status`)
      .send({
        likeStatus: 'None',
      });
    expect(updateLikeDiske.status).toBe(HTTP_STATUS.NOT_AUTHORIZATION_401);
  });

  it('make status like/dislike without id=> return 404 status code', async () => {
    const updateLikeDiske = await request(server)
      .put(`/posts/123456789012345678901234/like-dislike`)
      .set('Authorization', `Bearer ${createAccessTokenBody.accessToken}`)
      .send({
        likeStatus: 'None',
      });
    expect(updateLikeDiske.status).toBe(HTTP_STATUS.NOT_FOUND_404);
  });

  /****************************** create new blog ***************************/

  it('create new post with correnct input data => return 201 status code', async () => {
    inputDataBlog = {
      name: 'Mickhael',
      description: 'new description',
      websiteUrl: 'https://google.com',
    };
    const createBlog = await request(server)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send(inputDataBlog);
    // console.log('str 395: ', createBlog.body);
    expect(createBlog.status).toBe(HTTP_STATUS.CREATED_201);
    expect(createBlog.body).toEqual({
      id: expect.any(String),
      name: inputDataBlog.name,
      description: inputDataBlog.description,
      websiteUrl: inputDataBlog.websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
    });

    blogId = createBlog.body.id;
    inputDataPost = {
      title: 'New title',
      shortDescription: 'new shortDescription',
      content:
        'My live is variable, I maked many diferent things and I had diferent profession',
      blogId: blogId,
    };

	

    const createNewPost = await request(server)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send(inputDataPost);
    expect(createNewPost.status).toBe(HTTP_STATUS.CREATED_201);

    expect(createNewPost.body).toEqual({
      id: expect.any(String),
      title: inputDataPost.title,
      shortDescription: inputDataPost.shortDescription,
      content: inputDataPost.content,
      blogId: blogId,
      blogName: inputDataBlog.name,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: expect.any(Number),
        dislikesCount: expect.any(Number),
        myStatus: expect.any(String),
        newestLikes: [
          //   {
          // 	"addedAt": "2023-12-13T11:39:16.432Z",
          // 	"userId": "string",
          // 	"login": "string"
          //   }
        ],
      },
    });


	const getPostId = await request(server)
	.get(`/posts/${createNewPost.body.id}`)
	.set(`Authorization`, `Bearer ${createAccessTokenBody.accessToken}`)
	expect(getPostId.status).toBe(HTTP_STATUS.OK_200)

	expect(getPostId.body.id).toEqual(expect.any(String))
	expect(getPostId.body.title).toEqual(inputDataPost.title)
	expect(getPostId.body.shortDescription).toEqual(inputDataPost.shortDescription)
	expect(getPostId.body.content).toEqual(inputDataPost.content)
	expect(getPostId.body.blogId).toEqual(blogId)
	expect(getPostId.body.blogName).toEqual(createBlog.body.name)
	expect(getPostId.body.createdAt).toEqual(expect.any(String))
	expect(getPostId.body.extendedLikesInfo.likesCount).toEqual(0)
	expect(getPostId.body.extendedLikesInfo.dislikesCount).toEqual(0)
	expect(getPostId.body.extendedLikesInfo.myStatus).toEqual('None')
	expect(getPostId.body.extendedLikesInfo.newestLikes).toEqual([])
    id = createNewPost.body.id;
  });
//   it('create new post with incorrect input data => return 400 status code', async () => {
//     const inputDataPost = {
//       title: 123,
//       shortDescription: 456,
//       content: "sls",
//       blogId: 123,
//     };
//     const createNewPost = await request(server)
//       .post('/posts')
//       .auth('admin', 'qwerty')
//       .send(inputDataPost);
//     expect(createNewPost.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
//     expect(createNewPost.body).toStrictEqual(postsValidationErrResPost);
//   });

  it('create new post with empty body => return 400 status code', async () => {
    const createNewPost = await request(server)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({});
    expect(createNewPost.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
    expect(createNewPost.body).toEqual(
      createErrorsMessageTest([
        'title',
        'shortDescription',
        'content',
        'blogId',
      ]),
    );
  });

  it('create new post without authorization => return 401 status code', async () => {
    const inputDataPost = {
      title: 'New title',
      shortDescription: 'new shortDescription',
      content:
        'My live is variable, I maked many diferent things and I had diferent profession',
      blogId: blogId,
    };
    const createNewPost = await request(server)
      .post('/posts')
      .send(inputDataPost);
    expect(createNewPost.status).toBe(HTTP_STATUS.NOT_AUTHORIZATION_401);
  });

//   it('return all posts with correct input data => return 200 status code', async () => {
//     const pageNumber = '1';
//     const pageSize = '10';
//     const sortBy = 'createAt';
//     const sortDirection = 'desc';

//     const getAllPost = await request(server).get(
//       `/posts?pageNumber=${pageNumber}&pageSize=${pageSize}&sortBy=${sortBy}&sortDirection=${sortDirection}`,
//     );
//     // .get('/posts').query({pageNumber: "1", pageSize: "10", sortBy: "createAt", sortDirection: "desc"})
//     expect(getAllPost.status).toBe(HTTP_STATUS.OK_200);
//     expect(getAllPost.body.pagesCount).toEqual(1);
//     expect(getAllPost.body.page).toEqual(1);
//     expect(getAllPost.body.pageSize).toEqual(10);
//     expect(getAllPost.body.totalCount).toEqual(2);
//     expect(getAllPost.body.items).toEqual([
//       {
//         ...firstPost,
//         id: expect.any(String),
//         createdAt: expect.any(String),
//       },
//       {
//         id: expect.any(String),
//         title: inputDataPost.title,
//         shortDescription: inputDataPost.shortDescription,
//         content: inputDataPost.content,
//         blogId: inputDataPost.blogId,
//         blogName: inputDataBlog.name,
//         createdAt: expect.any(String),
//         extendedLikesInfo: {
//           likesCount: expect.any(Number),
//           dislikesCount: expect.any(Number),
//           myStatus: expect.any(String),
//           // newestLikes: [
//           //   {
//           // 	"addedAt": "2023-12-13T11:39:16.432Z",
//           // 	"userId": "string",
//           // 	"login": "string"
//           //   }
//           // ]
//         },
//       },
//     ]);
//   });

  /****************************************** get post by postId ******************************/

  it('get post by id => return 200 status code', async () => {
    const getPostById = await request(server).get(`/posts/${id}`);
    // console.log('id: ', id);
    //   .set("Authorization", `Bearer ${createAccessTokenBody.accessToken}`);
    expect(getPostById.status).toBe(HTTP_STATUS.OK_200);
    expect(getPostById.body).toStrictEqual({
      id: id,
      title: inputDataPost.title,
      shortDescription: inputDataPost.shortDescription,
      content: inputDataPost.content,
      blogId: inputDataPost.blogId,
      blogName: inputDataBlog.name,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: expect.any(Number),
        dislikesCount: expect.any(Number),
        myStatus: expect.any(String),
        newestLikes: [
          //   {
          // 	"addedAt": "2023-12-13T11:39:16.432Z",
          // 	"userId": "string",
          // 	"login": "string"
          //   }
        ],
      },
    });
  });
/**************************** create comment by postId *************************/

  let content: string;
  let createdAt: string;
  it('get post by id with incorrect input data => return 400 status code', async () => {
    let id = '123456789012345678901234';
    const getPostByIdWithIncorrectData = await request(server)
      .get(`/posts/${id}`)
      .set('Authorization', `Bearer ${createAccessTokenBody.accessToken}`);
    expect(getPostByIdWithIncorrectData.status).toBe(HTTP_STATUS.NOT_FOUND_404);
    // expect(getPostByIdWithIncorrectData.body).toStrictEqual(createErrorsMessageTest(["id"]))
  });
  let createCommentByPostId: PostsViewModel;


  it('create comment by postId', async () => {
    postId = firstPost.id;
    const createCommentPostByPostId = await request(server)
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${createAccessTokenBody.accessToken}`)
      .send({
        content:
          'My profession is a programmer, I work in javascript and I work for back end developer',
      });

        createCommentByPostId = createCommentPostByPostId.body;
    	content = createCommentByPostId.content
    	createdAt = createCommentByPostId.createdAt
        expect(createCommentPostByPostId.status).toBe(HTTP_STATUS.CREATED_201);
        expect(createCommentByPostId).toEqual({
          id: expect.any(String),
          content: content,
          commentatorInfo: {
            userId: userId,
            userLogin: login,
          },
          createdAt: expect.any(String),
          likesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None",
          },
        });
      });
      it("create comment with incorrect input data => return 400 status code", async () => {
        const createCommentWithIncorrectData = await request(server)
          .post(`/posts/${postId}/comments`)
          .set("Authorization", `Bearer ${createAccessTokenBody.accessToken}`)
          .send({ content: "sls" });
        expect(createCommentWithIncorrectData.status).toBe(
          HTTP_STATUS.BAD_REQUEST_400
        );
        expect(createCommentWithIncorrectData.body).toStrictEqual(
          createErrorsMessageTest(["content"])
        );
      });
      it("create comment with empty input data of body => return 400 status code", async () => {
        const createCommentWithIncorrectData = await request(server)
          .post(`/posts/${postId}/comments`)
          .set("Authorization", `Bearer ${createAccessTokenBody.accessToken}`)
          .send({});
        expect(createCommentWithIncorrectData.status).toBe(
          HTTP_STATUS.BAD_REQUEST_400
        );
        expect(createCommentWithIncorrectData.body).toStrictEqual(
          createErrorsMessageTest(["content"])
        );
      });
      it("create comment without authorization => return 401 status code", async () => {
        const createCommentWithIncorrectData = await request(server)
          .post(`/posts/${postId}/comments`)
          .send({
            content:
              "My profession is a programmer, I work in javascript and I work for back end developer",
          });
		//   console.log("postId: ", postId)
        expect(createCommentWithIncorrectData.status).toBe(
          HTTP_STATUS.NOT_AUTHORIZATION_401
        );
      });
      it("create comment with empty input data of body => return 400 status code", async () => {
        const createCommentWithIncorrectData = await request(server)
          .post(`/posts/123456789012345678901234/comments`)
          .set("Authorization", `Bearer ${createAccessTokenBody.accessToken}`)
          .send({
            content:
              "My profession is a programmer, I work in javascript and I work for back end developer",
          });
        expect(createCommentWithIncorrectData.status).toBe(
          HTTP_STATUS.NOT_FOUND_404
        );
      });

      it("return comments for specified post by postId", async () => {
        const postId = firstPost.id;
        const pageNumber = "1";
        const pageSize = "10";
        const sortBy = "createdAt";
        const sortDirection = "desc";

        const getCommentByPost = await request(server)
          .get(`/posts/${postId}/comments`)
          .query({
            pageNumber: "1",
            pageSize: "10",
            sortBy: "createdAt",
            sortDirection: "desc",
          });
        expect(getCommentByPost.status).toBe(HTTP_STATUS.OK_200);
        expect(getCommentByPost.body).toEqual({
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 2,
        //   items: expect.any(Array),
		// items: getCommentByPost.body.items[0]
		items: getCommentByPost.body.items
        });
        expect(getCommentByPost.body.items).toHaveLength(2);
        expect(getCommentByPost.body.items[0]).toEqual({
          id: expect.any(String),
          content: content,
          commentatorInfo: {
            userId: userId,
            userLogin: login,
          },
          createdAt: createdAt,
          likesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None",
          },
        });
      });
      it("get comment by specified postId with incorrect postId => return 404 status code", async() => {
    	const postId = createCommentByPostId.id;
    	const pageNumber = "1"
    	const pageSize = "10"
    	const sortBy = "createdAt"
    	const sortDirection = "desc"

        const getCommentByPost = await request(server)
    	.get(`/comments/123456789012345678901234`)
    	.query({pageNumber: "1", pageSize: "10", sortBy: "createdAt", sortDirection: "desc"})
        expect(getCommentByPost.status).toBe(HTTP_STATUS.NOT_FOUND_404);
      })

      it("update existign post by id with input data => return 204 staus code", async() => {
    	const objUpdate = {
    		"title": "my new title",
    		"shortDescription": "my new shortDescription",
    		"content": "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
    		"blogId": blogId
    	}
    	const updatePostById = await request(server)
    	.put(`/posts/${postId}`)
    	.auth("admin", "qwerty")
    	.send(objUpdate)
    	expect(updatePostById.status).toBe(HTTP_STATUS.NO_CONTENT_204)
      })
      it("update existing post by id with empty body => return 400 status code", async() => {
    	const id = createCommentByPostId.id

    	const updatePostById = await request(server)
    	.put(`/posts/${id}`)
    	.auth("admin", "qwerty")
    	.send({})
    	expect(updatePostById.status).toBe(HTTP_STATUS.BAD_REQUEST_400)
    	expect(updatePostById.body).toStrictEqual(createErrorsMessageTest(["title", "shortDescription", "content", "blogId"]))
      })
    //   it("update existing post by id with empty incorrect input model => return 400 status code", async() => {
    // 	const id = createCommentByPostId.id

    // 	const updatePostById = await request(server)
    // 	.put(`/posts/${id}`)
    // 	.auth("admin", "qwerty")
    // 	.send({
    // 		"title": true,
    // 		"shortDescription": 123,
    // 		"content": null,
    // 		"blogId": Symbol()
    // 	})
    // 	expect(updatePostById.status).toBe(HTTP_STATUS.BAD_REQUEST_400)
    // 	expect(updatePostById.body).toStrictEqual(createErrorsMessageTest(["title", "shortDescription", "content", "blogId"]))
    //   })
      it("update existign post by id without authorization => return 401 status code", async() => {
    	const id = createCommentByPostId.id
    	const objUpdate = {
    		"title": "my new title",
    		"shortDescription": "my new shortDescription",
    		"content": "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
    		"blogId": blogId
    	}
    	const updatePostById = await request(server)
    	.put(`/posts/${id}`)
    	.send(objUpdate)
    	expect(updatePostById.status).toBe(HTTP_STATUS.NOT_AUTHORIZATION_401)
      })
      it("update existign post by id with not existing postId => return 401 status code", async() => {
    	const id = createCommentByPostId.id
    	const objUpdate = {
    		"title": "my new title",
    		"shortDescription": "my new shortDescription",
    		"content": "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
    		"blogId": blogId
    	}
    	const updatePostById = await request(server)
    	.put(`/posts/123456789012345678901234`)
    	.send(objUpdate)
    	expect(updatePostById.status).toBe(HTTP_STATUS.NOT_AUTHORIZATION_401)
      })

      it("delete post specified by id => return 204 status code", async() => {
    	const deletePostById = await request(server)
    	.delete(`/posts/${id}`)
    	.auth("admin", "qwerty")
    	expect(deletePostById.status).toBe(HTTP_STATUS.NO_CONTENT_204)
      })
      it("delete post specified by id => return 401 status code", async() => {
    	const deletePostById = await request(server)
    	.delete(`/posts/${id}`)
    	expect(deletePostById.status).toBe(HTTP_STATUS.NOT_AUTHORIZATION_401)
      })
      it("delete post specified by id => return 404 status code", async() => {
    	const deletePostById = await request(server)
    	.delete(`/posts/123456789012345678901234`)
    	.auth("admin", "qwerty")
    	expect(deletePostById.status).toBe(HTTP_STATUS.NOT_FOUND_404)
      })
  });
