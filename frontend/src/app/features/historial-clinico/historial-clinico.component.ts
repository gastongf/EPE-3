import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { FichaMedica, Mascota, Doctor } from '../../shared/models';

@Component({
  selector: 'app-historial-clinico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatSnackBarModule, MatTooltipModule],
  template: `
    <div class="page-card">
      <div class="toolbar">
        <h1>Historial Clínico</h1>
        <button mat-raised-button color="primary" *ngIf="(mascotaId || selectedMascota) && !publicMode && auth.user?.rol !== 'asistente'" (click)="openForm()">
          <mat-icon>add</mat-icon> Nueva Ficha
        </button>
      </div>

      <div *ngIf="!mascotaId && !publicMode && !codigo">
        <mat-form-field class="full-width">
          <mat-label>Seleccionar Paciente</mat-label>
          <mat-select [(ngModel)]="selectedMascota" (selectionChange)="loadHistorial()">
            <mat-option *ngFor="let m of mascotas" [value]="m.id">{{ m.nombre }} - {{ m.especie }} ({{ m.tutor_nombre }})</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div *ngIf="publicMode">
        <p>Accediendo al historial clínico de forma pública.</p>
      </div>

      <div *ngIf="mascota">
        <p><strong>Paciente:</strong> {{ mascota.nombre }} ({{ mascota.especie }}, {{ mascota.raza }})</p>
        <p><strong>Tutor:</strong> {{ mascota.tutor_nombre }}</p>
      </div>

      <table mat-table [dataSource]="data" class="mat-elevation-z2" style="margin-top: 16px;">
        <ng-container matColumnDef="fecha">
          <th mat-header-cell *matHeaderCellDef>Fecha</th>
          <td mat-cell *matCellDef="let r">{{ r.fecha }}</td>
        </ng-container>
        <ng-container matColumnDef="doctor">
          <th mat-header-cell *matHeaderCellDef>Doctor</th>
          <td mat-cell *matCellDef="let r">{{ r.doctor_nombre }}</td>
        </ng-container>
        <ng-container matColumnDef="diagnostico">
          <th mat-header-cell *matHeaderCellDef>Diagnóstico</th>
          <td mat-cell *matCellDef="let r">{{ r.diagnostico }}</td>
        </ng-container>
        <ng-container matColumnDef="peso">
          <th mat-header-cell *matHeaderCellDef>Peso</th>
          <td mat-cell *matCellDef="let r">{{ r.peso }} kg</td>
        </ng-container>
        <ng-container matColumnDef="temperatura">
          <th mat-header-cell *matHeaderCellDef>Temperatura</th>
          <td mat-cell *matCellDef="let r">{{ r.temperatura }} °C</td>
        </ng-container>
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let r">
            <button mat-icon-button color="primary" (click)="openForm(r, true)" matTooltip="Ver"><mat-icon>visibility</mat-icon></button>
            <button mat-icon-button color="accent" (click)="openForm(r, false)" matTooltip="Editar" *ngIf="auth.user?.rol !== 'asistente'"><mat-icon>edit</mat-icon></button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      </table>
      <div *ngIf="data.length === 0" style="text-align: center; padding: 20px; color: #666;">
        {{ publicMode ? 'No se encontraron registros con ese código' : 'No hay fichas médicas registradas' }}
      </div>
    </div>

    <div class="overlay" *ngIf="showForm" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <mat-card style="width: 700px; padding: 24px; max-height: 90vh; overflow-y: auto;">
        <h2>{{ viewing ? 'Detalle de Ficha' : editing ? 'Editar Ficha Médica' : 'Nueva Ficha Médica' }}</h2>
        <div class="form-row">
          <mat-form-field class="full-width" *ngIf="!viewing && !mascotaId">
            <mat-label>Paciente</mat-label>
            <mat-select [(ngModel)]="form.mascota" required>
              <mat-option *ngFor="let m of mascotas" [value]="m.id">{{ m.nombre }} - {{ m.tutor_nombre }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field>
            <mat-label>Fecha</mat-label>
            <input matInput [(ngModel)]="form.fecha" type="date" required [disabled]="viewing">
          </mat-form-field>
          <mat-form-field>
            <mat-label>Doctor</mat-label>
            <mat-select [(ngModel)]="form.doctor" required [disabled]="viewing">
              <mat-option *ngFor="let d of doctores" [value]="d.id">{{ d.nombre }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field>
            <mat-label>Peso (kg)</mat-label>
            <input matInput [(ngModel)]="form.peso" type="number" step="0.1" [disabled]="viewing">
          </mat-form-field>
          <mat-form-field>
            <mat-label>Temperatura</mat-label>
            <input matInput [(ngModel)]="form.temperatura" type="number" step="0.1" [disabled]="viewing">
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Diagnóstico</mat-label>
            <textarea matInput [(ngModel)]="form.diagnostico" rows="3" [disabled]="viewing"></textarea>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Tratamiento</mat-label>
            <textarea matInput [(ngModel)]="form.tratamiento" rows="3" [disabled]="viewing"></textarea>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Medicamentos</mat-label>
            <textarea matInput [(ngModel)]="form.medicamentos" rows="2" [disabled]="viewing"></textarea>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Exámenes</mat-label>
            <textarea matInput [(ngModel)]="form.examenes" rows="2" [disabled]="viewing"></textarea>
          </mat-form-field>
        </div>
        <div class="form-row" *ngIf="form.codigo_acceso">
          <mat-form-field class="full-width">
            <mat-label>Código de Acceso</mat-label>
            <input matInput [(ngModel)]="form.codigo_acceso" disabled>
          </mat-form-field>
        </div>
        <div class="actions" *ngIf="!viewing">
          <button mat-button (click)="closeForm()">Cancelar</button>
          <button mat-raised-button color="primary" (click)="save()" [disabled]="saving">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
        <div class="actions" *ngIf="viewing">
          <button mat-button (click)="closeForm()">Cerrar</button>
        </div>
      </mat-card>
    </div>
  `,
  styles: ['']
})
export class HistorialClinicoComponent implements OnInit {
  columns = ['fecha', 'doctor', 'diagnostico', 'peso', 'temperatura', 'acciones'];
  data: FichaMedica[] = [];
  mascotas: Mascota[] = [];
  doctores: Doctor[] = [];
  mascota: Mascota | null = null;
  mascotaId: string | null = null;
  selectedMascota: number | null = null;
  codigo: string | null = null;
  publicMode = false;
  showForm = false;
  viewing = false;
  editing: FichaMedica | null = null;
  saving = false;
  form: any = { mascota: null, doctor: null, sucursal: null, fecha: '', peso: null, temperatura: null, diagnostico: '', tratamiento: '', medicamentos: '', examenes: '', codigo_acceso: '' };

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const mascotaId = params.get('mascotaId');
      const codigo = params.get('codigo');
      this.mascotaId = mascotaId || null;
      this.codigo = codigo;

      if (codigo) {
        this.publicMode = true;
        this.loadPublicHistorial(codigo);
      } else if (this.mascotaId) {
        this.loadMascota(this.mascotaId);
        this.loadHistorial();
      } else {
        this.api.getAll<Mascota>('/pacientes/').subscribe(data => this.mascotas = data);
      }
      this.api.getAll<Doctor>('/doctores/').subscribe(data => this.doctores = data);
    });
  }

  loadMascota(id: string) {
    this.api.get<Mascota>(`/pacientes/${id}/`).subscribe(data => this.mascota = data);
  }

  loadHistorial() {
    const id = this.mascotaId || this.selectedMascota;
    if (id) {
      this.api.get<Mascota>(`/pacientes/${id}/`).subscribe(data => this.mascota = data);
      this.api.getAll<FichaMedica>('/fichas-medicas/', { mascota: id }).subscribe(data => this.data = data);
    }
  }

  loadPublicHistorial(codigo: string) {
    this.api.get<FichaMedica>('/fichas-medicas/acceso/', { codigo }).subscribe({
      next: data => this.data = [data],
      error: () => this.snackBar.open('Código de acceso inválido', 'Cerrar', { duration: 3000 })
    });
  }

  openForm(item?: FichaMedica, viewOnly = false) {
    if (item) {
      this.viewing = viewOnly;
      this.editing = viewOnly ? null : item;
      this.form = { ...item };
    } else {
      this.viewing = false;
      this.editing = null;
      const today = new Date().toISOString().split('T')[0];
      const id = this.mascotaId || this.selectedMascota;
      this.form = { mascota: id, doctor: null, sucursal: this.auth.user?.sucursal || null, fecha: today, peso: null, temperatura: null, diagnostico: '', tratamiento: '', medicamentos: '', examenes: '', codigo_acceso: '' };
    }
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.viewing = false;
    this.editing = null;
  }

  save() {
    this.saving = true;
    const obs = this.editing
      ? this.api.put<FichaMedica>(`/fichas-medicas/${this.editing.id}/`, this.form)
      : this.api.post<FichaMedica>('/fichas-medicas/', this.form);
    obs.subscribe({
      next: () => {
        this.snackBar.open('Ficha médica guardada', 'Cerrar', { duration: 3000 });
        this.closeForm();
        this.loadHistorial();
        this.saving = false;
      },
      error: () => {
        this.snackBar.open('Error al guardar', 'Cerrar', { duration: 3000 });
        this.saving = false;
      }
    });
  }
}
