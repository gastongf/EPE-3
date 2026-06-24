import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <div class="app-container">
      <div class="sidebar" *ngIf="auth.isLoggedIn">
        <div class="sidebar-header">
          <h3>VetSystem</h3>
        </div>
        <div class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active"><mat-icon>dashboard</mat-icon> Dashboard</a>
          <a routerLink="/sucursales" routerLinkActive="active" *ngIf="auth.user?.rol === 'superadmin'"><mat-icon>business</mat-icon> Sucursales</a>
          <a routerLink="/usuarios" routerLinkActive="active" *ngIf="auth.user?.rol === 'superadmin'"><mat-icon>people_outline</mat-icon> Usuarios</a>
          <a routerLink="/doctores" routerLinkActive="active" *ngIf="auth.user?.rol === 'superadmin' || auth.user?.rol === 'admin'"><mat-icon>local_hospital</mat-icon> Doctores</a>
          <a routerLink="/tutores" routerLinkActive="active" *ngIf="auth.user?.rol !== 'asistente'"><mat-icon>people</mat-icon> Tutores</a>
          <a routerLink="/pacientes" routerLinkActive="active"><mat-icon>pets</mat-icon> Pacientes</a>
          <a routerLink="/historial-clinico" routerLinkActive="active"><mat-icon>history</mat-icon> Historial Clínico</a>
          <a routerLink="/agenda" routerLinkActive="active" *ngIf="auth.user?.rol !== 'asistente'"><mat-icon>calendar_today</mat-icon> Agenda</a>
          <a routerLink="/facturacion" routerLinkActive="active" *ngIf="auth.user?.rol === 'superadmin' || auth.user?.rol === 'admin'"><mat-icon>receipt</mat-icon> Facturación</a>
          <a routerLink="/microchip" routerLinkActive="active"><mat-icon>search</mat-icon> Microchip</a>
        </div>
      </div>
      <div class="main-area">
        <div class="header" *ngIf="auth.isLoggedIn">
          <span *ngIf="auth.user">{{ auth.user.username }} ({{ auth.user.rol }})</span>
          <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>account_circle</mat-icon></button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="auth.logout()"><mat-icon>logout</mat-icon> Cerrar sesión</button>
          </mat-menu>
        </div>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: ['']
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
