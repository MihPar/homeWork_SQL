import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PostClass, PostDocument } from '../../schema/post.schema';
import { Injectable } from '@nestjs/common';
import { LikeStatusEnum } from '../../api/likes/likes.emun';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(PostClass.name) private postModel: Model<PostDocument>,
  ) {}

  async createNewPosts(newPost: PostClass): Promise<PostClass | null> {
    try {
      const resultNewPost = await this.postModel.create(newPost);
      await resultNewPost.save();
      return newPost;
    } catch (error) {
      console.log(error, 'error in create post');
      return null;
    }
  }

  async updatePost(
    postId: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<boolean> {
    const result = await this.postModel.updateOne(
      { _id: new ObjectId(postId) },
      {
        $set: {
          title: title,
          shortDescription: shortDescription,
          content: content,
          blogId: blogId,
        },
      },
    );
    return result.matchedCount === 1;
  }

  async deletedPostById(id: string): Promise<boolean> {
    const result = await this.postModel.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  async deleteRepoPosts() {
    const deletedAll = await this.postModel.deleteMany({});
    return deletedAll.deletedCount === 1;
  }

  async increase(postId: string, likeStatus: string) {
    if (likeStatus === LikeStatusEnum.None) {
      return;
    }
    return await this.postModel.updateOne(
      { _id: new ObjectId(postId) },
      {
        $inc:
          likeStatus === 'Dislike'
            ? { 'extendedLikesInfo.dislikesCount': 1 }
            : { 'extendedLikesInfo.likesCount': 1 },
      },
    );
  }

  async decrease(postId: string, likeStatus: string) {
    if (likeStatus === LikeStatusEnum.None) {
      return;
    }
    return await this.postModel.updateOne(
      { _id: new ObjectId(postId) },
      {
        $inc:
          likeStatus === 'Dislike'
            ? { 'extendedLikesInfo.dislikesCount': -1 }
            : { 'extendedLikesInfo.likesCount': -1 },
      },
    );
  }

  async findPostById(blogId: string) {
    try {
      const post = await this.postModel
        .findOne({ blogId: new ObjectId(blogId) }, { __v: 0 })
        .lean();
      return post;
    } catch (error) {
      return null;
    }
  }
}
