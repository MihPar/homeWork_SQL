import { Injectable } from '@nestjs/common';
import { CommentViewModel } from './comment.type';
import { Like } from '../likes/likes.class';
import { PaginationType } from '../../types/pagination.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, ObjectId } from 'typeorm';
import { CommentClass } from './comment.class';
import { commentDBToView } from '../../helpers';

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {}

  async findCommentById(
    commentId: string,
    userId: string | null,
  ): Promise<CommentViewModel | null> {
	if(!ObjectId.isValid(commentId)) return null
    try {
      const commentById: CommentClass | null = await this.commentModel.findOne({
        _id: new ObjectId(commentId),
      });
      if (!commentById) {
        return null;
      }
      const findLike: Like | null = await this.findLikeCommentByUser(
        commentId,
        userId,
      );
      return commentDBToView(commentById, findLike?.myStatus ?? null);
    } catch (e) {
      return null;
    }
  }

//   async findLikeCommentByUser(commentId: string, userId: string | null) {
//     const likeModel: Like | null = await this.likeModel.findOne({
//       $and: [{ userId: userId }, { commentId: commentId }],
//     });
//     return likeModel;
//   }

  async findCommentByPostId(
    postId: string,
    pageNumber: string,
    pageSize: string,
    sortBy: string,
    sortDirection: string,
    userId: string | null,
  ): Promise<PaginationType<CommentViewModel> | null> {
	const query1 = `
		select *
			from public."Comments"
			where "postid" = $1
			order by $2 ${sortDirection}
			limit $3 offset $4
	`
const commentByPostId = (await this.dataSource.query(query1, [
    postId,
    sortBy,
    +pageSize,
    (+pageNumber - 1) * +pageSize,
  ]))[0]

  const count = `
  	select count(*)
  		from from public."Comments"
		where "postId" = $1
  `
const totalCount = (await this.dataSource.query(count, [postId]))[0].count
const pagesCount: number = Math.ceil(totalCount / +pageSize);

const query2 = `
  	select p."likesCount", p."dislikesCount", p."myStatus"
  		from "Posts" as p
		where p."postId" = $1
`
const likeStatus = (await this.dataSource.query(query2, [postId]))[0]
const items: CommentViewModel[] = await Promise.all(
      commentByPostId.map(async (item) => {
        const commnent = commentDBToView(item, likeStatus);
        return commnent;
      }),
    );
    return {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items,
    };
  }

//   async findCommentByCommentId(commentId: string, userId?: ObjectId | null) {
// 	if(!ObjectId.isValid(commentId)) return null
//     const commentById: CommentClass | null = await this.commentModel.findOne({
//       _id: new ObjectId(commentId),
//     });
//     if (!commentById) {
//       return null;
//     }
// 	return commentById
//   }
}
