// import { appSettings } from './../src/setting';
// import { AppModule } from './../src/modules/app.module';
// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersService } from './../src/api/users/user.service';
// import { UsersQueryRepository } from './../src/api/users/users.queryRepository';
// import { EmailManager } from './../src/api/manager/email.manager';
// import { UsersRepository } from './../src/api/users/user.repository';
// import { EmailAdapter } from '../src/api/adapter/email.adapter';
// import { MongoMemoryServer } from 'mongodb-memory-server';
// import mongoose from 'mongoose';
// import { UserViewType } from '../src/api/users/user.type';
// import { ObjectId } from 'mongodb';
// import {v4 as uuidv4} from "uuid"
// import { add } from 'date-fns';
// import { HttpStatus, INestApplication } from '@nestjs/common';
// import { request } from 'http';


// jest.setTimeout(100000000)

// describe('Blogs e2e', async () => {
// //   let mongoServer: MongoMemoryServer;
//   let app: INestApplication
//   let httpServer

//   beforeAll(async () => {
//     // mongoServer = await MongoMemoryServer.create();
//     // const mongoUri = mongoServer.getUri();
//     // await mongoose.connect(mongoUri);

// 	const moduleFixture: TestingModule = await Test.createTestingModule({
// 		imports: [AppModule] 
// 	}).compile()
// 	app = moduleFixture.createNestApplication()
// 	appSettings(app)
// 	await app.init()
// 	httpServer = app.getHttpServer()
//   });

//   afterAll(async () => {
//     // await mongoose.disconnect();
//     // await mongoServer.stop();
// 	await app.close()
//   });

// //   const usersRepository = new UsersRepository(userModel);
// //   const emailAdapterMock: jest.Mocked<EmailAdapter> = {
// //     sendEmail: jest.fn(),
// //   };
// //   const emailAdapter = new EmailAdapter()
// //   const emailManager = new EmailManager(emailAdapter);
// //   const usersQueryRepository = new UsersQueryRepository(userModel);
// //   const usersService = new UsersService(
// //     usersRepository,
// //     emailManager,
// //     emailAdapterMock,
// //     usersQueryRepository,
// //   );

// beforeAll(async(): Promise<void> => {
// 	const moduleFixture: TestingModule = await Test.createTestingModule({
// 		imports: [AppModule]
// 	}).TestingModuleBuilder
// 	.overrideProvider(EmailService)
// 	.useClass(EmailServiceMock)
// 	.compile()

// 	app = moduleFixture.createNestApplication()
// 	appSettings(app)
// 	await app.init()
// 	httpServer = app.getHttpServer()
// })

//   describe('create blog', (): void => {
//     it('blog should created', async (): Promise<void> => {
//       request(httpServer).post('/blogs').expect(HttpStatus.CREATED)
//   });
// })

//   describe("confirmEmail", () => {

// 	it("should return false for expired confirmation code", async () => {
		
// 	})
//   })
// });