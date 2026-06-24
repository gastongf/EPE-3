import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number; username: string; email: string;
  rol: string; sucursal: string | null; sucursal_nombre?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('access_token');
    if (token) { this.loadUser(); }
  }

  get user(): User | null { return this.userSubject.value; }
  get isLoggedIn(): boolean { return !!localStorage.getItem('access_token'); }
  get userRole(): string { return this.user?.rol || ''; }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login/`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);
        this.loadUser();
      })
    );
  }

  loadUser() {
    this.http.get<User>(`${environment.apiUrl}/auth/me/`).subscribe({
      next: user => this.userSubject.next(user),
      error: () => this.logout()
    });
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
