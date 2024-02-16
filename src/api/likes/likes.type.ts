import { LikeStatusEnum } from "./likes.emun"

export interface LikesInfoViewModel {
    dislikesCount: number
    likesCount: number
	myStatus: LikeStatusEnum,
	newestLikes: NewestLikesType[]
}

export type NewestLikesType = {
    addedAt: string,
    userId: string,
    login: string,
}

export interface LikesInfoModel {
    dislikesCount: number
    likesCount: number
}

export type likeInfoType = {
	likesCount: number
    dislikesCount: number
	myStatus: LikeStatusEnum
}