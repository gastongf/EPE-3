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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/api.service';
import { Factura, Tutor, Mascota, Sucursal } from '../../shared/models';

const METODO_PAGO_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta_credito: 'Tarjeta crédito',
  tarjeta_debito: 'Tarjeta débito',
  transferencia: 'Transferencia',
};

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  pagada: 'Pagada',
  anulada: 'Anulada',
};

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './facturacion.component.html',
  styleUrls: ['./facturacion.component.css']
})
export class FacturacionComponent implements OnInit {
  columns = ['fecha_emision', 'tutor', 'mascota', 'total', 'metodo_pago', 'estado', 'acciones'];
  data: Factura[] = [];
  tutores: Tutor[] = [];
  mascotas: Mascota[] = [];
  sucursales: Sucursal[] = [];
  filteredMascotas: Mascota[] = [];
  showForm = false;
  editing: Factura | null = null;
  saving = false;
  servicios: any[] = [{ descripcion: '', precio: 0 }];
  subtotal = 0;
  iva = 0;
  total = 0;
  form: any = { tutor: null, mascota: null, sucursal: null, servicios: '', subtotal: 0, iva: 0, total: 0, metodo_pago: 'efectivo', estado: 'pendiente' };

  showView = false;
  viewItem: Factura | null = null;
  viewServicios: any[] = [];
  viewSubtotal = 0;
  viewIva = 0;
  viewTotal = 0;

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.load();
    this.api.getAll<Tutor>('/tutores/').subscribe(data => this.tutores = data);
    this.api.getAll<Mascota>('/pacientes/').subscribe(data => this.mascotas = data);
    this.api.getAll<Sucursal>('/sucursales/').subscribe(data => this.sucursales = data);
  }

  load() {
    this.api.getAll<Factura>('/facturas/').subscribe(data => this.data = data);
  }

  labelMetodoPago(val: string | undefined | null): string { return val ? (METODO_PAGO_LABELS[val] || val) : '—'; }
  labelEstado(val: string | undefined | null): string { return val ? (ESTADO_LABELS[val] || val) : '—'; }

  onTutorChange() {
    this.filteredMascotas = this.mascotas.filter(m => m.tutor === this.form.tutor);
    this.form.mascota = null;
  }

  addServicio() { this.servicios.push({ descripcion: '', precio: 0 }); }

  removeServicio(index: number) {
    this.servicios.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    this.subtotal = Math.round(this.servicios.reduce((sum: number, s: any) => sum + (Number(s.precio) || 0), 0));
    this.iva = Math.round(this.subtotal * 0.19);
    this.total = this.subtotal + this.iva;
  }

  openForm(item?: Factura) {
    if (item) {
      this.editing = item;
      this.form = { ...item };
      const mascotaId = this.form.mascota;
      if (item.tutor) this.onTutorChange();
      this.form.mascota = mascotaId;
      if (item.servicios && typeof item.servicios === 'string') {
        try { this.servicios = JSON.parse(item.servicios); }
        catch { this.servicios = [{ descripcion: '', valor: 0 }]; }
      } else if (Array.isArray(item.servicios)) {
        this.servicios = item.servicios.map((s: any) => ({ descripcion: s.descripcion, precio: Number(s.precio) || 0 }));
      }
      this.calcularTotal();
    } else {
      this.editing = null;
      this.form = { tutor: null, mascota: null, sucursal: null, servicios: '', subtotal: 0, iva: 0, total: 0, metodo_pago: 'efectivo', estado: 'pendiente' };
      this.servicios = [{ descripcion: '', precio: 0 }];
      this.subtotal = 0; this.iva = 0; this.total = 0;
    }
    this.showForm = true;
  }

  closeForm() { this.showForm = false; this.editing = null; }

  save() {
    this.calcularTotal();
    this.form.subtotal = this.subtotal;
    this.form.iva = this.iva;
    this.form.total = this.total;
    const payload: any = {
      tutor: this.form.tutor,
      mascota: this.form.mascota,
      sucursal: this.form.sucursal,
      servicios: this.servicios.map((s: any) => ({ descripcion: s.descripcion, precio: Number(s.precio) || 0 })),
      subtotal: Math.round(this.form.subtotal),
      iva: Math.round(this.form.iva),
      total: Math.round(this.form.total),
      metodo_pago: this.form.metodo_pago,
      estado: this.form.estado,
    };
    this.saving = true;
    const obs = this.editing
      ? this.api.put<Factura>(`/facturas/${this.editing.id}/`, payload)
      : this.api.post<Factura>('/facturas/', payload);
    obs.subscribe({
      next: () => {
        this.snackBar.open('Factura guardada', 'Cerrar', { duration: 3000 });
        this.closeForm();
        this.load();
        this.saving = false;
      },
      error: (err: any) => {
        const msg = err?.error ? (typeof err.error === 'string' ? err.error : JSON.stringify(err.error)) : err.message;
        this.snackBar.open('Error: ' + msg, 'Cerrar', { duration: 8000 });
        console.error('Save error:', err);
        this.saving = false;
      }
    });
  }

  verFactura(item: Factura) {
    this.viewItem = item;
    this.viewServicios = Array.isArray(item.servicios) ? item.servicios.map((s: any) => ({ descripcion: s.descripcion, precio: Number(s.precio) || 0 })) : [];
    this.viewSubtotal = Math.round(this.viewServicios.reduce((sum: number, sv: any) => sum + sv.precio, 0));
    this.viewIva = Math.round(this.viewSubtotal * 0.19);
    this.viewTotal = this.viewSubtotal + this.viewIva;
    this.showView = true;
  }

  closeView() { this.showView = false; this.viewItem = null; }

  imprimirFactura() {
    setTimeout(() => window.print(), 300);
  }

  eliminar(item: Factura) {
    if (confirm(`¿Anular factura #${item.id?.slice(0,8)?.toUpperCase()}?`)) {
      this.api.delete(`/facturas/${item.id}/`).subscribe({
        next: () => {
          this.snackBar.open('Factura eliminada', 'Cerrar', { duration: 3000 });
          this.load();
        },
        error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 })
      });
    }
  }
}