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
  ],
})
export class Notification implements OnInit {
  addReminderForm!: FormGroup;
  showAddReminder = false;
  notifications$: Observable<any[]> = of([]); // 👈 قيمة افتراضية

  constructor(
    private api: Apiservice,
    private fb: FormBuilder,
    private notification: NotificationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initForm();
this.notifications$ = this.notification.notifications$ || of([]);

    this.notification.loadNotifications(); // تحميل أولي للإشعارات
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
      OperationId: 0, // لو هتحددها على صفقة معينة ممكن تعديل هنا
    };

    this.api.addReminder(body).subscribe({
      next: () => {
        this.notification.loadNotifications(); // تحديث الإشعارات
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
