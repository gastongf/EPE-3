import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Cita, Mascota, Doctor, Sucursal, Factura } from '../../shared/models';

interface TimeSlot {
  hora: string;
  disponible: boolean;
  cita?: Cita;
}

const METODO_PAGO_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta_credito: 'Tarjeta crédito',
  tarjeta_debito: 'Tarjeta débito',
  transferencia: 'Transferencia',
};

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatSnackBarModule],
  template: `
    <div class="page-card">
      <div class="toolbar">
        <h1>Agenda de Citas</h1>
        <div>
          <button mat-raised-button color="primary" (click)="openForm()"><mat-icon>add</mat-icon> Nueva Cita</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">
        <button mat-icon-button (click)="cambiarDia(-1)"><mat-icon>chevron_left</mat-icon></button>
        <mat-form-field style="width: 180px;">
          <input matInput [(ngModel)]="fechaSeleccionada" type="date" (dateChange)="load()">
        </mat-form-field>
        <button mat-icon-button (click)="cambiarDia(1)"><mat-icon>chevron_right</mat-icon></button>
        <button mat-stroked-button (click)="irHoy()">Hoy</button>
        <mat-form-field style="width: 200px; margin-left: 16px;">
          <mat-label>Filtrar Doctor</mat-label>
          <mat-select [(ngModel)]="filtroDoctor" (selectionChange)="load()">
            <mat-option value="">Todos</mat-option>
            <mat-option *ngFor="let d of doctores" [value]="d.id">{{ d.nombre }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field style="width: 150px;">
          <mat-label>Filtrar estado</mat-label>
          <mat-select [(ngModel)]="filtroEstado" (selectionChange)="load()">
            <mat-option value="">Todos</mat-option>
            <mat-option value="agendada">Agendada</mat-option>
            <mat-option value="confirmada">Confirmada</mat-option>
            <mat-option value="en_atencion">En Atención</mat-option>
            <mat-option value="realizada">Realizada</mat-option>
            <mat-option value="cancelada">Cancelada</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <h3>Horarios para {{ fechaFormateada }}</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
        <div *ngFor="let slot of timeSlots" (click)="slot.disponible ? abrirParaSlot(slot.hora) : null"
          style="width: 100px; padding: 10px; border-radius: 6px; text-align: center; cursor: pointer; font-size: 13px; transition: 0.2s;"
          [style.background]="slot.disponible ? '#e8f5e9' : '#ffebee'"
          [style.border]="slot.disponible ? '1px solid #66bb6a' : '1px solid #ef9a9a'"
          [style.color]="slot.disponible ? '#2e7d32' : '#c62828'"
          [style.cursor]="slot.disponible ? 'pointer' : 'default'"
          [style.opacity]="slot.disponible ? 1 : 0.7">
          <strong>{{ slot.hora }}</strong><br>
          <small>{{ slot.disponible ? 'Disponible' : (slot.cita?.mascota_nombre || 'Ocupado') }}</small>
        </div>
      </div>

      <h3>Citas del Día</h3>
      <table mat-table [dataSource]="data" class="mat-elevation-z2">
        <ng-container matColumnDef="hora">
          <th mat-header-cell *matHeaderCellDef>Hora</th>
          <td mat-cell *matCellDef="let r">{{ r.hora }}</td>
        </ng-container>
        <ng-container matColumnDef="mascota">
          <th mat-header-cell *matHeaderCellDef>Mascota</th>
          <td mat-cell *matCellDef="let r">{{ r.mascota_nombre }}</td>
        </ng-container>
        <ng-container matColumnDef="doctor">
          <th mat-header-cell *matHeaderCellDef>Doctor</th>
          <td mat-cell *matCellDef="let r">{{ r.doctor_nombre }}</td>
        </ng-container>
        <ng-container matColumnDef="motivo">
          <th mat-header-cell *matHeaderCellDef>Motivo</th>
          <td mat-cell *matCellDef="let r">{{ r.motivo }}</td>
        </ng-container>
        <ng-container matColumnDef="estado">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let r">
              {{ r.estado }}
              <span *ngIf="paidCitaIds.has(r.id)" style="margin-left: 6px; background: #4caf50; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;">Pagada</span>
            </td>
        </ng-container>
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let r">
            <button mat-icon-button color="primary" (click)="openForm(r)" matTooltip="Editar"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="accent" [routerLink]="'/historial-clinico/' + r.mascota" matTooltip="Historial"><mat-icon>history</mat-icon></button>
            <button mat-icon-button color="accent" (click)="openFicha(r)" matTooltip="Ficha médica" *ngIf="r.estado === 'realizada' || r.estado === 'en_atencion'"><mat-icon>note_add</mat-icon></button>
            <button mat-raised-button color="primary" style="line-height: 28px; font-size: 12px; min-width: 60px;" (click)="openPago(r)" matTooltip="Pagar" *ngIf="r.estado === 'realizada'"><mat-icon style="font-size: 16px;">payments</mat-icon> Pagar</button>
            <button mat-icon-button color="warn" (click)="delete(r)" matTooltip="Eliminar"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="citasColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: citasColumns;"></tr>
      </table>
      <div *ngIf="data.length === 0" style="text-align: center; padding: 20px; color: #666;">No hay citas para esta fecha</div>
    </div>

    <!-- Modal: Crear/Editar Cita -->
    <div class="overlay" *ngIf="showForm" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <mat-card style="width: 600px; padding: 24px;">
        <h2>{{ editing ? 'Editar' : 'Nueva' }} Cita</h2>
        <div class="form-row">
          <mat-form-field>
            <mat-label>Fecha</mat-label>
            <input matInput [(ngModel)]="form.fecha" type="date" required>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Hora</mat-label>
            <input matInput [(ngModel)]="form.hora" type="time" required>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Mascota</mat-label>
            <mat-select [(ngModel)]="form.mascota" required>
              <mat-option *ngFor="let m of mascotas" [value]="m.id">{{ m.nombre }} - {{ m.tutor_nombre }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field>
            <mat-label>Doctor</mat-label>
            <mat-select [(ngModel)]="form.doctor" required>
              <mat-option *ngFor="let d of doctores" [value]="d.id">{{ d.nombre }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Sucursal</mat-label>
            <mat-select [(ngModel)]="form.sucursal" required>
              <mat-option *ngFor="let s of sucursales" [value]="s.id">{{ s.nombre }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Motivo</mat-label>
            <textarea matInput [(ngModel)]="form.motivo" rows="2" required></textarea>
          </mat-form-field>
        </div>
        <div class="form-row" *ngIf="editing">
          <mat-form-field class="full-width">
            <mat-label>Estado</mat-label>
            <mat-select [(ngModel)]="form.estado">
              <mat-option value="agendada">Agendada</mat-option>
              <mat-option value="confirmada">Confirmada</mat-option>
              <mat-option value="en_atencion">En Atención</mat-option>
              <mat-option value="realizada">Realizada</mat-option>
              <mat-option value="cancelada">Cancelada</mat-option>
            </mat-select>
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

    <!-- Modal: Pago -->
    <div class="overlay" *ngIf="showPago" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <mat-card style="width: 600px; padding: 24px; max-height: 90vh; overflow-y: auto;">
        <h2>Pago de Cita</h2>
        <p *ngIf="pagoCita" style="color: #666; margin-bottom: 16px;">
          {{ pagoCita.mascota_nombre }} - {{ pagoCita.doctor_nombre }} - {{ pagoCita.fecha }}
        </p>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Método de Pago</mat-label>
            <mat-select [(ngModel)]="pagoForm.metodo_pago" required>
              <mat-option *ngFor="let item of metodoPagoKeys" [value]="item">{{ labelMetodoPago(item) }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <h3 style="font-size: 14px; margin: 16px 0 8px;">Servicios</h3>
        <div *ngFor="let sv of pagoServicios; let i = index" style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
          <mat-form-field style="flex: 1;">
            <mat-label>Descripción</mat-label>
            <input matInput [(ngModel)]="sv.descripcion" required>
          </mat-form-field>
          <mat-form-field style="width: 120px;">
            <mat-label>Precio</mat-label>
            <input matInput [(ngModel)]="sv.precio" type="number" min="0" (input)="calcPagoTotal()">
          </mat-form-field>
          <button mat-icon-button color="warn" (click)="removerServicio(i)" *ngIf="pagoServicios.length > 1"><mat-icon>remove_circle</mat-icon></button>
        </div>
        <button mat-stroked-button (click)="agregarServicio()" style="margin-bottom: 16px;"><mat-icon>add</mat-icon> Agregar servicio</button>
        <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0;"><span>Subtotal:</span><strong><span>$</span>{{ pagoSubtotal }}</strong></div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0;"><span>IVA (19%):</span><strong><span>$</span>{{ pagoIva }}</strong></div>
          <div style="display: flex; justify-content: space-between; font-size: 16px; padding: 8px 0; border-top: 1px solid #ddd;"><span>Total:</span><strong><span>$</span>{{ pagoTotal }}</strong></div>
        </div>
        <div class="actions">
          <button mat-button (click)="closePago()">Cancelar</button>
          <button mat-raised-button color="primary" (click)="savePago()" [disabled]="pagoSaving || pagoFormInvalid">
            {{ pagoSaving ? 'Procesando...' : 'Cobrar $' }}{{ pagoSaving ? '' : pagoTotal }}
          </button>
        </div>
      </mat-card>
    </div>

    <!-- Modal: Ficha Médica -->
    <div class="overlay" *ngIf="showFicha" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <mat-card style="width: 700px; padding: 24px; max-height: 90vh; overflow-y: auto;">
        <h2>Nueva Ficha Médica</h2>
        <p *ngIf="fichaCita" style="color: #666; margin-bottom: 16px;">
          {{ fichaCita.mascota_nombre }} - {{ fichaCita.doctor_nombre }} - {{ fichaCita.fecha }}
        </p>
        <div class="form-row">
          <mat-form-field>
            <mat-label>Fecha</mat-label>
            <input matInput [(ngModel)]="fichaForm.fecha" type="date" required>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Peso (kg)</mat-label>
            <input matInput [(ngModel)]="fichaForm.peso" type="number" step="0.1">
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field>
            <mat-label>Temperatura</mat-label>
            <input matInput [(ngModel)]="fichaForm.temperatura" type="number" step="0.1">
          </mat-form-field>
          <mat-form-field>
            <mat-label>Exámenes</mat-label>
            <input matInput [(ngModel)]="fichaForm.examenes">
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Diagnóstico</mat-label>
            <textarea matInput [(ngModel)]="fichaForm.diagnostico" rows="3" required></textarea>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Tratamiento</mat-label>
            <textarea matInput [(ngModel)]="fichaForm.tratamiento" rows="3" required></textarea>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Medicamentos</mat-label>
            <textarea matInput [(ngModel)]="fichaForm.medicamentos" rows="2"></textarea>
          </mat-form-field>
        </div>
        <div class="actions">
          <button mat-button (click)="closeFicha()">Cancelar</button>
          <button mat-raised-button color="primary" (click)="saveFicha()" [disabled]="fichaSaving || !fichaForm.diagnostico || !fichaForm.tratamiento">
            {{ fichaSaving ? 'Guardando...' : 'Guardar Ficha' }}
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: ['']
})
export class AgendaComponent implements OnInit {
  citasColumns = ['hora', 'mascota', 'doctor', 'motivo', 'estado', 'acciones'];
  data: Cita[] = [];
  timeSlots: TimeSlot[] = [];
  mascotas: Mascota[] = [];
  doctores: Doctor[] = [];
  sucursales: Sucursal[] = [];
  paidCitaIds = new Set<string>();
  filtroDoctor = '';
  filtroEstado = '';
  fechaSeleccionada = new Date().toISOString().split('T')[0];

  get fechaFormateada(): string {
    const d = new Date(this.fechaSeleccionada + 'T12:00:00');
    return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  showForm = false;
  editing: Cita | null = null;
  saving = false;
  form: any = { mascota: null, doctor: null, sucursal: null, fecha: '', hora: '', motivo: '', estado: 'agendada' };

  showPago = false;
  pagoCita: Cita | null = null;
  pagoSaving = false;
  pagoForm: any = { metodo_pago: 'efectivo' };
  pagoServicios: any[] = [{ descripcion: '', precio: 0 }];
  pagoSubtotal = 0;
  pagoIva = 0;
  pagoTotal = 0;
  metodoPagoKeys = Object.keys(METODO_PAGO_LABELS);

  get pagoFormInvalid(): boolean {
    return this.pagoServicios.some(s => !s.descripcion || !s.precio);
  }

  showFicha = false;
  fichaCita: Cita | null = null;
  fichaSaving = false;
  fichaForm: any = { fecha: '', mascota: null, doctor: null, sucursal: null, peso: null, temperatura: null, diagnostico: '', tratamiento: '', medicamentos: '', examenes: '' };

  constructor(private api: ApiService, public auth: AuthService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadRefData();
    this.load();
  }

  loadRefData() {
    this.api.getAll<Mascota>('/pacientes/').subscribe(data => this.mascotas = data);
    this.api.getAll<Doctor>('/doctores/').subscribe(data => this.doctores = data);
    this.api.getAll<Sucursal>('/sucursales/').subscribe(data => this.sucursales = data);
  }

  load() {
    const params: any = { fecha: this.fechaSeleccionada };
    if (this.filtroDoctor) params.doctor = this.filtroDoctor;
    if (this.filtroEstado) params.estado = this.filtroEstado;
    this.api.getAll<Cita>('/citas/', params).subscribe(data => {
      this.data = data;
      this.generarSlots(data);
    });
    this.api.getAll<Factura>('/facturas/').subscribe(facturas => {
      this.paidCitaIds = new Set(facturas.filter(f => f.estado === 'pagada').map(f => f.cita).filter((id): id is string => !!id));
    });
  }

  private generarSlots(citas: Cita[]) {
    const slots: TimeSlot[] = [];
    const booked = new Map<string, Cita>();
    citas.forEach(c => booked.set(c.hora, c));
    for (let h = 9; h <= 17; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        const cita = booked.get(hora);
        slots.push({ hora, disponible: !cita, cita });
      }
    }
    this.timeSlots = slots;
  }

  cambiarDia(delta: number) {
    const d = new Date(this.fechaSeleccionada);
    d.setDate(d.getDate() + delta);
    this.fechaSeleccionada = d.toISOString().split('T')[0];
    this.load();
  }

  irHoy() {
    this.fechaSeleccionada = new Date().toISOString().split('T')[0];
    this.load();
  }

  abrirParaSlot(hora: string) {
    this.editing = null;
    this.form = { mascota: null, doctor: null, sucursal: null, fecha: this.fechaSeleccionada, hora, motivo: '', estado: 'agendada' };
    this.showForm = true;
  }

  openForm(item?: Cita) {
    if (item) {
      this.editing = item;
      this.form = { ...item };
    } else {
      this.editing = null;
      this.form = { mascota: null, doctor: null, sucursal: null, fecha: this.fechaSeleccionada, hora: '', motivo: '', estado: 'agendada' };
    }
    this.showForm = true;
  }

  closeForm() { this.showForm = false; this.editing = null; }

  save() {
    this.saving = true;
    const obs = this.editing
      ? this.api.put<Cita>(`/citas/${this.editing.id}/`, this.form)
      : this.api.post<Cita>('/citas/', this.form);
    obs.subscribe({
      next: () => {
        this.snackBar.open('Cita guardada', 'Cerrar', { duration: 3000 });
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

  delete(item: Cita) {
    if (confirm(`¿Eliminar cita del ${item.fecha} a las ${item.hora}?`)) {
      this.api.delete(`/citas/${item.id}/`).subscribe({
        next: () => {
          this.snackBar.open('Cita eliminada', 'Cerrar', { duration: 3000 });
          this.load();
        },
        error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 })
      });
    }
  }

  labelMetodoPago(val: string): string { return METODO_PAGO_LABELS[val] || val; }

  openPago(cita: Cita) {
    this.pagoCita = cita;
    this.pagoForm = { metodo_pago: 'efectivo' };
    this.pagoServicios = [{ descripcion: '', precio: 0 }];
    this.calcPagoTotal();
    this.showPago = true;
  }

  closePago() {
    this.showPago = false;
    this.pagoCita = null;
  }

  agregarServicio() { this.pagoServicios.push({ descripcion: '', precio: 0 }); }

  removerServicio(i: number) {
    this.pagoServicios.splice(i, 1);
    this.calcPagoTotal();
  }

  calcPagoTotal() {
    this.pagoSubtotal = Math.round(this.pagoServicios.reduce((sum: number, s: any) => sum + (Number(s.precio) || 0), 0));
    this.pagoIva = Math.round(this.pagoSubtotal * 0.19);
    this.pagoTotal = this.pagoSubtotal + this.pagoIva;
  }

  savePago() {
    if (!this.pagoCita) return;
    this.pagoSaving = true;
    const payload = {
      cita: this.pagoCita.id,
      mascota: this.pagoCita.mascota,
      sucursal: this.pagoCita.sucursal,
      servicios: this.pagoServicios.map((s: any) => ({ descripcion: s.descripcion, precio: Number(s.precio) || 0 })),
      subtotal: this.pagoSubtotal,
      iva: this.pagoIva,
      total: this.pagoTotal,
      metodo_pago: this.pagoForm.metodo_pago,
      estado: 'pagada',
    };
    this.api.post<any>('/facturas/', payload).subscribe({
      next: () => {
        this.snackBar.open('Pago registrado exitosamente', 'Cerrar', { duration: 3000 });
        this.closePago();
        this.load();
        this.pagoSaving = false;
      },
      error: (err: any) => {
        const msg = err?.error ? (typeof err.error === 'string' ? err.error : JSON.stringify(err.error)) : err.message;
        this.snackBar.open('Error: ' + msg, 'Cerrar', { duration: 8000 });
        this.pagoSaving = false;
      }
    });
  }

  openFicha(cita: Cita) {
    this.fichaCita = cita;
    this.fichaForm = {
      fecha: cita.fecha || new Date().toISOString().split('T')[0],
      mascota: cita.mascota,
      doctor: cita.doctor,
      sucursal: cita.sucursal,
      peso: null,
      temperatura: null,
      diagnostico: '',
      tratamiento: '',
      medicamentos: '',
      examenes: '',
    };
    this.showFicha = true;
  }

  closeFicha() {
    this.showFicha = false;
    this.fichaCita = null;
  }

  saveFicha() {
    if (!this.fichaCita) return;
    this.fichaSaving = true;
    this.api.post<any>('/fichas-medicas/', this.fichaForm).subscribe({
      next: () => {
        this.snackBar.open('Ficha médica guardada', 'Cerrar', { duration: 3000 });
        this.closeFicha();
        this.load();
        this.fichaSaving = false;
      },
      error: (err: any) => {
        const msg = err?.error ? (typeof err.error === 'string' ? err.error : JSON.stringify(err.error)) : err.message;
        this.snackBar.open('Error: ' + msg, 'Cerrar', { duration: 8000 });
        this.fichaSaving = false;
      }
    });
  }
}