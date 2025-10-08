import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  // Gắn Authorization header nếu có token
  let cloned = req;
  if (accessToken) {
    cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    });
  }

  return next(cloned).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Token hết hạn → xử lý refresh
        return handle401Error(authService, cloned, next);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(authService: AuthService, req: HttpRequest<any>, next: HttpHandlerFn) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((tokens) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokens.accessToken);

        return next(
          req.clone({
            setHeaders: { Authorization: `Bearer ${tokens.accessToken}` },
          })
        );
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    // Nếu đang refresh → chờ token mới rồi gửi lại request
    return refreshTokenSubject.pipe(
      filter((token) => token != null),
      take(1),
      switchMap((token) =>
        next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
      )
    );
  }
}
