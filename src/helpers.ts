import request from 'supertest';
import { CommentClass } from "./api/comment/comment.class";
import { CommentViewModel } from "./api/comment/comment.type";
import { LikeStatusEnum } from "./api/likes/likes.emun";
import { InputModelClassCreateBody } from "./api/users/user.class";

export const commentDBToView = (
  item: CommentClass,
  myStatus: LikeStatusEnum | null
): CommentViewModel => {
  return {
    id: item.id!.toString(),
    content: item.content,
    commentatorInfo: item.commentatorInfo,
    createdAt: item.createdAt,
    likesInfo: {
      likesCount: item?.likesCount || 0,
      dislikesCount: item?.dislikesCount || 0,
      myStatus: myStatus || LikeStatusEnum.None,
    },
  };
};

export const createAddUser = async (server: any, body: InputModelClassCreateBody) => {
	const createUser = await request(server)
	  .post(`/users`)
	  .auth('admin', 'qwerty')
	  .send(body)
	  return createUser
}

export const createToken = async (server: any, loginOrEmail: string, password: string) => {
	const createAccessToken = await request(server)
		.post('/auth/login')
		.send({
		  loginOrEmail,
		  password
		});
	return createAccessToken
}

export const aDescribe = (skip: boolean): jest.Describe => {
	if(skip) {return describe.skip}
	return describe
}
