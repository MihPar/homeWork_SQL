import request from "supertest";
import dotenv from "dotenv";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../src/modules/app.module";
import { appSettings } from "../../../src/setting";
import { HTTP_STATUS } from "../../../src/utils/utils";
import { CommentViewModel } from "../../../src/api/comment/comment.type";
import { createAddUser, createToken } from "../../../src/utils/helpers";
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

describe('/like', () => {
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

  //   beforeEach(async () => {
  //     const wipeAllRes = await request(app).delete("/testing/all-data").send();
  //   });
  type TokenType = {
    accessToken: string;
  };

  let commentBody: CommentViewModel;
  let token: TokenType;
  let token2: string;

  describe('make like/dislike => return 204 status code', () => {
    it('PUT -> /comments/:commentId/like-status: create comment then: status 204; used additional methods: POST user,  POST => /blogs, POST => /posts, POST => /posts/:postId/comments, GET => /comments/:id;', async () => {
      // create user(login, psw)!!!!!!
      //accwessToken = loginUser
      //blogId = createBlog
      //postId = createPost
      //comment = createComment

      /************** crate users ***************/

      const createUser = await request(server)
        .post('/users')
        .auth('admin', 'qwerty')
        .send({
          login: 'Michail',
          password: 'qwerty1',
          email: '1mpara7472@gmail.com',
        });
      expect(createUser.status).toBe(HTTP_STATUS.CREATED_201);
      expect(createUser.body).toEqual({
        id: expect.any(String),
        login: 'Michail',
        email: '1mpara7472@gmail.com',
        createdAt: expect.any(String),
      });

      /************** create access token **************************/

      const loginOrEmail = createUser.body.login;
      const createAccessToken = await request(server).post('/auth/login').send({
        loginOrEmail: loginOrEmail,
        password: 'qwerty1',
      });

      token = createAccessToken.body;

      expect(createAccessToken.status).toBe(HTTP_STATUS.OK_200);
      expect(token).toEqual({
        accessToken: expect.any(String),
      });

      /****************************** create blogs ******************************/

      const createBlogs = await request(server)
        .post('/blogs')
        .auth('admin', 'qwerty')
        .send({
          name: 'Michail',
          description: 'my description',
          websiteUrl: 'https://learn.javascript.ru',
        });
      expect(createBlogs.status).toBe(HTTP_STATUS.CREATED_201);
      expect(createBlogs.body).toEqual({
        id: expect.any(String),
        name: 'Michail',
        description: 'my description',
        websiteUrl: 'https://learn.javascript.ru',
        createdAt: expect.any(String),
        isMembership: false,
      });
      const blogId1 = createBlogs.body.id;
      const blogName1 = createBlogs.body.name;

      /******************************** create Posts ******************************/

      const createPosts = await request(server)
        .post('/posts')
        .auth('admin', 'qwerty')
        .send({
          title: 'new title',
          shortDescription: 'new shortDescription',
          content:
            'myContent I like javascript and I will be a developer in javascript, back end developer',
          blogId: blogId1,
        });

      expect(createPosts.status).toBe(HTTP_STATUS.CREATED_201);
      expect(createPosts.body.id).toEqual(expect.any(String));
      expect(createPosts.body.title).toEqual('new title');
      expect(createPosts.body.shortDescription).toEqual('new shortDescription');
      expect(createPosts.body.shortDescription).toEqual('new shortDescription');
      expect(createPosts.body.content).toEqual(
        'myContent I like javascript and I will be a developer in javascript, back end developer',
      );
      expect(createPosts.body.blogId).toEqual(blogId1);
      expect(createPosts.body.blogName).toEqual(blogName1);
      expect(createPosts.body.createdAt).toEqual(expect.any(String));

      //   expect(createPosts.body).toEqual({
      //     id: expect.any(String),
      //     title: "new title",
      //     shortDescription: "new shortDescription",
      //     content:
      //       "myContent I like javascript and I will be a developer in javascript, back end developer",
      //     blogId: blogId1,
      //     blogName: blogName1,
      //     createdAt: expect.any(String),
      //   });

      const postId = createPosts.body.id;
      const userId = createUser.body.id;
      const login = createUser.body.login;

      /******************************* create comments by post id ***********************************/

      const createCommentPostByPostId = await request(server)
        .post(`/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${createAccessToken.body.accessToken}`)
        .send({
          content:
            'My profession is a programmer, I work in javascript and I work for back end developer',
        });
      commentBody = createCommentPostByPostId.body;
      expect(createCommentPostByPostId.status).toBe(HTTP_STATUS.CREATED_201);
      expect(commentBody).toEqual({
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

      /*************************** update comments by commentsId (like/dislike) ******************************/

      const commentId = createCommentPostByPostId.body.id;
      const updateCommentByCommentId = await request(server)
        .put(`/comments/${commentId}/like-status`)
        .set('Authorization', `Bearer ${createAccessToken.body.accessToken}`)
        .send({ likeStatus: 'None' });
      expect(updateCommentByCommentId.status).toBe(HTTP_STATUS.NO_CONTENT_204);
    });

    it('make like/dislike if input data is empty body => return 400 status code', async () => {
      const commentId = commentBody.id;
      let tokenAccess = token.accessToken;
      const updateCommentByCommentId = await request(server)
        .put(`/comments/${commentId}/like-status`)
        .set('Authorization', `Bearer ${tokenAccess}`)
        .send({});
      expect(updateCommentByCommentId.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
      expect(updateCommentByCommentId.body).toStrictEqual(
        createErrorsMessageTest(['likeStatus']),
      );
    });
    it('make like/dislike if input data is incorrect => return 400 status code', async () => {
      const commentId = commentBody.id;
      let tokenAccess = token.accessToken;
      const updateCommentByCommentId = await request(server)
        .put(`/comments/${commentId}/like-status`)
        .set('Authorization', `Bearer ${tokenAccess}`)
        .send({ likeStatus: true });
      expect(updateCommentByCommentId.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
      expect(updateCommentByCommentId.body).toStrictEqual(
        createErrorsMessageTest(['likeStatus']),
      );
    });
    it('make like/dislike without authorization => return 401 status code', async () => {
      const commentId = commentBody.id;
      const updateCommentByCommentId = await request(server)
        .put(`/comments/${commentId}/like-status`)
        .send({ likeStatus: 'None' });
      expect(updateCommentByCommentId.status).toBe(
        HTTP_STATUS.NOT_AUTHORIZATION_401,
      );
    });
    it('make like/dislike with doesn`t existing id => return 404 status code', async () => {
      let tokenAccess = token.accessToken;
      const updateCommentByCommentId = await request(server)
        .put(`/comments/123456789012345678901234/like-status`)
        .set('Authorization', `Bearer ${tokenAccess}`)
        .send({ likeStatus: 'None' });
      expect(updateCommentByCommentId.status).toBe(HTTP_STATUS.NOT_FOUND_404);
    });
  });
  describe('update existing comment by id with correct input model', function () {
    it('create new user', async () => {
      const createUserNext = await request(server)
        .post('/users')
        .auth('admin', 'qwerty')
        .send({
          login: 'Tatiana',
          password: 'qwerty2',
          email: '2mpara7472@gmail.com',
        });
      expect(createUserNext.status).toBe(HTTP_STATUS.CREATED_201);
      expect(createUserNext.body).toEqual({
        id: expect.any(String),
        login: 'Tatiana',
        email: '2mpara7472@gmail.com',
        createdAt: expect.any(String),
      });
      const loginOrEmail = createUserNext.body.login;
      const createAccessTokenNew = await request(server)
        .post('/auth/login')
        .send({
          loginOrEmail: loginOrEmail,
          password: 'qwerty2',
        });
      expect(createAccessTokenNew.status).toBe(HTTP_STATUS.OK_200);
      expect(createAccessTokenNew.body).toEqual({
        accessToken: expect.any(String),
      });
      token2 = createAccessTokenNew.body.accessToken;
    });
    const updateObj = {
      content: 'My daughter`s name is Maria, she is nine',
    };
    it('update existing comment by id => return 204 status code', async () => {
      const updateCommentById = await request(server)
        .put(`/comments/${commentBody.id}`)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(updateObj);
      expect(updateCommentById.status).toBe(HTTP_STATUS.NO_CONTENT_204);
    });
    it('update existing comment by id with incorrect input model=> return 400 status code', async () => {
      const updateObj = {
        content: 'sj',
      };
      const updateCommentById = await request(server)
        .put(`/comments/${commentBody.id}`)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(updateObj);
      expect(updateCommentById.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
      expect(updateCommentById.body).toEqual(
        createErrorsMessageTest(['content']),
      );
    });
    it('update existing comment by id with empty body=> return 400 status code', async () => {
      const updateObj = {};
      const updateCommentById = await request(server)
        .put(`/comments/${commentBody.id}`)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(updateObj);
      expect(updateCommentById.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
      expect(updateCommentById.body).toEqual(
        createErrorsMessageTest(['content']),
      );
    });
    it('update existing comment by id => return 204 status code', async () => {
      const updateObj = {
        content: 'My daughter`s name is Maria, she is nine',
      };
      const updateCommentById = await request(server)
        .put(`/comments/${commentBody.id}`)
        .send(updateObj);
      expect(updateCommentById.status).toBe(HTTP_STATUS.NOT_AUTHORIZATION_401);
    });
    it('update existing comment by id => return 204 status code', async () => {
      const updateObj = {
        content: 'My daughter`s name is Maria, she is nine',
      };
      const updateCommentById = await request(server)
        .put(`/comments/123456789012345678901234`)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(updateObj);
      expect(updateCommentById.status).toBe(HTTP_STATUS.NOT_FOUND_404);
    });
    it('update existing comment by id => return 204 status code', async () => {
      const updateObj = {
        content: 'My daughter`s name is Maria, she is nine',
      };
      const updateCommentById = await request(server)
        .put(`/comments/${commentBody.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .send(updateObj);
      expect(updateCommentById.status).toBe(HTTP_STATUS.FORBIDEN_403);
    });
  });

  describe('return comment by id', () => {
    it('get comment by id with correct input data => return 200 status code', async () => {
      const getCommentById = await request(server)
        .get(`/comments/${commentBody.id}`)
        .set('Authorization', `Bearer ${token.accessToken}`);
      expect(getCommentById.status).toBe(HTTP_STATUS.OK_200);
      expect(getCommentById.body).toStrictEqual({
        id: commentBody.id,
        content: expect.any(String),
        commentatorInfo: {
          userId: commentBody.commentatorInfo.userId,
          userLogin: commentBody.commentatorInfo.userLogin,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });

    it('get comment by id with doesn`t existing comment => return 404 status code', async () => {
      const getCommentById = await request(server)
        .get(`/comments/123456789012345678901234`)
        .set('Authorization', `Bearer ${token.accessToken}`);
      expect(getCommentById.status).toBe(HTTP_STATUS.NOT_FOUND_404);
    });
  });
  describe('delete comment specified by id => return 204 status code', () => {
    it('delete comment with correct input data return 404 status code', async () => {
      const deleteCommentById = await request(server)
        .delete(`/comments/${commentBody.id}`)
        .set('Authorization', `Bearer ${token2}`);
      expect(deleteCommentById.status).toBe(HTTP_STATUS.FORBIDEN_403);
    });
    it('delete comment without uesr`s authorazing return 401 status code', async () => {
      const deleteCommentById = await request(server).delete(
        `/comments/${commentBody.id}`,
      );
      expect(deleteCommentById.status).toBe(HTTP_STATUS.NOT_AUTHORIZATION_401);
    });
    it('delete comment with correct input data', async () => {
      const deleteCommentById = await request(server)
        .delete(`/comments/${commentBody.id}`)
        .set('Authorization', `Bearer ${token.accessToken}`);
      expect(deleteCommentById.status).toBe(HTTP_STATUS.NO_CONTENT_204);
    });
    it('delete comment without existing commentId return 404 status code', async () => {
      const deleteCommentById = await request(server)
        .delete(`/comments`)
        .set('Authorization', `Bearer ${token.accessToken}`);
      expect(deleteCommentById.status).toBe(HTTP_STATUS.NOT_FOUND_404);
    });
  });

  describe('update like status by commentId', () => {
    it(`create comment then: like the comment by user 1, user 2, user 3, user 4. get the comment after each like by user 1. ; status 204; used additional methods: POST => /blogs, POST => /posts, POST => /posts/:postId/comments, GET => /comments/:id`, async () => {
    //   let updateComment;

      // 1

      const userShema1 = {
        login: 'Mikail',
        password: 'qwerty',
        email: 'aparam72@gamil.com',
      };
      const user1 = await createAddUser(server, userShema1);
      const token1 = await createToken(server, 'Mikail', 'qwerty');

	  const createBlog = await request(server)
	  .post('/blogs')
	  .auth('admin', 'qwerty')
	  .send({
		"name": "Mikail",
		"description": "weiruyqweeryqweruiweuriweruiwer",
		"websiteUrl": "https://google.com"
	  })

	  const blogId = createBlog.body.id

	  const createPost = await request(server)
	  .post('/posts')
	  .auth('admin', 'qwerty')
	  .send({
		"title": "new title",
		"shortDescription": "ksdjfskfjskdfjsdfk",
		"content": "asdfjksdjdfksjddfkjsdsfkjsdkfjsjf",
		"blogId": blogId
	  })
	  const postId = createPost.body.id

	  const createCommmentByPostId = await request(server)
	  .post(`/posts/${postId}/comments`)
	  .set('Authorization', `Bearer ${token1.body.accessToken}`)
	  .send({
		"content": "stringstringstringstsedweefseeasewe"
	  })
	  .expect(201)

      await request(server)
        .put(`/comments/${createCommmentByPostId.body.id}/like-status`)
        .set('Authorization', `Bearer ${token1.body.accessToken}`)
        .send({
          likeStatus: 'Like',
        })
		.expect(204)

      // 2

      const userShema2 = {
        login: 'djdasd',
        password: 'oppoppo',
        email: 'aparam72@gamil.com',
      };
      const user2 = await createAddUser(server, userShema2);
      const token2 = await createToken(server, 'djdasd', 'oppoppo');

      await request(server)
        .put(`/comments/${createCommmentByPostId.body.id}/like-status`)
        .set('Authorization', `Bearer ${token2.body.accessToken}`)
        .send({
          likeStatus: 'Like',
        })
		.expect(204)

      // 3

      const userShema3 = {
        login: 'cxvxvc',
        password: 'yjtjtye',
        email: 'aparam72@gamil.com',
      };
      const user3 = await createAddUser(server, userShema3);
      const token3 = await createToken(server, 'cxvxvc', 'yjtjtye');

     await request(server)
        .put(`/comments/${createCommmentByPostId.body.id}/like-status`)
        .set('Authorization', `Bearer ${token3.body.accessToken}`)
        .send({
          likeStatus: 'Like',
        })
		.expect(204)

      // 4

      const userShema4 = {
        login: 'ghjhj',
        password: 'dfsgsdfh',
        email: 'aparam72@gamil.com',
      };
      const user4 = await createAddUser(server, userShema4);
      const token4 = await createToken(server, 'ghjhj', 'dfsgsdfh');

      await request(server)
        .put(`/comments/${createCommmentByPostId.body.id}/like-status`)
        .set('Authorization', `Bearer ${token4.body.accessToken}`)
        .send({
          likeStatus: 'Like',
        })
		.expect(204)

		console.log("createCommmentByPostId.body: ", createCommmentByPostId.body)
      const getCommentUser1 = await request(server)
	  .get(`/comments/${createCommmentByPostId.body.id}`,)
	  .set('Authorization', `Bearer ${token4.body.accessToken}`)
	  console.log("getCommentUser1.body: ", getCommentUser1.body)

      expect(getCommentUser1.status).toBe(HTTP_STATUS.OK_200);
      expect(getCommentUser1.body).toEqual({
        id: expect.any(String),
        content: expect.any(String),
        commentatorInfo: {
          userId: user1.body.id,
          userLogin: userShema1.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 4,
          dislikesCount: 0,
          myStatus: 'Like',
        },
      });
    });
  });
});
