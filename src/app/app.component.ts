import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';

interface DayInfo {
  isWorkDay: boolean;
  isHoliday: boolean;
  workHours: string;
}

interface HolidayHours {
  total: number;
  taken: number;
  year: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatCheckboxModule
  ],
  template: `
    <!-- Main container -->
    <div class="app-container">
      <header class="app-header">
        <h1>Work Schedule</h1>
      </header>

      <main class="app-content">
        <div class="schedule-controls">
          <div class="holiday-hours-section">
            <h3>Holiday Hours</h3>
            <div class="holiday-hours-input">
              <mat-form-field>
                <mat-label>Total Hours</mat-label>
                <input matInput type="number" [(ngModel)]="holidayHours.total" (change)="updateHolidayHours()">
              </mat-form-field>
            </div>
            <div class="holiday-hours-stats">
              <div class="stat-item">
                <span class="label">Taken:</span>
                <span class="value">{{ holidayHours.taken }}h</span>
              </div>
              <div class="stat-item">
                <span class="label">Remaining:</span>
                <span class="value">{{ holidayHours.total - holidayHours.taken }}h</span>
              </div>
            </div>
          </div>

          <div class="schedule-buttons">
            <button mat-raised-button color="primary" (click)="openWorkScheduleDialog()">
              Set Work Schedule
            </button>
            <button mat-raised-button color="primary" (click)="toggleHoliday()" [disabled]="!selectedDay">
              {{ isHoliday(selectedDay!) ? 'Remove Holiday' : 'Set as Holiday' }}
            </button>
            <button mat-raised-button color="warn" (click)="resetSchedule()" class="reset-button">
              Reset Schedule
            </button>
          </div>
        </div>

        <div class="calendar-section">
          <div class="calendar-header">
            <button mat-icon-button (click)="previousMonth()">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <h2>{{ getMonthName() }} {{ currentYear }}</h2>
            <button mat-icon-button (click)="nextMonth()">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>

          <div class="calendar-grid">
            <!-- Week days header -->
            <div class="week-day" *ngFor="let day of weekDays">
              {{ day }}
            </div>

            <!-- Calendar days -->
            <div class="calendar-day" 
                 *ngFor="let day of daysInMonth" 
                 [class.empty]="day === 0"
                 [class.today]="isToday(day)"
                 [class.work-day]="isWorkDay(day)"
                 [class.holiday]="isHoliday(day)"
                 [class.active]="selectedDay === day"
                 (click)="selectDay(day)">
              {{ day === 0 ? '' : day }}
              <div class="day-info" *ngIf="day !== 0">
                <span class="holiday-text" *ngIf="isHoliday(day)">vakantie</span>
                <span class="work-hours" *ngIf="isWorkDay(day)">{{ getWorkHours(day) }}</span>
                <mat-icon class="holiday-icon" *ngIf="isHoliday(day)">beach_access</mat-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="legend-section">
          <h3>Legend</h3>
          <div class="legend-item">
            <div class="color-box today"></div>
            <span>Today</span>
          </div>
          <div class="legend-item">
            <div class="color-box work-day"></div>
            <span>Work Day</span>
          </div>
          <div class="legend-item">
            <div class="color-box holiday"></div>
            <span>Holiday</span>
          </div>
        </div>
      </main>
    </div>

    <ng-template #workScheduleDialog>
      <h2 mat-dialog-title>Set Work Schedule</h2>
      <mat-dialog-content>
        <p class="selected-date">{{ dialogRef?.componentInstance?.getFormattedDate() }}</p>
        <mat-form-field>
          <mat-label>Start Time</mat-label>
          <input matInput type="time" [(ngModel)]="dialogData.startTime">
        </mat-form-field>
        <mat-form-field>
          <mat-label>End Time</mat-label>
          <input matInput type="time" [(ngModel)]="dialogData.endTime">
        </mat-form-field>
        <mat-checkbox [(ngModel)]="dialogData.repeatEveryTwoWeeks">
          Repeat every two weeks
        </mat-checkbox>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-button [mat-dialog-close]="dialogData" cdkFocusInitial>Save</button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'work-schedule-app';
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  currentDate = new Date();
  currentYear = this.currentDate.getFullYear();
  currentMonth = this.currentDate.getMonth();
  daysInMonth: number[] = [];
  workSchedule: { [key: string]: DayInfo } = {};
  dialogRef: any;
  dialogData = {
    startTime: '09:00',
    endTime: '17:00',
    repeatEveryTwoWeeks: false
  };
  selectedDay: number | null = null;
  holidayHours: HolidayHours = {
    total: 160,
    taken: 0,
    year: new Date().getFullYear()
  };

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.generateCalendar();
    this.loadWorkSchedule();
    this.loadHolidayHours();
    this.checkYearReset();
  }

  generateCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startingDay = firstDay.getDay();
    
    this.daysInMonth = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      this.daysInMonth.push(0);
    }
    
    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      this.daysInMonth.push(i);
    }
  }

  getMonthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
  }

  previousMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
  }

  isToday(day: number): boolean {
    const today = new Date();
    return day === today.getDate() && 
           this.currentMonth === today.getMonth() && 
           this.currentYear === today.getFullYear();
  }

  isWorkDay(day: number): boolean {
    const dateKey = this.getDateKey(day);
    return this.workSchedule[dateKey]?.isWorkDay || false;
  }

  isHoliday(day: number): boolean {
    const dateKey = this.getDateKey(day);
    return this.workSchedule[dateKey]?.isHoliday || false;
  }

  getWorkHours(day: number): string {
    const dateKey = this.getDateKey(day);
    return this.workSchedule[dateKey]?.workHours || '';
  }

  private getDateKey(day: number): string {
    return `${this.currentYear}-${this.currentMonth + 1}-${day}`;
  }

  selectDay(day: number) {
    if (day !== 0) {
      this.selectedDay = day;
    }
  }

  isActiveDay(day: number): boolean {
    return day !== 0 && day === this.selectedDay;
  }

  openWorkScheduleDialog() {
    if (!this.selectedDay) {
      this.selectedDay = this.currentDate.getDate();
    }

    this.dialogRef = this.dialog.open(WorkScheduleDialog, {
      width: '500px',
      panelClass: 'work-schedule-dialog',
      hasBackdrop: true,
      disableClose: false,
      autoFocus: true,
      data: {
        ...this.dialogData,
        day: this.selectedDay,
        month: this.currentMonth,
        year: this.currentYear
      }
    });

    this.dialogRef.afterClosed().subscribe((result: {
      startTime: string;
      endTime: string;
      repeatEveryTwoWeeks: boolean;
      day: number;
      month: number;
      year: number;
    }) => {
      if (result) {
        if (result.repeatEveryTwoWeeks) {
          // Add schedule for the next 10 years, every 2 weeks
          const startDate = new Date(result.year, result.month, result.day);
          const endDate = new Date(result.year + 10, result.month, result.day);
          
          let currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
            this.workSchedule[dateKey] = {
              isWorkDay: true,
              isHoliday: false,
              workHours: `${result.startTime} - ${result.endTime}`
            };
            
            // Add 14 days (2 weeks) to the current date
            currentDate = new Date(currentDate.getTime() + (14 * 24 * 60 * 60 * 1000));
          }
        } else {
          // Single day schedule
          const dateKey = this.getDateKey(result.day);
          this.workSchedule[dateKey] = {
            isWorkDay: true,
            isHoliday: false,
            workHours: `${result.startTime} - ${result.endTime}`
          };
        }
        this.saveWorkSchedule();
      }
    });
  }

  saveWorkSchedule() {
    localStorage.setItem('workSchedule', JSON.stringify(this.workSchedule));
  }

  loadWorkSchedule() {
    const savedSchedule = localStorage.getItem('workSchedule');
    if (savedSchedule) {
      this.workSchedule = JSON.parse(savedSchedule);
    }
  }

  resetSchedule() {
    if (confirm('Are you sure you want to reset the entire work schedule? This action cannot be undone.')) {
      this.workSchedule = {};
      localStorage.removeItem('workSchedule');
      this.selectedDay = null;
    }
  }

  checkYearReset() {
    const currentYear = new Date().getFullYear();
    if (currentYear > this.holidayHours.year) {
      this.holidayHours = {
        total: 160,
        taken: 0,
        year: currentYear
      };
      this.saveHolidayHours();
    }
  }

  loadHolidayHours() {
    const savedHours = localStorage.getItem('holidayHours');
    if (savedHours) {
      this.holidayHours = JSON.parse(savedHours);
    }
  }

  saveHolidayHours() {
    localStorage.setItem('holidayHours', JSON.stringify(this.holidayHours));
  }

  updateHolidayHours() {
    this.saveHolidayHours();
  }

  calculateTakenHolidayHours() {
    let totalHours = 0;
    const currentYear = new Date().getFullYear();
    
    Object.entries(this.workSchedule).forEach(([dateKey, info]) => {
      if (info.isHoliday && info.isWorkDay && info.workHours) {
        const [year] = dateKey.split('-').map(Number);
        if (year === currentYear) {
          // Calculate hours from work schedule
          const [startTime, endTime] = info.workHours.split(' - ');
          const start = new Date(`2000-01-01T${startTime}`);
          const end = new Date(`2000-01-01T${endTime}`);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          totalHours += hours;
        }
      }
    });
    
    this.holidayHours.taken = totalHours;
    this.saveHolidayHours();
  }

  toggleHoliday() {
    if (!this.selectedDay) return;

    const dateKey = this.getDateKey(this.selectedDay);
    if (this.workSchedule[dateKey]) {
      // Toggle holiday status for existing schedule
      this.workSchedule[dateKey].isHoliday = !this.workSchedule[dateKey].isHoliday;
    } else {
      // Create new entry for holiday without work schedule
      this.workSchedule[dateKey] = {
        isWorkDay: false,
        isHoliday: true,
        workHours: ''
      };
    }
    this.saveWorkSchedule();
    this.calculateTakenHolidayHours();
  }
}

@Component({
  selector: 'work-schedule-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDialogModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>Set Work Schedule</h2>
      <mat-dialog-content>
        <div class="selected-date">
          <h3>{{ getFormattedDate() }}</h3>
        </div>
        <div class="time-inputs">
          <mat-form-field>
            <mat-label>Start Time</mat-label>
            <input matInput type="time" [(ngModel)]="data.startTime">
          </mat-form-field>
          <mat-form-field>
            <mat-label>End Time</mat-label>
            <input matInput type="time" [(ngModel)]="data.endTime">
          </mat-form-field>
        </div>
        <mat-checkbox [(ngModel)]="data.repeatEveryTwoWeeks">
          Repeat every two weeks
        </mat-checkbox>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" [mat-dialog-close]="data">Save</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 1rem;
      min-width: 400px;
    }
    
    .selected-date {
      text-align: center;
      margin-bottom: 1.5rem;
      
      h3 {
        margin: 0;
        color: #1976d2;
        font-size: 1.2rem;
      }
    }
    
    .time-inputs {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      
      mat-form-field {
        flex: 1;
      }
    }
    
    mat-checkbox {
      display: block;
      margin-bottom: 1rem;
    }
    
    mat-dialog-actions {
      padding: 1rem 0 0 0;
      margin: 0;
      
      button {
        margin-left: 0.5rem;
      }
    }
  `]
})
export class WorkScheduleDialog {
  selectedDay: number;
  selectedMonth: number;
  selectedYear: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      startTime: string;
      endTime: string;
      repeatEveryTwoWeeks: boolean;
      day: number;
      month: number;
      year: number;
    }
  ) {
    this.selectedDay = data.day;
    this.selectedMonth = data.month;
    this.selectedYear = data.year;
  }

  getFormattedDate(): string {
    const date = new Date(this.selectedYear, this.selectedMonth, this.selectedDay);
    return date.toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric'
    });
  }
}
