export interface Sucursal {
  id: string;
  nombre: string;
  rut: string;
  logo: string;
  direccion: string;
  region: string;
  comuna: string;
  telefono: string;
  email: string;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  user: number;
  nombre: string;
  rut: string;
  especialidad: string;
  numero_registro: string;
  horarios: any;
  activo: boolean;
  sucursal: string;
  sucursal_nombre?: string;
  created_at?: string;
}

export interface Tutor {
  id: string;
  nombre: string;
  rut: string;
  direccion: string;
  telefono: string;
  email: string;
  created_at?: string;
}

export interface Mascota {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  sexo: string;
  fecha_nacimiento: string;
  color: string;
  microchip: string;
  tutor: string;
  tutor_nombre?: string;
  tutor_rut?: string;
  tutor_telefono?: string;
  sucursal_registro: string;
  tiene_acceso_cruzado: boolean;
  codigo_acceso?: string | null;
  codigo_expiracion?: string | null;
  created_at?: string;
}

export interface FichaMedica {
  id: string;
  mascota: string;
  mascota_nombre?: string;
  doctor: string;
  doctor_nombre?: string;
  sucursal: string;
  sucursal_nombre?: string;
  fecha: string;
  peso: number;
  temperatura: number;
  diagnostico: string;
  tratamiento: string;
  medicamentos: string;
  examenes: string;
  codigo_acceso: string;
}

export interface Cita {
  id: string;
  mascota: string;
  mascota_nombre?: string;
  doctor: string;
  doctor_nombre?: string;
  sucursal: string;
  sucursal_nombre?: string;
  fecha_hora: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
  created_at?: string;
}

export interface Factura {
  id: string;
  cita?: string;
  tutor: string;
  tutor_nombre?: string;
  mascota: string;
  mascota_nombre?: string;
  sucursal: string;
  sucursal_nombre?: string;
  fecha_emision: string;
  servicios: any;
  subtotal: string;
  iva: string;
  total: string;
  metodo_pago: string;
  estado: string;
  created_at?: string;
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  rol: string;
  sucursal: string | null;
  telefono: string;
  is_active: boolean;
}

export interface Notificacion {
  id: number;
  tutor: number;
  tutor_nombre?: string;
  mascota: number;
  mascota_nombre?: string;
  tipo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
}
