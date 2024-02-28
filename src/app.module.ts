import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './api/auth/auth.controller';
import { AuthRepository } from './api/auth/auth.repository';
import { RecoveryPasswordUseCase } from './api/auth/useCase.ts/recoveryPassowrdUseCase';
import { NewPasswordUseCase } from './api/auth/useCase.ts/createNewPassword-use-case';
import { CreateLoginUseCase } from './api/auth/useCase.ts/createLogin-use-case';
import { CreateDeviceUseCase } from './api/auth/useCase.ts/createDevice-use-case';
import { RefreshTokenUseCase } from './api/auth/useCase.ts/refreshToken-use-case';
import { UpdateDeviceUseCase } from './api/security-devices/useCase/updateDevice-use-case';
import { RegistrationConfirmationUseCase } from './api/users/useCase/registratinConfirmation-use-case';
import { RegistrationUseCase } from './api/users/useCase/registration-use-case';
import { RegistrationEmailResendingUseCase } from './api/users/useCase/registrationEmailResending-use-case';
import { LogoutUseCase } from './api/security-devices/useCase/logout-use-case';
import { GetUserIdByTokenUseCase } from './api/auth/useCase.ts/getUserIdByToken-use-case';
import { Ratelimits } from './api/auth/guards/rateLimits';
import { CheckRefreshToken } from './api/auth/guards/checkRefreshToken';
import { IsConfirmed } from './api/auth/guards/isCodeConfirmed';
import { CheckLoginOrEmail } from './api/auth/guards/checkEmailOrLogin';
import { IsExistEmailUser } from './api/auth/guards/isExixtEmailUser';
import { CheckRefreshTokenForComments } from './api/comment/use-case/bearer.authForComments';
import { DeviceRepository } from './api/security-devices/device.repository';
import { DeviceQueryRepository } from './api/security-devices/deviceQuery.repository';
import { UsersRepository } from './api/users/users.repository';
import { DeleteAllDataController } from './api/delete/delete.allData';
import { AuthBasic } from './api/users/gards/basic.auth';
import { UsersController } from './api/users/users.controller';
import { DeleteUserByIdUseCase } from './api/users/useCase/deleteUserById-use-case';
import { DeleteAllUsersUseCase } from './api/users/useCase/deleteAllUsers-use-case';
import { EmailManager } from './infrastructura/email/email.manager';
import { GenerateHashAdapter } from './api/auth/adapter/generateHashAdapter';
import { JwtService } from '@nestjs/jwt';
import { ApiJwtService } from './infrastructura/jwt/jwt.service';
import { PayloadAdapter } from './api/auth/adapter/payload.adapter';
import { ApiConfigService } from './infrastructura/config/configService';
import { EmailAdapter } from './infrastructura/email/email.adapter';
import { CqrsModule } from '@nestjs/cqrs';
import { DeleteAllDevicesUseCase } from './api/security-devices/useCase/deleteAllDevices-use-case';
import { SecurityDeviceController } from './api/security-devices/device.controller';
import { TerminateAllCurrentSessionUseCase } from './api/security-devices/useCase/terminateAllCurrentSeccion-use-case';
import { UsersQueryRepository } from './api/users/users.queryRepository';
import { CreateNewUserUseCase } from './api/users/useCase/createNewUser-use-case';
import { CustomLoginvalidation } from './api/auth/adapter/customLoginValidator';
import { CustomEmailvalidation } from './api/auth/adapter/customEmailValidatro';
import { ThrottlerModule } from '@nestjs/throttler';
import { BlogsController } from './api/blogs/blogs.controller';
import { BlogsQueryRepository } from './api/blogs/blogs.queryReposity';
import { PostsQueryRepository } from './api/posts/postQuery.repository';
import { PostsService } from './api/posts/posts.service';
import { CheckRefreshTokenForGet } from './api/blogs/use-case/bearer.authGetComment';
import { DeleteAllBlogsUseCase } from './api/blogs/use-case/deletAllBlogs-use-case';
import { BlogsControllerForSA } from './api/blogsForSA/blogsForSA.controller';
import { BlogsQueryRepositoryForSA } from './api/blogsForSA/blogsForSA.queryReposity';
import { BlogsRepositoryForSA } from './api/blogsForSA/blogsForSA.repository';
import { ForbiddenCalss } from './api/security-devices/gards/forbidden';
import { updateExistingPostByIdWithBlogIdUseCase } from './api/blogsForSA/use-case/updatePostByIdWithBlogId-use-case';
import { DeletePostByIdCommandUseCase } from './api/blogsForSA/use-case/deletPostById-use-case';
import { DeleteAllPostsComand, DeleteAllPostsUseCase } from './api/posts/use-case/deleteAllPosts-use-case';
import { CreatePostUseCase } from './api/posts/use-case/createPost-use-case';
import { CreateNewBlogUseCase } from './api/blogs/use-case/createNewBlog-use-case';
import { BlogsRepository } from './api/blogs/blogs.repository';
import { PostsRepository } from './api/posts/posts.repository';
import { LikesRepository } from './api/likes/likes.repository';
import { DeleteAllBlogsForSAUseCase } from './api/blogsForSA/use-case/deletAllBlogs-use-case';
import { CreateNewBlogForSAUseCase } from './api/blogsForSA/use-case/createNewBlog-use-case';
import { UpdateBlogForSAUseCase } from './api/blogsForSA/use-case/updateBlog-use-case';
import { CheckRefreshTokenForSA } from './api/blogsForSA/guards/bearer.authGetComment';
import { DeleteBlogByIdForSAUseCase } from './api/blogsForSA/use-case/deleteBlogById-use-case';
import { CreateNewPostForBlogUseCase } from './api/blogsForSA/use-case/createNewPostForBlog-use-case';
import { PostController } from './api/posts/post.controller';
import { CommentQueryRepository } from './api/comment/comment.queryRepository';
import { UpdateCommentByCommentIdUseCase } from './api/comment/use-case/updateCommentByCommentId-use-case';
import { CommentRepository } from './api/comment/comment.repository';
import { CommentsController } from './api/comment/comments.controller';
import { DeleteAllCommentsUseCase } from './api/comment/use-case/deleteAllComments-use-case';
import { CreateNewCommentByPostIdUseCase } from './api/comment/use-case/createNewCommentByPotsId-use-case';
import { UpdateLikestatusForCommentUseCase } from './api/comment/use-case/updateLikeStatus-use-case';
import { UpdateLikeStatusForPostUseCase } from './api/posts/use-case/updateLikeStatus-use-case';
import { DeleteAllPostLikesUseCase } from './api/likes/use-case/deleteAllPostLikes-use-case';
import { DeleteAllCommentLikesUseCase } from './api/likes/use-case/deleteAllCommentLikes-use-case copy';

const useCases = [
  RecoveryPasswordUseCase,
  NewPasswordUseCase,
  CreateLoginUseCase,
  CreateDeviceUseCase,
  RefreshTokenUseCase,
  UpdateDeviceUseCase,
  RegistrationConfirmationUseCase,
  RegistrationUseCase,
  RegistrationEmailResendingUseCase,
  LogoutUseCase,
  GetUserIdByTokenUseCase,
  DeleteUserByIdUseCase,
  DeleteAllUsersUseCase,
  DeleteAllDevicesUseCase,
  TerminateAllCurrentSessionUseCase,
  CreateNewUserUseCase,
  DeleteAllBlogsUseCase,
  ForbiddenCalss,
  updateExistingPostByIdWithBlogIdUseCase,
  DeletePostByIdCommandUseCase,
  DeleteAllPostsComand,
  CreatePostUseCase,
  CreateNewBlogUseCase,
  DeleteAllBlogsForSAUseCase,
  DeleteAllPostsUseCase,
  CreateNewBlogForSAUseCase,
  UpdateBlogForSAUseCase,
  DeleteBlogByIdForSAUseCase,
  CreateNewPostForBlogUseCase,
  UpdateCommentByCommentIdUseCase,
  DeleteAllCommentsUseCase,
  CreateNewCommentByPostIdUseCase,
  UpdateLikestatusForCommentUseCase,
  UpdateLikeStatusForPostUseCase,
  DeleteAllPostLikesUseCase,
  DeleteAllCommentLikesUseCase
];

const gards = [
  Ratelimits,
  CheckRefreshToken,
  IsConfirmed,
  CheckLoginOrEmail,
  IsExistEmailUser,
  CheckRefreshTokenForComments,
  AuthBasic,
  CheckRefreshTokenForGet,
  CheckRefreshTokenForSA
];

const validation = [CustomLoginvalidation, CustomEmailvalidation]
const manager = [EmailManager]
const adapter = [GenerateHashAdapter, PayloadAdapter, EmailAdapter]
const services = [JwtService, ApiJwtService, PostsService]
const configs = [ApiConfigService]

const repositories = [AuthRepository, DeviceRepository, DeviceQueryRepository, UsersRepository, UsersQueryRepository, BlogsQueryRepository, PostsQueryRepository, BlogsQueryRepositoryForSA, BlogsRepositoryForSA, BlogsRepository, PostsRepository, LikesRepository, CommentQueryRepository, CommentRepository];

@Module({
  imports: [
	CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
	// ThrottlerModule.forRoot([{
	// 	ttl: 10000,
	// 	limit: 5,
	//   }]),
    // TypeOrmModule.forRoot({
    //   type: "postgres",
    //   host: "ep-weathered-mouse-a5h47925.us-east-2.aws.neon.tech",
    //   port: 5432,
    //   username: process.env.NAMENEON,
    //   password: process.env.PASSWORDNEON,
    //   database: "neondb",
    //   autoLoadEntities: false,
    //   synchronize: true,
	//   ssl: true
    // }),
	TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: "BankSystem",
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  controllers: [AuthController, DeleteAllDataController, UsersController, SecurityDeviceController, BlogsController, BlogsControllerForSA, PostController, CommentsController],

  providers: [
    ...repositories,
    ...useCases,
	...gards,
	...repositories,
	...manager,
	...adapter,
	...services,
	...configs,
	...validation
  ],
})
export class AppModule {}
