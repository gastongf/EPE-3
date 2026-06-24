import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../core/api.service';
import { Usuario, Sucursal } from '../../shared/models';

const ROL_LABELS: Record<string, string> = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  doctor: 'Doctor',
  asistente: 'Asistente',
};

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatCardModule, MatSnackBarModule],
  template: `
    <div class="page-card">
      <div class="toolbar">
        <h1>Usuarios</h1>
        <button mat-raised-button color="primary" (click)="openForm()"><mat-icon>add</mat-icon> Nuevo Usuario</button>
      </div>
      <table mat-table [dataSource]="data" class="mat-elevation-z2">
        <ng-container matColumnDef="username">
          <th mat-header-cell *matHeaderCellDef>Usuario</th>
          <td mat-cell *matCellDef="let r">{{ r.username }}</td>
        </ng-container>
        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let r">{{ r.first_name }} {{ r.last_name }}</td>
        </ng-container>
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let r">{{ r.email }}</td>
        </ng-container>
        <ng-container matColumnDef="rol">
          <th mat-header-cell *matHeaderCellDef>Rol</th>
          <td mat-cell *matCellDef="let r">{{ labelRol(r.rol) }}</td>
        </ng-container>
        <ng-container matColumnDef="sucursal">
          <th mat-header-cell *matHeaderCellDef>Sucursal</th>
          <td mat-cell *matCellDef="let r">{{ sucursalNombre(r.sucursal) }}</td>
        </ng-container>
        <ng-container matColumnDef="activo">
          <th mat-header-cell *matHeaderCellDef>Activo</th>
          <td mat-cell *matCellDef="let r">{{ r.is_active ? 'Sí' : 'No' }}</td>
        </ng-container>
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let r">
            <button mat-icon-button color="primary" (click)="openForm(r)" matTooltip="Editar"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="delete(r)" matTooltip="Eliminar"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      </table>
      <div *ngIf="data.length === 0" style="text-align: center; padding: 20px; color: #666;">No hay usuarios registrados</div>
    </div>

    <div class="overlay" *ngIf="showForm" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <mat-card style="width: 520px; padding: 24px;">
        <h2>{{ editing ? 'Editar' : 'Nuevo' }} Usuario</h2>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Nombre de usuario</mat-label>
            <input matInput [(ngModel)]="form.username" required>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Contraseña</mat-label>
            <input matInput [(ngModel)]="form.password" type="password" [required]="!editing" placeholder="{{ editing ? 'Dejar vacío para no cambiar' : '' }}">
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field>
            <mat-label>Nombres</mat-label>
            <input matInput [(ngModel)]="form.first_name">
          </mat-form-field>
          <mat-form-field>
            <mat-label>Apellidos</mat-label>
            <input matInput [(ngModel)]="form.last_name">
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Email</mat-label>
            <input matInput [(ngModel)]="form.email" type="email">
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field>
            <mat-label>Rol</mat-label>
            <mat-select [(ngModel)]="form.rol" required>
              <mat-option value="superadmin">Superadmin</mat-option>
              <mat-option value="admin">Admin</mat-option>
              <mat-option value="doctor">Doctor</mat-option>
              <mat-option value="asistente">Asistente</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Sucursal</mat-label>
            <mat-select [(ngModel)]="form.sucursal">
              <mat-option [value]="null">Sin sucursal</mat-option>
              <mat-option *ngFor="let s of sucursales" [value]="s.id">{{ s.nombre }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Teléfono</mat-label>
            <input matInput [(ngModel)]="form.telefono">
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-slide-toggle [(ngModel)]="form.is_active">Activo</mat-slide-toggle>
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
export class UsuariosComponent implements OnInit {
  columns = ['username', 'nombre', 'email', 'rol', 'sucursal', 'activo', 'acciones'];
  data: Usuario[] = [];
  sucursales: Sucursal[] = [];
  showForm = false;
  editing: Usuario | null = null;
  saving = false;
  form: any = { username: '', password: '', first_name: '', last_name: '', email: '', rol: 'asistente', sucursal: null, telefono: '', is_active: true };

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.load();
    this.api.getAll<Sucursal>('/sucursales/').subscribe(data => this.sucursales = data);
  }

  load() {
    this.api.getAll<Usuario>('/auth/usuarios/').subscribe(data => this.data = data);
  }

  labelRol(val: string): string { return ROL_LABELS[val] || val; }

  sucursalNombre(id: string | null): string {
    if (!id) return '—';
    const s = this.sucursales.find(s => s.id === id);
    return s ? s.nombre : '—';
  }

  openForm(item?: Usuario) {
    if (item) {
      this.editing = item;
      this.form = { ...item, password: '' };
    } else {
      this.editing = null;
      this.form = { username: '', password: '', first_name: '', last_name: '', email: '', rol: 'asistente', sucursal: null, telefono: '', is_active: true };
    }
    this.showForm = true;
  }

  closeForm() { this.showForm = false; this.editing = null; }

  save() {
    this.saving = true;
    const payload: any = { ...this.form };
    if (this.editing && !payload.password) {
      delete payload.password;
    }
    const obs = this.editing
      ? this.api.put<Usuario>(`/auth/usuarios/${this.editing.id}/`, payload)
      : this.api.post<Usuario>('/auth/usuarios/', payload);
    obs.subscribe({
      next: () => {
        this.snackBar.open('Usuario guardado', 'Cerrar', { duration: 3000 });
        this.closeForm();
        this.load();
        this.saving = false;
      },
      error: (err: any) => {
        const msg = err?.error ? (typeof err.error === 'string' ? err.error : JSON.stringify(err.error)) : err.message;
        this.snackBar.open('Error: ' + msg, 'Cerrar', { duration: 8000 });
        this.saving = false;
      }
    });
  }

  delete(item: Usuario) {
    if (confirm(`¿Eliminar usuario "${item.username}"?`)) {
      this.api.delete(`/auth/usuarios/${item.id}/`).subscribe({
        next: () => {
          this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 3000 });
          this.load();
        },
        error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 })
      });
    }
  }
}
