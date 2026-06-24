import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Sucursal } from '../../shared/models';

@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, MatCardModule, MatSnackBarModule],
  template: `
    <div class="page-card">
      <div class="toolbar">
        <h1>Sucursales</h1>
        <button mat-raised-button color="primary" (click)="openForm()" *ngIf="auth.user?.rol === 'superadmin'"><mat-icon>add</mat-icon> Nueva Sucursal</button>
      </div>
      <table mat-table [dataSource]="data" class="mat-elevation-z2">
        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let r">{{ r.nombre }}</td>
        </ng-container>
        <ng-container matColumnDef="direccion">
          <th mat-header-cell *matHeaderCellDef>Dirección</th>
          <td mat-cell *matCellDef="let r">{{ r.direccion }}</td>
        </ng-container>
        <ng-container matColumnDef="comuna">
          <th mat-header-cell *matHeaderCellDef>Comuna</th>
          <td mat-cell *matCellDef="let r">{{ r.comuna }}</td>
        </ng-container>
        <ng-container matColumnDef="telefono">
          <th mat-header-cell *matHeaderCellDef>Teléfono</th>
          <td mat-cell *matCellDef="let r">{{ r.telefono }}</td>
        </ng-container>
        <ng-container matColumnDef="activa">
          <th mat-header-cell *matHeaderCellDef>Activa</th>
          <td mat-cell *matCellDef="let r">{{ r.activa ? 'Sí' : 'No' }}</td>
        </ng-container>
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let r">
            <button mat-icon-button color="primary" (click)="openForm(r)" *ngIf="auth.user?.rol === 'superadmin'"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="delete(r)" *ngIf="auth.user?.rol === 'superadmin'"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      </table>
      <div *ngIf="data.length === 0" style="text-align: center; padding: 20px; color: #666;">No hay sucursales registradas</div>
    </div>

    <div class="overlay" *ngIf="showForm" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <mat-card style="width: 500px; padding: 24px;">
        <h2>{{ editing ? 'Editar' : 'Nueva' }} Sucursal</h2>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Nombre</mat-label>
            <input matInput [(ngModel)]="form.nombre" required>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>RUT</mat-label>
            <input matInput [(ngModel)]="form.rut" required placeholder="77.777.777-7">
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Dirección</mat-label>
            <input matInput [(ngModel)]="form.direccion" required>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field>
            <mat-label>Región</mat-label>
            <input matInput [(ngModel)]="form.region" required>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Comuna</mat-label>
            <input matInput [(ngModel)]="form.comuna" required>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field>
            <mat-label>Teléfono</mat-label>
            <input matInput [(ngModel)]="form.telefono" required>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Email</mat-label>
            <input matInput [(ngModel)]="form.email" type="email" required>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-slide-toggle [(ngModel)]="form.activa">Activa</mat-slide-toggle>
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
export class SucursalesComponent implements OnInit {
  columns = ['nombre', 'direccion', 'comuna', 'telefono', 'activa', 'acciones'];
  data: Sucursal[] = [];
  showForm = false;
  editing: Sucursal | null = null;
  saving = false;
  form: any = { nombre: '', rut: '', direccion: '', region: '', comuna: '', telefono: '', email: '', activa: true };

  constructor(private api: ApiService, public auth: AuthService, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getAll<Sucursal>('/sucursales/').subscribe(data => this.data = data);
  }

  openForm(item?: Sucursal) {
    if (item) {
      this.editing = item;
      this.form = { ...item };
    } else {
      this.editing = null;
      this.form = { nombre: '', rut: '', direccion: '', region: '', comuna: '', telefono: '', email: '', activa: true };
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
      ? this.api.put<Sucursal>(`/sucursales/${this.editing.id}/`, this.form)
      : this.api.post<Sucursal>('/sucursales/', this.form);
    obs.subscribe({
      next: () => {
        this.snackBar.open('Sucursal guardada', 'Cerrar', { duration: 3000 });
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

  delete(item: Sucursal) {
    if (confirm(`¿Eliminar sucursal "${item.nombre}"?`)) {
      this.api.delete(`/sucursales/${item.id}/`).subscribe({
        next: () => {
          this.snackBar.open('Sucursal eliminada', 'Cerrar', { duration: 3000 });
          this.load();
        },
        error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 })
      });
    }
  }
}
