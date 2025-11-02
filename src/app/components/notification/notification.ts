import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Apiservice } from "../../services/apiservice";
import { CommonModule, DatePipe } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";

@Component({
  selector: "app-notification",
  standalone: true,
  templateUrl: "./notification.html",
  styleUrl: "./notification.scss",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    // Angular Material
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class Notification implements OnInit {
  notifications: any[] = [];
  addReminderForm!: FormGroup;
  showAddReminder = false;

  constructor(private api: Apiservice, private fb: FormBuilder) {}

  ngOnInit() {
    this.loadNotifications();

    this.addReminderForm = this.fb.group({
      ValidFrom: [""], // تاريخ التذكير
      NotificationText: [""], // نص الرسالة
    });


  }

  loadNotifications() {
    this.api.getNotification().subscribe({
      next: (res: any) => {
        this.notifications = res;
      },
      error: (err) => console.error(err),
    });
  }

  toggleAddReminder() {
    this.showAddReminder = !this.showAddReminder;
  }

  addReminder() {
    const usrId= localStorage.getItem("userId")

    const formValue = this.addReminderForm.value;

    const body = {
      Id: 0,
      UserId: usrId,
      NotificationText: formValue.NotificationText,
      Seen: false,
      ValidFrom: formValue.ValidFrom,
    };

    this.api.addReminder(body).subscribe({
      next: () => {
        this.loadNotifications();
        this.showAddReminder = false;
        this.addReminderForm.reset();
      },
      error: (err) => console.error(err),
    });
  }
}
