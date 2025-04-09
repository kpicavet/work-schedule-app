import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'calendar',
    pathMatch: 'full'
  },
  {
    path: 'calendar',
    loadComponent: () => import('./components/calendar/calendar.component').then(m => m.CalendarComponent)
  },
  {
    path: 'work-schedule',
    loadComponent: () => import('./components/work-schedule/work-schedule.component').then(m => m.WorkScheduleComponent)
  },
  {
    path: 'holiday-management',
    loadComponent: () => import('./components/holiday-management/holiday-management.component').then(m => m.HolidayManagementComponent)
  }
];
