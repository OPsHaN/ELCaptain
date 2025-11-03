import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { NotificationService } from "../../services/notification";
import { Apiservice } from "../../services/apiservice";
import { MessageService } from "primeng/api";

@Component({
  selector: "app-global-notifications",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./global-notifications.html",
  styleUrl: "./global-notifications.scss",
})
export class GlobalNotifications implements OnInit {
  notifications: any[] = [];

  constructor(
    private notificationService: NotificationService,
    private api: Apiservice,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.notificationService.notifications$.subscribe((res) => {
      this.notifications = res;
      if (res?.length) {
        // يخلي آخر إشعار يختفي بعد 5 ثواني
        setTimeout(() => this.notifications.shift(), 5000);
      }
    });
  }

  removeNotification(n: any) {
    if (!n.Id) return;

    this.api.deletetNotification(n.Id).subscribe({
      next: () => {
        // حذف الإشعار محليًا
        this.notifications = this.notifications.filter((x) => x.Id !== n.Id);

        // تحديث الـ service
        const updatedServiceNotifications =
          this.notificationService.currentNotifications.filter(
            (x) => x.Id !== n.Id
          );
        this.notificationService.notificationsSource.next(
          updatedServiceNotifications
        );

        // تحديث العداد
        const unread = updatedServiceNotifications.filter(
          (x) => !x.Seen
        ).length;
        this.notificationService.unreadCountSource.next(unread);

        // ✅ عرض رسالة نجاح
        this.showSuccess("تم حذف الإشعار بنجاح");
      },
      error: (err) => {
        console.error("حدث خطأ أثناء حذف الإشعار:", err);

        // ✅ عرض رسالة خطأ
        this.showError("حدث خطأ أثناء حذف الإشعار");
      },
    });
  }

  // دوال الرسائل
  showError(msg: string) {
    this.messageService.add({
      severity: "error",
      detail: msg,
      life: 2000,
    });
  }

  showSuccess(msg: string) {
    this.messageService.add({
      severity: "success",
      detail: msg,
      life: 3000,
    });
  }

  markAsReadNotification() {
    this.notificationService.markAllAsRead();
  }
}
