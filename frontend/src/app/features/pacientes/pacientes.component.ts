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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Mascota, Tutor, Sucursal } from '../../shared/models';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatSnackBarModule, MatCheckboxModule, MatTooltipModule],
  template: `
    <div class="page-card">
      <div class="toolbar">
        <h1>Pacientes</h1>
        <div>
          <mat-form-field style="width: 200px; margin-right: 8px;">
            <mat-label>Buscar microchip</mat-label>
            <input matInput [(ngModel)]="searchChip" (keyup.enter)="buscarMicrochip()">
          </mat-form-field>
          <button mat-stroked-button (click)="buscarMicrochip()"><mat-icon>search</mat-icon></button>
          <button mat-raised-button color="primary" (click)="openForm()" style="margin-left: 8px;" *ngIf="auth.user?.rol !== 'asistente'"><mat-icon>add</mat-icon> Nuevo Paciente</button>
        </div>
      </div>
      <table mat-table [dataSource]="data" class="mat-elevation-z2">
        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let r">{{ r.nombre }}</td>
        </ng-container>
        <ng-container matColumnDef="especie">
          <th mat-header-cell *matHeaderCellDef>Especie</th>
          <td mat-cell *matCellDef="let r">{{ r.especie }}</td>
        </ng-container>
        <ng-container matColumnDef="raza">
          <th mat-header-cell *matHeaderCellDef>Raza</th>
          <td mat-cell *matCellDef="let r">{{ r.raza }}</td>
        </ng-container>
        <ng-container matColumnDef="tutor">
          <th mat-header-cell *matHeaderCellDef>Tutor</th>
          <td mat-cell *matCellDef="let r">{{ r.tutor_nombre }}</td>
        </ng-container>
        <ng-container matColumnDef="acceso_cruzado">
          <th mat-header-cell *matHeaderCellDef>Multi-sucursal</th>
          <td mat-cell *matCellDef="let r">
            <span *ngIf="r.tiene_acceso_cruzado" style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 12px; font-size: 12px;">✓ Autorizado</span>
            <span *ngIf="!r.tiene_acceso_cruzado" style="color: #999; font-size: 12px;">—</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="microchip">
          <th mat-header-cell *matHeaderCellDef>Microchip</th>
          <td mat-cell *matCellDef="let r">{{ r.microchip || '-' }}</td>
        </ng-container>
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let r">
            <ng-container *ngIf="puedeAcceder(r)">
              <button mat-icon-button color="accent" (click)="verFicha(r)" matTooltip="Ver ficha"><mat-icon>receipt</mat-icon></button>
              <button mat-icon-button color="primary" (click)="openForm(r)" matTooltip="Editar" *ngIf="auth.user?.rol !== 'asistente'"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button [routerLink]="'/historial-clinico/' + r.id" color="accent" matTooltip="Historial"><mat-icon>history</mat-icon></button>
              <button mat-icon-button color="warn" (click)="delete(r)" matTooltip="Eliminar" *ngIf="auth.user?.rol === 'superadmin' || auth.user?.rol === 'admin'"><mat-icon>delete</mat-icon></button>
            </ng-container>
            <ng-container *ngIf="!puedeAcceder(r) && !r.tiene_acceso_cruzado">
              <button mat-stroked-button color="primary" (click)="openForm(r)" style="font-size: 12px; line-height: 28px;">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">vpn_key</mat-icon> Autorizar
              </button>
              <span style="font-size: 11px; color: #e65100; margin-left: 4px;">🔒</span>
            </ng-container>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      </table>
      <div *ngIf="data.length === 0" style="text-align: center; padding: 20px; color: #666;">No hay pacientes registrados</div>
    </div>

    <div class="overlay" *ngIf="showForm" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <mat-card style="width: 600px; padding: 24px; max-height: 90vh; overflow-y: auto;">
        <h2>{{ editing ? 'Editar' : 'Nuevo' }} Paciente</h2>
        <div class="form-row">
          <mat-form-field>
            <mat-label>Nombre</mat-label>
            <input matInput [(ngModel)]="form.nombre" required>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Especie</mat-label>
            <mat-select [(ngModel)]="form.especie" required>
              <mat-option value="Perro">Perro</mat-option>
              <mat-option value="Gato">Gato</mat-option>
              <mat-option value="Conejo">Conejo</mat-option>
              <mat-option value="Ave">Ave</mat-option>
              <mat-option value="Otro">Otro</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field>
            <mat-label>Raza</mat-label>
            <input matInput [(ngModel)]="form.raza" required>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Color</mat-label>
            <input matInput [(ngModel)]="form.color">
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field>
            <mat-label>Sexo</mat-label>
            <mat-select [(ngModel)]="form.sexo" required>
              <mat-option value="macho">Macho</mat-option>
              <mat-option value="hembra">Hembra</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Fecha Nacimiento</mat-label>
            <input matInput [(ngModel)]="form.fecha_nacimiento" type="date">
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width">
            <mat-label>Microchip</mat-label>
            <input matInput [(ngModel)]="form.microchip">
          </mat-form-field>
        </div>
        <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin: 8px 0;">
          <h3 style="margin: 0 0 8px; font-size: 14px; color: #333;">DATOS DEL TUTOR</h3>
          <div class="form-row">
            <mat-form-field>
              <mat-label>RUT</mat-label>
              <input matInput [(ngModel)]="form.tutor_rut" required>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Nombre completo</mat-label>
              <input matInput [(ngModel)]="form.tutor_nombre" required>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field>
              <mat-label>Teléfono</mat-label>
              <input matInput [(ngModel)]="form.tutor_telefono" required>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput [(ngModel)]="form.tutor_email" type="email">
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field class="full-width">
              <mat-label>Dirección</mat-label>
              <input matInput [(ngModel)]="form.tutor_direccion">
            </mat-form-field>
          </div>
        </div>
        <!-- Admin: checkbox directo -->
        <div class="form-row" style="align-items: center; gap: 12px;" *ngIf="auth.user?.rol === 'admin'">
          <mat-checkbox [(ngModel)]="form.tiene_acceso_cruzado" color="primary">Acceso multi-sucursal autorizado</mat-checkbox>
          <span style="font-size: 12px; color: #666;">(el paciente será visible en todas las sucursales)</span>
        </div>
        <!-- No admin: flujo de código -->
        <div class="form-row" style="align-items: center; gap: 12px; flex-wrap: wrap;" *ngIf="auth.user?.rol !== 'admin'">
          <span style="font-size: 13px; font-weight: 500;">Acceso multi-sucursal:</span>
          <span *ngIf="form.tiene_acceso_cruzado" style="background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 12px; font-size: 12px;">✓ Autorizado</span>
          <ng-container *ngIf="!form.tiene_acceso_cruzado">
            <button mat-stroked-button color="primary" (click)="enviarCodigo()" [disabled]="codigoEnviado" style="font-size: 13px;">
              {{ codigoEnviado ? 'Código enviado' : 'Enviar código al tutor' }}
            </button>
            <div *ngIf="codigoEnviado" style="display: flex; gap: 8px; align-items: center; width: 100%; margin-top: 8px;">
              <mat-form-field style="width: 140px;">
                <mat-label>Código</mat-label>
                <input matInput [(ngModel)]="codigoIngresado" maxlength="6" style="letter-spacing: 4px;">
              </mat-form-field>
              <button mat-raised-button color="primary" (click)="verificarCodigo()" [disabled]="!codigoIngresado || codigoIngresado.length < 6">
                Verificar
              </button>
              <span style="font-size: 11px; color: #999;">Vence en 30 min</span>
            </div>
          </ng-container>
        </div>
        <div class="actions">
          <button mat-button (click)="closeForm()">Cancelar</button>
          <button mat-raised-button color="primary" (click)="save()" [disabled]="saving">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </mat-card>
    </div>

    <div class="overlay" *ngIf="showView" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <mat-card style="width: 680px; padding: 0; max-height: 90vh; overflow-y: auto;">
        <div style="padding: 32px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #1a3c6e;">
            <div>
              <h2 style="margin: 0; color: #1a3c6e;">Ficha Técnica</h2>
              <p style="margin: 4px 0 0; color: #666; font-size: 13px;">{{ viewItem?.nombre }}</p>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 48px; color: #1a3c6e;">{{ viewItem?.especie === 'Perro' ? '🐕' : viewItem?.especie === 'Gato' ? '🐱' : '🐾' }}</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
            <div style="background: #f0f4ff; padding: 16px; border-radius: 8px;">
              <h3 style="margin: 0 0 12px; color: #1a3c6e; font-size: 14px;">DATOS DEL PACIENTE</h3>
              <div style="display: grid; gap: 8px; font-size: 14px;">
                <div><strong>Nombre:</strong> {{ viewItem?.nombre }}</div>
                <div><strong>Especie:</strong> {{ viewItem?.especie }}</div>
                <div><strong>Raza:</strong> {{ viewItem?.raza }}</div>
                <div><strong>Sexo:</strong> {{ viewItem?.sexo }}</div>
                <div><strong>Color:</strong> {{ viewItem?.color }}</div>
                <div><strong>Edad:</strong> {{ calcularEdad(viewItem?.fecha_nacimiento) }}</div>
                <div><strong>Microchip:</strong> {{ viewItem?.microchip || '—' }}</div>
              </div>
            </div>
            <div style="background: #fff8e1; padding: 16px; border-radius: 8px;">
              <h3 style="margin: 0 0 12px; color: #e65100; font-size: 14px;">DATOS DEL TUTOR</h3>
              <div style="display: grid; gap: 8px; font-size: 14px;">
                <div><strong>Nombre:</strong> {{ viewItem?.tutor_nombre }}</div>
                <div><strong>RUT:</strong> {{ viewItem?.tutor_rut || '—' }}</div>
                <div><strong>Teléfono:</strong> {{ viewItem?.tutor_telefono || '—' }}</div>
              </div>
            </div>
          </div>

          <div style="background: #e8f5e9; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px; color: #2e7d32; font-size: 14px;">REGISTRO</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px;">
              <div><strong>Sucursal:</strong> {{ sucursalNombre(viewItem?.sucursal_registro) }}</div>
              <div><strong>Registrado:</strong> {{ viewItem?.created_at ? (viewItem?.created_at | date:'dd/MM/yyyy') : '—' }}</div>
            </div>
          </div>

          <div *ngIf="viewUltimasFichas.length > 0" style="background: #f5f5f5; padding: 16px; border-radius: 8px;">
            <h3 style="margin: 0 0 12px; color: #333; font-size: 14px;">ÚLTIMAS ATENCIONES</h3>
            <div *ngFor="let f of viewUltimasFichas" style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; font-size: 13px;">
              <strong>{{ f.fecha }}</strong> — {{ f.diagnostico?.substring(0, 60) }}{{ f.diagnostico?.length > 60 ? '...' : '' }}
            </div>
            <div *ngIf="viewUltimasFichas.length === 0" style="color: #888; font-size: 13px;">Sin atenciones registradas</div>
          </div>
        </div>

        <div style="display: flex; gap: 8px; justify-content: flex-end; padding: 16px 32px; border-top: 1px solid #e0e0e0; background: #fafafa;">
          <button mat-button (click)="closeView()">Cerrar</button>
          <button mat-raised-button color="primary" [routerLink]="'/historial-clinico/' + viewItem?.id" (click)="closeView()">
            <mat-icon>history</mat-icon> Ver Historial
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: ['']
})
export class PacientesComponent implements OnInit {
  columns = ['nombre', 'especie', 'raza', 'tutor', 'acceso_cruzado', 'microchip', 'acciones'];
  data: Mascota[] = [];
  tutores: Tutor[] = [];
  sucursales: Sucursal[] = [];
  searchChip = '';
  showForm = false;
  editing: Mascota | null = null;
  saving = false;
  form: any = { nombre: '', especie: '', raza: '', color: '', sexo: '', fecha_nacimiento: '', microchip: '', tiene_acceso_cruzado: false, tutor_rut: '', tutor_nombre: '', tutor_telefono: '', tutor_email: '', tutor_direccion: '' };

  userSucursal: string | null = null;
  showView = false;
  viewItem: Mascota | null = null;
  viewUltimasFichas: any[] = [];

  codigoEnviado = false;
  codigoIngresado = '';

  constructor(private api: ApiService, public auth: AuthService, private snackBar: MatSnackBar) {
    this.userSucursal = this.auth.user?.sucursal ?? null;
  }

  ngOnInit() {
    this.load();
    this.api.getAll<Tutor>('/tutores/').subscribe(data => this.tutores = data);
    this.api.getAll<Sucursal>('/sucursales/').subscribe(data => this.sucursales = data);
  }

  load() {
    this.api.getAll<Mascota>('/pacientes/').subscribe(data => this.data = data);
  }

  sucursalNombre(id: string | undefined): string {
    if (!id) return '—';
    const s = this.sucursales.find(s => s.id === id);
    return s ? s.nombre : id.substring(0, 8);
  }

  buscarMicrochip() {
    if (this.searchChip) {
      this.api.get<Mascota[]>('/pacientes/buscar-microchip/', { chip: this.searchChip }).subscribe(data => {
        this.data = data;
        if (data.length === 0) {
          this.snackBar.open('No se encontraron pacientes con ese microchip', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.load();
    }
  }

  enviarCodigo() {
    if (!this.editing?.id) return;
    this.api.post(`/pacientes/${this.editing.id}/enviar-codigo/`, {}).subscribe({
      next: () => {
        this.codigoEnviado = true;
        this.snackBar.open('Código enviado al correo del tutor', 'Cerrar', { duration: 4000 });
      },
      error: () => this.snackBar.open('Error al enviar código', 'Cerrar', { duration: 3000 })
    });
  }

  verificarCodigo() {
    if (!this.editing?.id) return;
    this.api.post<Mascota>(`/pacientes/${this.editing.id}/verificar-codigo/`, { codigo: this.codigoIngresado }).subscribe({
      next: (res) => {
        this.form.tiene_acceso_cruzado = true;
        this.snackBar.open('Acceso multi-sucursal autorizado', 'Cerrar', { duration: 3000 });
        this.codigoEnviado = false;
        this.codigoIngresado = '';
      },
      error: (err) => {
        const msg = err.error?.error || 'Código incorrecto';
        this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
      }
    });
  }

  puedeAcceder(paciente: Mascota): boolean {
    if (!this.userSucursal) return true;
    if (paciente.sucursal_registro === this.userSucursal) return true;
    return paciente.tiene_acceso_cruzado === true;
  }

  calcularEdad(fecha: string | undefined): string {
    if (!fecha) return '—';
    const nac = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nac.getFullYear();
    const mes = hoy.getMonth() - nac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
    return `${edad} año${edad !== 1 ? 's' : ''}`;
  }

  verFicha(item: Mascota) {
    this.viewItem = item;
    this.api.getAll<any>('/fichas-medicas/', { mascota: item.id }).subscribe(data => {
      this.viewUltimasFichas = data.slice(-5).reverse();
    });
    this.showView = true;
  }

  closeView() {
    this.showView = false;
    this.viewItem = null;
    this.viewUltimasFichas = [];
  }

  openForm(item?: Mascota) {
    this.codigoEnviado = false;
    this.codigoIngresado = '';
    if (item) {
      this.editing = item;
      this.form = {
        ...item,
        tutor_rut: item.tutor_rut || '',
        tutor_nombre: item.tutor_nombre || '',
        tutor_telefono: item.tutor_telefono || '',
        tutor_email: (item as any).tutor_email || '',
        tutor_direccion: (item as any).tutor_direccion || '',
      };
    } else {
      this.editing = null;
      this.form = { nombre: '', especie: '', raza: '', color: '', sexo: '', fecha_nacimiento: '', microchip: '', tiene_acceso_cruzado: false, tutor_rut: '', tutor_nombre: '', tutor_telefono: '', tutor_email: '', tutor_direccion: '' };
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
    body.tutor_data = {
      rut: body.tutor_rut,
      nombre: body.tutor_nombre,
      telefono: body.tutor_telefono,
      email: body.tutor_email,
      direccion: body.tutor_direccion,
    };
    for (const k of ['tutor_rut','tutor_nombre','tutor_telefono','tutor_email','tutor_direccion','tutor','codigo_acceso','codigo_expiracion','created_at']) {
      delete body[k];
    }
    const obs = this.editing
      ? this.api.put<Mascota>(`/pacientes/${this.editing.id}/`, body)
      : this.api.post<Mascota>('/pacientes/', body);
    obs.subscribe({
      next: () => {
        this.snackBar.open('Paciente guardado', 'Cerrar', { duration: 3000 });
        this.closeForm();
        this.load();
        this.saving = false;
      },
      error: (err) => {
        const er = err.error || {};
        const msgs: string[] = [];
        for (const v of Object.values(er)) {
          if (Array.isArray(v)) msgs.push(...v.map(String));
          else msgs.push(String(v));
        }
        this.snackBar.open(msgs.join(', ') || 'Error al guardar', 'Cerrar', { duration: 5000 });
        this.saving = false;
      }
    });
  }

  delete(item: Mascota) {
    if (confirm(`¿Eliminar paciente "${item.nombre}"?`)) {
      this.api.delete(`/pacientes/${item.id}/`).subscribe({
        next: () => {
          this.snackBar.open('Paciente eliminado', 'Cerrar', { duration: 3000 });
          this.load();
        },
        error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 })
      });
    }
  }
}
