import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Tutor } from '../../shared/models';

@Component({
  selector: 'app-tutores',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatCardModule, MatSnackBarModule],
  template: `
    <div class="page-card">
      <div class="toolbar">
        <h1>Tutores</h1>
        <div>
          <mat-form-field style="width: 200px; margin-right: 8px;">
            <mat-label>Buscar por RUT</mat-label>
            <input matInput [(ngModel)]="searchRut" (keyup.enter)="search()">
          </mat-form-field>
          <button mat-stroked-button (click)="search()"><mat-icon>search</mat-icon></button>
          <button mat-raised-button color="primary" (click)="openForm()" style="margin-left: 8px;" *ngIf="auth.user?.rol !== 'asistente'"><mat-icon>add</mat-icon> Nuevo Tutor</button>
        </div>
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
        <ng-container matColumnDef="telefono">
          <th mat-header-cell *matHeaderCellDef>Teléfono</th>
          <td mat-cell *matCellDef="let r">{{ r.telefono }}</td>
        </ng-container>
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let r">{{ r.email }}</td>
        </ng-container>
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let r">
            <button mat-icon-button color="primary" (click)="openForm(r)" *ngIf="auth.user?.rol !== 'asistente'"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="delete(r)" *ngIf="auth.user?.rol === 'superadmin' || auth.user?.rol === 'admin'"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      </table>
      <div *ngIf="data.length === 0" style="text-align: center; padding: 20px; color: #666;">No hay tutores registrados</div>
    </div>

    <div class="overlay" *ngIf="showForm" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <mat-card style="width: 500px; padding: 24px;">
        <h2>{{ editing ? 'Editar' : 'Nuevo' }} Tutor</h2>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Nombre completo</mat-label>
            <input matInput [(ngModel)]="form.nombre" required>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field>
            <mat-label>RUT</mat-label>
            <input matInput [(ngModel)]="form.rut" required>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Teléfono</mat-label>
            <input matInput [(ngModel)]="form.telefono" required>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field>
            <mat-label>Email</mat-label>
            <input matInput [(ngModel)]="form.email" type="email">
          </mat-form-field>
          <mat-form-field>
            <mat-label>Dirección</mat-label>
            <input matInput [(ngModel)]="form.direccion">
          </mat-form-field>
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
export class TutoresComponent implements OnInit {
  columns = ['nombre', 'rut', 'telefono', 'email', 'acciones'];
  data: Tutor[] = [];
  searchRut = '';
  showForm = false;
  editing: Tutor | null = null;
  saving = false;
  form: any = { nombre: '', rut: '', direccion: '', telefono: '', email: '' };

  constructor(private api: ApiService, public auth: AuthService, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getAll<Tutor>('/tutores/').subscribe(data => this.data = data);
  }

  search() {
    if (this.searchRut) {
      this.api.getAll<Tutor>('/tutores/', { rut: this.searchRut }).subscribe(data => this.data = data);
    } else {
      this.load();
    }
  }

  openForm(item?: Tutor) {
    if (item) {
      this.editing = item;
      this.form = { ...item };
    } else {
      this.editing = null;
      this.form = { nombre: '', rut: '', direccion: '', telefono: '', email: '' };
    }
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editing = null;
  }

  save() {
    this.saving = true;
    const obs = this.editing
      ? this.api.put<Tutor>(`/tutores/${this.editing.id}/`, this.form)
      : this.api.post<Tutor>('/tutores/', this.form);
    obs.subscribe({
      next: () => {
        this.snackBar.open('Tutor guardado', 'Cerrar', { duration: 3000 });
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

  delete(item: Tutor) {
    if (confirm(`¿Eliminar tutor "${item.nombre}"?`)) {
      this.api.delete(`/tutores/${item.id}/`).subscribe({
        next: () => {
          this.snackBar.open('Tutor eliminado', 'Cerrar', { duration: 3000 });
          this.load();
        },
        error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 })
      });
    }
  }
}
