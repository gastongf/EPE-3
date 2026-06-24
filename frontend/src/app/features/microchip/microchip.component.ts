import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../core/api.service';
import { Mascota, Tutor } from '../../shared/models';

@Component({
  selector: 'app-microchip',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="page-card">
      <h1>Búsqueda por Microchip</h1>
      <div class="form-row">
        <mat-form-field style="flex: 1;">
          <mat-label>Código de Microchip</mat-label>
          <input matInput [(ngModel)]="chipCode" (keyup.enter)="buscar()" placeholder="Ingrese código de microchip">
        </mat-form-field>
        <button mat-raised-button color="primary" (click)="buscar()" [disabled]="!chipCode">
          <mat-icon>search</mat-icon> Buscar
        </button>
      </div>

      <div *ngIf="loading" style="text-align: center; padding: 20px;">Buscando...</div>

      <div *ngIf="mascota" style="margin-top: 20px;">
        <mat-card style="padding: 20px; margin-bottom: 16px;">
          <h2>Datos de la Mascota</h2>
          <div class="form-row">
            <p><strong>Nombre:</strong> {{ mascota.nombre }}</p>
            <p><strong>Especie:</strong> {{ mascota.especie }}</p>
            <p><strong>Raza:</strong> {{ mascota.raza }}</p>
            <p><strong>Color:</strong> {{ mascota.color }}</p>
            <p><strong>Sexo:</strong> {{ mascota.sexo }}</p>
            <p><strong>Microchip:</strong> {{ mascota.microchip }}</p>
          </div>
        </mat-card>

        <mat-card style="padding: 20px; margin-bottom: 16px;" *ngIf="tutor">
          <h2>Datos del Tutor</h2>
          <div class="form-row">
            <p><strong>Nombre:</strong> {{ tutor.nombre }}</p>
            <p><strong>RUT:</strong> {{ tutor.rut }}</p>
            <p><strong>Teléfono:</strong> {{ tutor.telefono }}</p>
            <p><strong>Email:</strong> {{ tutor.email }}</p>
            <p><strong>Dirección:</strong> {{ tutor.direccion }}</p>
          </div>
          <div style="margin-top: 12px;">
            <button mat-raised-button color="accent" (click)="notificar()" [disabled]="notificando">
              <mat-icon>notifications</mat-icon>
              {{ notificando ? 'Enviando...' : 'Notificar al Tutor' }}
            </button>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: ['']
})
export class MicrochipComponent {
  chipCode = '';
  mascota: Mascota | null = null;
  tutor: Tutor | null = null;
  loading = false;
  notificando = false;

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  buscar() {
    if (!this.chipCode) return;
    this.loading = true;
    this.mascota = null;
    this.tutor = null;
    this.api.get<Mascota[]>('/pacientes/buscar-microchip/', { chip: this.chipCode }).subscribe({
      next: data => {
        this.loading = false;
        if (data.length > 0) {
          this.mascota = data[0];
          if (this.mascota.tutor) {
            this.api.get<Tutor>(`/tutores/${this.mascota.tutor}/`).subscribe(t => this.tutor = t);
          }
        } else {
          this.snackBar.open('No se encontró mascota con ese microchip', 'Cerrar', { duration: 3000 });
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error al buscar microchip', 'Cerrar', { duration: 3000 });
      }
    });
  }

  notificar() {
    if (!this.mascota) return;
    this.notificando = true;
    this.api.post('/notificaciones/', {
      tutor: this.mascota.tutor,
      mascota: this.mascota.id,
      tipo: 'recordatorio',
      mensaje: `Recordatorio: Su mascota ${this.mascota.nombre} tiene un microchip registrado (${this.mascota.microchip}). Por favor mantenga sus datos actualizados.`
    }).subscribe({
      next: () => {
        this.notificando = false;
        this.snackBar.open('Notificación enviada al tutor', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.notificando = false;
        this.snackBar.open('Error al enviar notificación', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
