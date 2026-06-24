import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Doctor, Sucursal } from '../../shared/models';

@Component({
  selector: 'app-doctores',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatSlideToggleModule, MatSnackBarModule],
  template: `
    <div class="page-card">
      <div class="toolbar">
        <h1>Doctores</h1>
        <button mat-raised-button color="primary" (click)="openForm()" *ngIf="auth.user?.rol === 'superadmin' || auth.user?.rol === 'admin'"><mat-icon>add</mat-icon> Nuevo Doctor</button>
      </div>
      <table mat-table [dataSource]="data" class="mat-elevation-z2">
        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let r">{{ r.nombre }}</td>
        </ng-container>
        <ng-container matColumnDef="rut">
          <th mat-header-cell *matHeaderCellDef>RUT</th>
          <td mat-cell *matCellDef="let r">{{ r.rut }}</td>
        </ng-container>
        <ng-container matColumnDef="especialidad">
          <th mat-header-cell *matHeaderCellDef>Especialidad</th>
          <td mat-cell *matCellDef="let r">{{ r.especialidad }}</td>
        </ng-container>
        <ng-container matColumnDef="sucursal">
          <th mat-header-cell *matHeaderCellDef>Sucursal</th>
          <td mat-cell *matCellDef="let r">{{ r.sucursal_nombre }}</td>
        </ng-container>
        <ng-container matColumnDef="activo">
          <th mat-header-cell *matHeaderCellDef>Activo</th>
          <td mat-cell *matCellDef="let r">{{ r.activo ? 'Sí' : 'No' }}</td>
        </ng-container>
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let r">
            <button mat-icon-button color="primary" (click)="openForm(r)" *ngIf="auth.user?.rol === 'superadmin' || auth.user?.rol === 'admin'"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="delete(r)" *ngIf="auth.user?.rol === 'superadmin' || auth.user?.rol === 'admin'"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      </table>
      <div *ngIf="data.length === 0" style="text-align: center; padding: 20px; color: #666;">No hay doctores registrados</div>
    </div>

    <div class="overlay" *ngIf="showForm" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <mat-card style="width: 560px; padding: 24px; max-height: 90vh; overflow-y: auto;">
        <h2>{{ editing ? 'Editar' : 'Nuevo' }} Doctor</h2>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Nombre completo</mat-label>
            <input matInput [(ngModel)]="form.nombre" required placeholder="Dr. Carlos Pérez">
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field>
            <mat-label>RUT</mat-label>
            <input matInput [(ngModel)]="form.rut" required>
          </mat-form-field>
          <mat-form-field>
            <mat-label>N° Registro</mat-label>
            <input matInput [(ngModel)]="form.numero_registro" required>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Especialidad</mat-label>
            <input matInput [(ngModel)]="form.especialidad" required>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Sucursal</mat-label>
            <mat-select [(ngModel)]="form.sucursal" required [disabled]="auth.user?.rol !== 'admin'">
              <mat-option *ngFor="let s of sucursalesFiltradas" [value]="s.id">{{ s.nombre }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div *ngIf="!editing" style="background: #e3f2fd; padding: 12px; border-radius: 8px; margin: 8px 0;">
          <h3 style="margin: 0 0 8px; font-size: 14px; color: #1565c0;">DATOS DE ACCESO</h3>
          <div class="form-row">
            <mat-form-field>
              <mat-label>Usuario</mat-label>
              <input matInput [(ngModel)]="form.username" required>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput [(ngModel)]="form.email" type="email" required>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput [(ngModel)]="form.password" type="password" required>
            </mat-form-field>
          </div>
        </div>
        <div class="form-row">
          <mat-slide-toggle [(ngModel)]="form.activo">Activo</mat-slide-toggle>
        </div>
        <div class="actions">
          <button mat-button (click)="closeForm()">Cancelar</button>
          <button mat-raised-button color="primary" (click)="save()" [disabled]="saving">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: ['']
})
export class DoctoresComponent implements OnInit {
  columns = ['nombre', 'rut', 'especialidad', 'sucursal', 'activo', 'acciones'];
  data: Doctor[] = [];
  sucursales: Sucursal[] = [];
  sucursalesFiltradas: Sucursal[] = [];
  showForm = false;
  editing: Doctor | null = null;
  saving = false;
  form: any = { nombre: '', rut: '', numero_registro: '', especialidad: '', horarios: {}, sucursal: null, activo: true, username: '', email: '', password: '' };

  constructor(private api: ApiService, public auth: AuthService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.load();
    this.api.getAll<Sucursal>('/sucursales/').subscribe(data => {
      this.sucursales = data;
      if (this.auth.user?.rol !== 'admin' && this.auth.user?.sucursal) {
        this.sucursalesFiltradas = data.filter(s => s.id === this.auth.user?.sucursal);
      } else {
        this.sucursalesFiltradas = data;
      }
    });
  }

  load() {
    this.api.getAll<Doctor>('/doctores/').subscribe(data => this.data = data);
  }

  openForm(item?: Doctor) {
    if (item) {
      this.editing = item;
      this.form = { ...item };
    } else {
      this.editing = null;
      this.form = { nombre: '', rut: '', numero_registro: '', especialidad: '', horarios: {}, sucursal: null, activo: true, username: '', email: '', password: '' };
    }
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editing = null;
  }

  save() {
    this.saving = true;
    const body: any = { ...this.form };
    if (this.editing) {
      delete body.username;
      delete body.email;
      delete body.password;
    }
    const obs = this.editing
      ? this.api.put<Doctor>(`/doctores/${this.editing.id}/`, body)
      : this.api.post<Doctor>('/doctores/', body);
    obs.subscribe({
      next: () => {
        this.snackBar.open('Doctor guardado', 'Cerrar', { duration: 3000 });
        this.closeForm();
        this.load();
        this.saving = false;
      },
      error: () => {
        this.snackBar.open('Error al guardar', 'Cerrar', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  delete(item: Doctor) {
    if (confirm(`¿Eliminar doctor "${item.nombre}"?`)) {
      this.api.delete(`/doctores/${item.id}/`).subscribe({
        next: () => {
          this.snackBar.open('Doctor eliminado', 'Cerrar', { duration: 3000 });
          this.load();
        },
        error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 })
      });
    }
  }
}
