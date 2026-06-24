import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <h2>VetSystem - Iniciar Sesión</h2>
        <form (ngSubmit)="onLogin()">
          <mat-form-field class="full-width">
            <mat-label>Usuario</mat-label>
            <input matInput [(ngModel)]="username" name="username" required autocomplete="username">
            <mat-icon matPrefix>person</mat-icon>
          </mat-form-field>
          <mat-form-field class="full-width">
            <mat-label>Contraseña</mat-label>
            <input matInput [(ngModel)]="password" name="password" type="password" required autocomplete="current-password">
            <mat-icon matPrefix>lock</mat-icon>
          </mat-form-field>
          <div *ngIf="error" style="color: red; margin-bottom: 12px; text-align: center;">{{ error }}</div>
          <button mat-raised-button color="primary" class="full-width" type="submit" [disabled]="loading">
            <mat-spinner *ngIf="loading" diameter="20" style="display: inline-block; margin-right: 8px;"></mat-spinner>
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>
      </mat-card>
    </div>
  `,
  styles: ['']
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Error al iniciar sesión. Verifica tus credenciales.';
      }
    });
  }
}
