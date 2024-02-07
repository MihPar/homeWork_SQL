import cookieParser from 'cookie-parser';
import { BadRequestException, INestApplication, ValidationError, ValidationPipe } from "@nestjs/common";
import { useContainer } from "class-validator";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from './infrastructura/exceptionFilters.ts/exceptionFilter';

export const appSettings = (app: INestApplication): void => {
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors: ValidationError[]): void => {
        const errorsForResp: any[] = [];
        errors.forEach((err: ValidationError): void => {
          const keys: string[] = Object.keys(err.constraints!);
          keys.forEach((k: string): void => {
            errorsForResp.push({
              message: err.constraints![k],
              field: err.property,
            });
          });
        });
        throw new BadRequestException(errorsForResp);
      },
    }),
  );
  	app.useGlobalFilters(new HttpExceptionFilter());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.enableCors()
    app.use(cookieParser())
}