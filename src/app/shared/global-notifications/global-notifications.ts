import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { NotificationService } from "../../services/notification";
import { Apiservice } from "../../services/apiservice";
import { MessageService } from "primeng/api";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-global-notifications",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./global-notifications.html",
  styleUrl: "./global-notifications.scss",
})
export class GlobalNotifications implements OnInit {
  notifications: any[] = [];
  private unseenBuffer: any[] = [];
  private destroy$ = new Subject<void>();
  private seenTimer: any;

  constructor(
    private notificationService: NotificationService,
    private api: Apiservice,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res && res.length) {
          // إشعارات جديدة غير مقروءة
          const unseen = res.filter((n) => !n.Seen && !n._queued);

          if (unseen.length > 0) {
            unseen.forEach((n) => (n._queued = true));
            this.unseenBuffer.push(...unseen);

            // نبدأ مؤقت بعد أول دفعة فقط
            if (!this.seenTimer) {
              this.seenTimer = setTimeout(() => {
                this.bulkUpdateSeen();
              }, 10000);
            }
          }

          this.notifications = res.filter((n) => !n.Seen);
        }
      });
  }

  updateSeenNotification(n: any) {
    if (!n.Id) return;

    this.api.updateSeenNotification(n.Id).subscribe({
      next: () => {
        // ✅ تحديث الحالة محليًا (إزالة الإشعار من القائمة الحالية)
        this.notifications = this.notifications.filter((x) => x.Id !== n.Id);

        // ✅ تحديث الإشعارات في الـ Service (نفس فكرة removeNotification)
        const updatedServiceNotifications =
          this.notificationService.currentNotifications.map((x) =>
            x.Id === n.Id ? { ...x, Seen: true } : x
          );

        this.notificationService.notificationsSource.next(
          updatedServiceNotifications
        );

        // ✅ تحديث العداد (العدد غير المقروء)
        const unread = updatedServiceNotifications.filter(
          (x) => !x.Seen
        ).length;
        this.notificationService.unreadCountSource.next(unread);

        // ✅ عرض رسالة نجاح (اختياري)
        // this.showSuccess("تم تعليم الإشعار كمقروء");
      },
      error: (err) => {
        console.error("❌ خطأ أثناء تحديث حالة الإشعار:", err);
        this.showError("حدث خطأ أثناء تحديث الإشعار");
      },
    });
  }


    private bulkUpdateSeen() {
    if (this.unseenBuffer.length === 0) return;

    const ids = this.unseenBuffer.map((n) => n.Id);
    this.unseenBuffer = [];
    this.seenTimer = null;

    this.api.updateSeenNotification(ids).subscribe({
      next: () => {
        const updated = this.notificationService.currentNotifications.map((n) =>
          ids.includes(n.Id) ? { ...n, Seen: true } : n
        );
        this.notificationService.notificationsSource.next(updated);

        // تحديث العداد
        const unread = updated.filter((x) => !x.Seen).length;
        this.notificationService.unreadCountSource.next(unread);
      },
      error: (err) => {
        console.error("❌ خطأ أثناء تحديث الإشعارات:", err);
        this.showError("حدث خطأ أثناء تحديث الإشعارات");
      },
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

        const updatedReminders =
          this.notificationService.remindersSource.value.filter(
            (r) => r.Id !== n.Id
          );
        this.notificationService.remindersSource.next(updatedReminders);

        // تحديث العداد
        const unread = updatedServiceNotifications.filter(
          (x) => !x.Seen
        ).length;
        this.notificationService.unreadCountSource.next(unread);

        // ✅ عرض رسالة نجاح
        // this.showSuccess("تم حذف الإشعار بنجاح");
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

    ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.seenTimer) clearTimeout(this.seenTimer);
  }
}
