import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/api.service';
import { Sucursal, Doctor, Mascota, Cita } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatTableModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page-card">
      <h1>Dashboard</h1>
      <div class="dashboard-cards">
        <mat-card class="stat-card">
          <mat-icon>business</mat-icon>
          <h2>{{ stats.sucursales }}</h2>
          <p>Sucursales</p>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon>local_hospital</mat-icon>
          <h2>{{ stats.doctores }}</h2>
          <p>Doctores</p>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon>pets</mat-icon>
          <h2>{{ stats.pacientes }}</h2>
          <p>Pacientes</p>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon>calendar_today</mat-icon>
          <h2>{{ stats.citasHoy }}</h2>
          <p>Citas Hoy</p>
        </mat-card>
      </div>

      <h2>Citas del Día</h2>
      <table mat-table [dataSource]="citasHoy" class="mat-elevation-z2">
        <ng-container matColumnDef="hora">
          <th mat-header-cell *matHeaderCellDef>Hora</th>
          <td mat-cell *matCellDef="let c">{{ c.hora }}</td>
        </ng-container>
        <ng-container matColumnDef="mascota">
          <th mat-header-cell *matHeaderCellDef>Mascota</th>
          <td mat-cell *matCellDef="let c">{{ c.mascota_nombre }}</td>
        </ng-container>
        <ng-container matColumnDef="doctor">
          <th mat-header-cell *matHeaderCellDef>Doctor</th>
          <td mat-cell *matCellDef="let c">{{ c.doctor_nombre }}</td>
        </ng-container>
        <ng-container matColumnDef="motivo">
          <th mat-header-cell *matHeaderCellDef>Motivo</th>
          <td mat-cell *matCellDef="let c">{{ c.motivo }}</td>
        </ng-container>
        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let c">{{ c.estado }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="citasColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: citasColumns;"></tr>
      </table>
      <div *ngIf="citasHoy.length === 0" style="text-align: center; padding: 20px; color: #666;">No hay citas programadas para hoy</div>
    </div>
  `,
  styles: ['']
})
export class DashboardComponent implements OnInit {
  stats = { sucursales: 0, doctores: 0, pacientes: 0, citasHoy: 0 };
  citasHoy: Cita[] = [];
  citasColumns = ['hora', 'mascota', 'doctor', 'motivo', 'estado'];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getAll<any>('/sucursales/').subscribe(data => this.stats.sucursales = data.length);
    this.api.getAll<any>('/doctores/').subscribe(data => this.stats.doctores = data.length);
    this.api.getAll<any>('/pacientes/').subscribe(data => this.stats.pacientes = data.length);
    const today = new Date().toISOString().split('T')[0];
    this.api.getAll<Cita>('/citas/', { fecha: today }).subscribe(data => {
      this.citasHoy = data;
      this.stats.citasHoy = data.length;
    });
  }
}
