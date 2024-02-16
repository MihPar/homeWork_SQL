import { Injectable } from '@nestjs/common';
import { CommentViewModel } from './comment.type';
import { Like } from '../likes/likes.class';
import { PaginationType } from '../../types/pagination.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, ObjectId } from 'typeorm';
import { CommentClass } from './comment.class';
import { commentByPostView, commentDBToView } from '../../helpers';

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
      if (!findCommentById) {
        return null;
      }
    //   const findLike: Like | null = await this.findLikeCommentByUser(
    //     commentId,
    //     userId,
    //   );
	const viewModelComment = {...findCommentById, commentatorInfo: {userId: findCommentById.userId, userLogin: findCommentById.userLogin}}
      return commentByPostView(viewModelComment);
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
			where "id" = $1
			order by "${sortBy}" ${sortDirection}
			limit $2 offset $3
	`
const commentByPostId = (await this.dataSource.query(query1, [
    postId,
    +pageSize,
    (+pageNumber - 1) * +pageSize,
  ]))[0]

  const count = `
  	select count(*)
  		from from public."Comments"
		where "id" = $1
  `
const totalCount = (await this.dataSource.query(count, [postId]))[0].count
const pagesCount: number = Math.ceil(totalCount / +pageSize);

const items: CommentViewModel[] = await Promise.all(
      commentByPostId.map(async (item) => {
        const commnent = commentByPostView(item);
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

  async findCommentByCommentId(commentId: string, userId?: string | null) {
	const query = `
		SELECT *
			FROM public."Comments"
			WHERE "id" = $1
	`
    const commentById: CommentClass | null = (await this.dataSource.query(query, [commentId]))[0]
    if (!commentById) {
      return null;
    }
	return commentById
  }

  async getCommentsByPostId(id: string): Promise<CommentClass | null> {
	const query = `
		select *
			from public."Comments"
			where "id" = $1
	`
	const getCommentsById = (await this.dataSource.query(query, [id]))[0]
	if(!getCommentsById) return null
	return getCommentsById
  }
}
