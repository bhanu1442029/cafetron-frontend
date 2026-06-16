import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401 && authService.isLoggedIn()) {
          authService.logout();
          router.navigate(['/login']);
        }

        // Let feature pages handle 403s locally. Redirecting here can make a
        // routed component appear to never load, especially on vendor pages.
      }

      return throwError(() => error);
    })
  );
};
