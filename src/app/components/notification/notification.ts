import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Apiservice } from "../../services/apiservice";
import { CommonModule, DatePipe } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { NotificationService } from "../../services/notification";
import { MessageService } from "primeng/api";
import { Observable, of } from "rxjs";
import { MatTabsModule } from "@angular/material/tabs";

@Component({
  selector: "app-notification",
  standalone: true,
  templateUrl: "./notification.html",
  styleUrls: ["./notification.scss"],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
  ],
})
export class Notification implements OnInit {
  addReminderForm!: FormGroup;
  showAddReminder = false;
  notifications$: Observable<any[]> = of([]); // 👈 قيمة افتراضية
  reminders$:Observable<any[]> = of([]);
  selectedTabIndex = 0; // 0 = الإشعارات, 1 = التذكيرات

  constructor(
    private api: Apiservice,
    private fb: FormBuilder,
    private notification: NotificationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initForm();
    this.notifications$ = this.notification.notifications$ || of([]);
    this.notification.loadNotifications();

    // تذكيرات
    this.reminders$ = this.notification.reminders$ || of([]); // 👈 نفس الفكرة
    this.notification.loadReminders();
    }

  private initForm() {
    this.addReminderForm = this.fb.group({
      ValidFrom: ["", Validators.required],
      NotificationText: ["", [Validators.required, Validators.minLength(3)]],
    });
  }

  toggleAddReminder() {
    this.showAddReminder = !this.showAddReminder;
  }

  addReminder() {
    const usrId = localStorage.getItem("userId");
    const formValue = this.addReminderForm.value;

    const body = {
      Id: 0,
      UserId: usrId,
      NotificationText: formValue.NotificationText,
      Seen: false,
      ValidFrom: formValue.ValidFrom,
      IsReminder: true,
    };

    this.api.addReminder(body).subscribe({
      next: () => {
        this.notification.loadNotifications(); // تحديث الإشعارات
        this.notification.loadReminders();
        this.showAddReminder = false;
        this.addReminderForm.reset();
        this.showSuccess("تم إضافة التذكير بنجاح");
      },
      error: (err) => this.showError("خطأ أثناء إضافة التذكير"),
    });
  }

  markAsRead() {
    this.notification.markAllAsRead(); // تعليم كل الإشعارات كمقروءة
  }

  remove(id:number){
    this.notification.deleteNotification(id);
  }

  deleteNotification(notificationId: number) {
    this.notification.deleteNotification(notificationId); // حذف الإشعار + تحديث العداد
  }

  showError(msg: string) {
    this.messageService.add({
      severity: "error",
      detail: msg,
      life: 3000,
    });
  }

  showSuccess(msg: string) {
    this.messageService.add({
      severity: "success",
      detail: msg,
      life: 3000,
    });
  }
}
