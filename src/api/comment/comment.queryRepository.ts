import { Injectable } from '@nestjs/common';
import { CommentViewModel } from './comment.type';
import { LikePost } from '../likes/likes.class';
import { PaginationType } from '../../types/pagination.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, ObjectId } from 'typeorm';
import { CommentClass } from './comment.class';
import { commentByPostView, commentDBToView } from '../../helpers';
import { LikeStatusEnum } from '../likes/likes.emun';

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {}

  async findCommentById(
    commentId: string,
    userId: string | null,
  ): Promise<CommentViewModel | null> {
    try {
		const query = `
			select *
				from public."Comments"
				where "id" = $1
		`
   const findCommentById = (await this.dataSource.query(query, [commentId]))[0]
//    console.log("findCommentById: ", findCommentById)
   const commentsLikeQuery = `
		select *
			from public."CommentLikes"
			where "commentId" = $1 and "userId" = $2
   `
   let myStatus: LikeStatusEnum = LikeStatusEnum.None;
		if(userId) {
			const commentLikeStatus = (await this.dataSource.query(commentsLikeQuery, [commentId, userId]))[0]
			myStatus = commentLikeStatus ? (commentLikeStatus.myStatus as LikeStatusEnum) : LikeStatusEnum.None
		}

	const viewModelComment = {...findCommentById, commentatorInfo: {userId: findCommentById.userId, userLogin: findCommentById.userLogin}}
      return commentDBToView(viewModelComment, myStatus);
    } catch (e) {
      return null;
    }
  }

  async findCommentsByPostId(
    postId: string,
    pageNumber: string,
    pageSize: string,
    sortBy: string,
    sortDirection: string,
    userId: string | null,
  ): Promise<PaginationType<CommentViewModel> | null> {
	const queryFindComment = `
		select *
			from public."Comments"
			where "postId" = $1
			order by "${sortBy}" ${sortDirection}
			limit $2 offset $3
	`
const commentsByPostId = await this.dataSource.query(queryFindComment, [
    postId,
    +pageSize,
    (+pageNumber - 1) * +pageSize,
  ])
  const queryCount = `
  	select count(*)
  		from public."Comments"
		where "postId" = $1
  `
  const commentsLikeQuery = `
		select *
			from public."CommentLikes"
			where "commentId" = $1 and "userId" = $2
	`


//   const viewModelComment = {
//     ...commentByPostId,
//     commentatorInfo: {
//       userId: commentByPostId.userId,
//       userLogin: commentByPostId.userLogin,
//     },
//   };

  const totalCount = (await this.dataSource.query(queryCount, [postId]))[0].count;
  const pagesCount: number = Math.ceil(+totalCount / +pageSize);
  const items: CommentViewModel[] = await Promise.all(
    commentsByPostId.map(async (item) => {
		let myStatus: LikeStatusEnum = LikeStatusEnum.None;
    if (userId) {
      const commentLikeStatus = (
        await this.dataSource.query(commentsLikeQuery, [
         item.id, userId,
        ])
      )[0];
      myStatus = commentLikeStatus
        ? (commentLikeStatus.myStatus as LikeStatusEnum)
        : LikeStatusEnum.None;
    }
    const distracrure = {
      ...item,
      commentatorInfo: { userId: item.userId, userLogin: item.userLogin },
    };
      return commentDBToView(distracrure, myStatus);
    })
  );
    return {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items,
    };
  }

  async findCommentByCommentId(commentId: string, userId?: string | null) {
	const query = `
		SELECT *
			FROM public."Comments"
			WHERE "id" = $1
	`
    const commentById = (await this.dataSource.query(query, [commentId]))[0]
    if (!commentById) {
      return null;
    }
	
	return {...commentById, commentatorInfo: {userId: commentById.userId, userLogin: commentById.userLogin}}
  }

  async getCommentsByPostId(postId: string): Promise<CommentClass | null> {
	const query = `
		select *
			from public."Comments"
			where "postId" = $1
	`
	const getCommentsById = (await this.dataSource.query(query, [postId]))[0]
	if(!getCommentsById) return null
	return getCommentsById
  }
}
