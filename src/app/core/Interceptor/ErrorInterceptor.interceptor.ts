import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(NzMessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error) {
        // Nếu BE trả về ApiResponse
        if (error.error.message) {
          messageService.error(error.error.message);
        }
        if (error.error.errors && Array.isArray(error.error.errors)) {
          error.error.errors.forEach((e: any) => messageService.error(JSON.stringify(e)));
        }
      } else {
        // Lỗi mạng hoặc BE không phản hồi
        messageService.error('Không thể kết nối đến server');
      }

      return throwError(() => error);
    })
  );
};
