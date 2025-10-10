import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(NzMessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('🚨 Error Interceptor caught error:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message,
        error: error.error
      });

      if (error.error) {
        // Nếu BE trả về ApiResponse
        if (error.error.message) {
          console.error('📝 Backend message:', error.error.message);
          messageService.error(error.error.message);
        }
        if (error.error.errors && Array.isArray(error.error.errors)) {
          error.error.errors.forEach((e: any) => {
            console.error('📝 Backend error:', e);
            messageService.error(JSON.stringify(e));
          });
        }
      } else {
        // Lỗi mạng hoặc BE không phản hồi
        // messageService.error('Không thể kết nối đến server');
        console.error('HTTP Error:', error);
      }

      return throwError(() => error);
    })
  );
};
