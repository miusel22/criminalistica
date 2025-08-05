import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUser: any = null;

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: {username: string, password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('access_token', response.access_token);
      }),
      switchMap(() => this.fetchAndSetProfile())
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  fetchAndSetProfile(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      this.logout();
      return of(null);
    }
    
    return this.http.get(`${this.apiUrl}/auth/profile`).pipe(
      tap(user => {
        this.currentUser = user;
      }),
      catchError(err => {
        console.error("Error fetching profile, logging out.", err);
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUser = null;
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getCurrentUser(): any {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}