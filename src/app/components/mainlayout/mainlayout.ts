import { Component, OnInit } from "@angular/core";
import { NotificationService } from "../../services/notification";
import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";

@Component({
  selector: "app-mainlayout",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastModule,
  ],
  templateUrl: "./mainlayout.html",
  styleUrl: "./mainlayout.scss",
})
export class Mainlayout implements OnInit {
  isSidebarExpanded = true;
  userFullName = "";
  userImg = "assets/images/user.png";
  rankProfile = "غير معروف";
  userType = 0;
  unreadCount = 0;

  buttons = [
    {
      label: "الرئيسية",
      route: "/home",
      icon: "bi bi-house",
      roles: [1, 2, 3, 4],
    },
    {
      label: "السيارات",
      route: "/cars",
      icon: "bi bi-car-front",
      roles: [1, 2, 3],
    },
    {
      label: "الموظفين",
      route: "/employees",
      icon: "bi bi-people",
      roles: [1, 2],
    },
    {
      label: "العملاء",
      route: "/clients",
      icon: "bi bi-person-lines-fill",
      roles: [1, 2],
    },
    {
      label: "الصفقات",
      route: "/deals",
      icon: "bi bi-briefcase",
      roles: [1, 2, 3],
    },
    {
      label: "الرسائل",
      route: "/messages",
      icon: "bi bi-envelope",
      roles: [1, 2, 3],
    },
    {
      label: "الإضافات",
      route: "/adds",
      icon: "bi bi-bookmark-plus",
      roles: [1, 2],
    },
    {
      label: "قائمة الإنتظار",
      route: "/waiting",
      icon: "bi bi-clock-history",
      roles: [1, 2, 3, 4],
    },
    {
      label: "الأرشيف",
      route: "/archive",
      icon: "bi bi-archive-fill",
      roles: [1, 2, 3],
    },
        {
      label: "صفقات منتهية",
      route: "/completed-deals",
      icon: "bi bi-archive-fill",
      roles: [1, 2, 3],
    },
  ];

  constructor(
    public router: Router,
    private notificationService: NotificationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.subscribeNotifications();

        const storedState = localStorage.getItem("isSidebarExpanded");
    if (storedState !== null) {
      this.isSidebarExpanded = JSON.parse(storedState);
    } else {
      this.isSidebarExpanded = true; // الوضع الافتراضي لو مفيش حاجة مخزنة
    }
    //
  }

  loadUserData() {
    this.userFullName = localStorage.getItem("fullName") || "";
    this.userImg = localStorage.getItem("img") || "assets/images/user.png";
    this.rankProfile = localStorage.getItem("rank") || "غير معروف";
    this.userType = Number(localStorage.getItem("userType")) || 0;
  }

  subscribeNotifications() {
    this.notificationService.notifications$.subscribe((res: any) => {
      const unread = res.filter((n: any) => !n.Seen).length;
      this.unreadCount = unread;
    });
    // تأكد من تحميل الإشعارات عند بداية الدخول
    this.notificationService.loadNotifications();
  }

  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
    localStorage.setItem(
      "isSidebarExpanded",
      JSON.stringify(this.isSidebarExpanded)
    );
  }

  logout() {
    localStorage.clear();
    this.router.navigate(["/login"]);
    this.showSuccess("تم تسجيل الخروج بنجاح");
  }

  showError(msg: string) {
    this.messageService.add({
      severity: "error",
      // summary: "خطأ",
      detail: msg,
      life: 2000,
    });
  }

  showSuccess(msg: string) {
    this.messageService.add({
      severity: "success",
      // summary: "تم بنجاح",
      detail: msg,
      life: 3000,
    });
  }
}
