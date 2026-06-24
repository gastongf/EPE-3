import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'sucursales', loadComponent: () => import('./features/sucursales/sucursales.component').then(m => m.SucursalesComponent), canActivate: [authGuard] },
  { path: 'usuarios', loadComponent: () => import('./features/usuarios/usuarios.component').then(m => m.UsuariosComponent), canActivate: [authGuard] },
  { path: 'doctores', loadComponent: () => import('./features/doctores/doctores.component').then(m => m.DoctoresComponent), canActivate: [authGuard] },
  { path: 'tutores', loadComponent: () => import('./features/tutores/tutores.component').then(m => m.TutoresComponent), canActivate: [authGuard] },
  { path: 'pacientes', loadComponent: () => import('./features/pacientes/pacientes.component').then(m => m.PacientesComponent), canActivate: [authGuard] },
  { path: 'historial-clinico/:mascotaId', loadComponent: () => import('./features/historial-clinico/historial-clinico.component').then(m => m.HistorialClinicoComponent), canActivate: [authGuard] },
  { path: 'historial-clinico', loadComponent: () => import('./features/historial-clinico/historial-clinico.component').then(m => m.HistorialClinicoComponent), canActivate: [authGuard] },
  { path: 'agenda', loadComponent: () => import('./features/agenda/agenda.component').then(m => m.AgendaComponent), canActivate: [authGuard] },
  { path: 'facturacion', loadComponent: () => import('./features/facturacion/facturacion.component').then(m => m.FacturacionComponent), canActivate: [authGuard] },
  { path: 'microchip', loadComponent: () => import('./features/microchip/microchip.component').then(m => m.MicrochipComponent), canActivate: [authGuard] },
  { path: 'acceso-historial/:codigo', loadComponent: () => import('./features/historial-clinico/historial-clinico.component').then(m => m.HistorialClinicoComponent) },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
