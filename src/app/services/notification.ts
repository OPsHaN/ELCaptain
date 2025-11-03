import { Injectable, inject } from "@angular/core";
import { Apiservice } from "./apiservice";
import { BehaviorSubject, Observable, timer } from "rxjs";
import { switchMap } from "rxjs/operators";
import { MessageService } from "primeng/api";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private messageService = inject(MessageService);

  public notificationsSource = new BehaviorSubject<any[]>([]);
  public notifications$ = this.notificationsSource.asObservable();

  public unreadCountSource = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSource.asObservable();

  constructor(private api: Apiservice) {
    this.startPolling();
  }

  private startPolling() {
    timer(0, 100000)
      .pipe(switchMap(() => this.api.getNotification()))
      .subscribe({
        next: (res: any) => {
          this.notificationsSource.next(res || []);
          this.updateUnreadCount(res || []);
        },
        error: (err) => console.error("Notification polling error:", err),
      });
  }

  loadNotifications() {
    this.api.getNotification().subscribe({
      next: (res: any) => {
        this.notificationsSource.next(res || []);
        this.updateUnreadCount(res || []);
      },
      error: (err) => {
        console.error("Error loading notifications", err);
        this.showError("حدث خطأ أثناء تحميل الإشعارات");
      },
    });
  }

  markAllAsRead() {
    const current = this.notificationsSource.value || [];
    const unread = current.filter((n) => !n.Seen);

    if (!unread.length) return;

    unread.forEach((n) => {
      const body = { ...n, Seen: true };
      this.api.updateSeenNotification(body).subscribe({
        next: () => {
          n.Seen = true;
          this.updateUnreadCount(current);
        },
        error: () => this.showError("حدث خطأ أثناء تعليم الإشعارات كمقروءة"),
      });
    });

    this.notificationsSource.next([...current]);
    this.showSuccess("تم تعليم جميع الإشعارات كمقروءة");
  }

  deleteNotification(notificationId: number) {
    this.api.deletetNotification(notificationId).subscribe({
      next: () => {
        const updated = this.notificationsSource.value.filter(
          (n) => n.Id !== notificationId
        );
        this.notificationsSource.next(updated);
        this.updateUnreadCount(updated);
        this.showSuccess("تم حذف الإشعار بنجاح");
      },
      error: () => this.showError("حدث خطأ أثناء حذف الإشعار"),
    });
  }

  private updateUnreadCount(notifications: any[]) {
    const unread = notifications.filter((n) => !n.Seen).length;
    this.unreadCountSource.next(unread);
  }

  showError(msg: string) {
    this.messageService.add({ severity: "error", detail: msg, life: 3000 });
  }
  showSuccess(msg: string) {
    this.messageService.add({ severity: "success", detail: msg, life: 3000 });
  }

  get currentNotifications() {
    return this.notificationsSource.value;
  }
}
