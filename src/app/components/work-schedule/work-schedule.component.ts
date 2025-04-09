import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

export interface WorkSchedule {
  id: number;
  employeeName: string;
  date: Date;
  startTime: string;
  endTime: string;
  breakTime: number;
  totalHours: number;
}

@Component({
  selector: 'app-work-schedule',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './work-schedule.component.html',
  styleUrl: './work-schedule.component.scss'
})
export class WorkScheduleComponent {
  displayedColumns: string[] = ['employeeName', 'date', 'startTime', 'endTime', 'breakTime', 'totalHours', 'actions'];
  workSchedules: WorkSchedule[] = [];
  newSchedule: Partial<WorkSchedule> = {};

  addSchedule() {
    if (this.isValidSchedule()) {
      const schedule: WorkSchedule = {
        id: this.workSchedules.length + 1,
        employeeName: this.newSchedule.employeeName || '',
        date: this.newSchedule.date || new Date(),
        startTime: this.newSchedule.startTime || '',
        endTime: this.newSchedule.endTime || '',
        breakTime: this.newSchedule.breakTime || 0,
        totalHours: this.calculateTotalHours()
      };
      this.workSchedules = [...this.workSchedules, schedule];
      this.resetForm();
    }
  }

  deleteSchedule(id: number) {
    this.workSchedules = this.workSchedules.filter(schedule => schedule.id !== id);
  }

  private isValidSchedule(): boolean {
    return !!(
      this.newSchedule.employeeName &&
      this.newSchedule.date &&
      this.newSchedule.startTime &&
      this.newSchedule.endTime &&
      this.newSchedule.breakTime !== undefined
    );
  }

  private calculateTotalHours(): number {
    if (!this.newSchedule.startTime || !this.newSchedule.endTime) return 0;
    
    const start = new Date(`2000-01-01T${this.newSchedule.startTime}`);
    const end = new Date(`2000-01-01T${this.newSchedule.endTime}`);
    const breakTime = this.newSchedule.breakTime || 0;
    
    const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.max(0, diffInHours - breakTime);
  }

  private resetForm() {
    this.newSchedule = {};
  }
}
