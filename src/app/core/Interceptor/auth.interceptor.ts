import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, filter, take, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((resp: any) => {
              isRefreshing = false;
              authService.saveTokens(resp.accessToken, resp.refreshToken);
              refreshSubject.next(resp.accessToken);
              return next(req.clone({ setHeaders: { Authorization: `Bearer ${resp.accessToken}` } }));
            }),
            catchError((err) => {
              isRefreshing = false;
              authService.clearTokens();
              return throwError(() => err);
            })
          );
        } else {
          return refreshSubject.pipe(
            filter(token => token != null),
            take(1),
            switchMap(token => next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })))
          );
        }
      }
      return throwError(() => error);
    })
  );
};