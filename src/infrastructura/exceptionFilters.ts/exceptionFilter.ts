import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

// @Catch(Error)
// export class ErrorExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();
//     // const status = exception.getStatus();

//     if (process.env.envorinment !== "production") {
//       response.status(500).send({error: exception.toString(), stack: exception.stack});
//     } else {
// 		response.status(500).send("some error ocurred");
// 	}
//   }
// }

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 400) {
      const errorResponse = {
        errorsMessages: [] as any[],
      };
      const responseBody: any = exception.getResponse();
      if (typeof responseBody === 'string') {
        errorResponse.errorsMessages.push(responseBody);
      } else if (typeof responseBody !== undefined) {
        responseBody.message.forEach((m: any) =>
          errorResponse.errorsMessages.push(m),
        );
      }
      response.status(status).json(errorResponse);
    } else {
      console.log(exception.getResponse() as any);
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
