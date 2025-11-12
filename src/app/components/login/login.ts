import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from "@angular/router";
import { AuthService } from "../../services/authservice";
import { finalize } from "rxjs";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { UserInfo } from "../../shared/tokenpayload";
import { NotificationService } from "../../services/notification";

@Component({
  selector: "app-login",
  standalone: true,
  templateUrl: "./login.html",
  styleUrls: ["./login.scss"],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastModule,
  ],
})
export class Login implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoggedIn = false;
  isLoading = false;
  errorMessage = "";
  activePage: string = "home";
  userFullName: string = "";
  rankProfile: string = "غير معروف";
  userImg: string = "assets/images/user.png";
  isSidebarExpanded: boolean = true;
  unreadCount = 0;
  notifications: any[] = [];
  userType: number = 0;
  ranks = [
    { name: "عضو مجلس إدارة", code: 1 },
    { name: "مدير فرع", code: 2 },
    { name: "موظف", code: 3 },
    { name: "ماركتينج", code: 4 },
  ];
  buttons = [
    {
      label: "الرئيسية",
      route: "home",
      icon: "bi bi-house",
      roles: [1, 2, 3, 4],
    },
    {
      label: "السيارات",
      route: "./cars",
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
      route: "./clients",
      icon: "bi bi-person-lines-fill",
      roles: [1, 2, 3],
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

    // {
    //   label: "خروج",
    //   action: () => this.logout(),
    //   icon: "bi bi-box-arrow-right",
    // },
  ];
  constructor(
    private fb: FormBuilder,
    public router: Router,
    private authService: AuthService,
    private messageService: MessageService,
    private notification: NotificationService
  ) {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required]],
      password: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem("token");
    const lastRoute = localStorage.getItem("lastRoute");
    this.rankProfile = localStorage.getItem("rank") || "غير معروف";
    this.notification.unreadCount$.subscribe(
      (count) => (this.unreadCount = count)
    );

    this.notification.notifications$.subscribe(
      (res) => (this.notifications = res)
    );

    this.notification.loadNotifications();

    if (token) {
      this.isLoggedIn = true;

      if (lastRoute && lastRoute !== "/login") {
        this.router.navigateByUrl(lastRoute);
      } else {
        this.router.navigate([localStorage.getItem("lastRoute") || "/home"]);
      }
    }

    const storedState = localStorage.getItem("isSidebarExpanded");
    if (storedState !== null) {
      this.isSidebarExpanded = JSON.parse(storedState);
    } else {
      this.isSidebarExpanded = true; // الوضع الافتراضي لو مفيش حاجة مخزنة
    }
    // const userInfo = this.getUserInfoFromToken();
    // if (userInfo) {
    //   this.fullName = userInfo.FullName;
    //   this.img = userInfo.Img ;
    // }
    // console.log("User Info from token:", userInfo);
    const userInfo = this.getUserInfoFromLocalStorage();
    this.userFullName = userInfo.FullName;
    this.userImg = userInfo.Img;
    this.authService.userType$.subscribe((type) => {
      this.userType = type; // يتحدث تلقائيًا بعد login
    });
    console.log(this.userType);
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
    localStorage.setItem(
      "isSidebarExpanded",
      JSON.stringify(this.isSidebarExpanded)
    );
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";

    this.authService
      .login(this.loginForm.value)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          console.log("Login response:", res);

          // حفظ البيانات في localStorage
          localStorage.setItem("token", res.Token);
          localStorage.setItem("fullName", res.FullName || "");
          localStorage.setItem("img", res.Img || "");
          localStorage.setItem("userType", res.UserType.toString());
          localStorage.setItem("userId", res.Id.toString());
          const rank =
            this.ranks.find((r) => r.code === res.UserType)?.name ||
            "غير معروف";
          localStorage.setItem("rank", rank);

          // تحديث المتغيرات في الكمبوننت مباشرة
          this.userFullName = res.FullName || "";
          this.userImg = res.Img;
          this.rankProfile = rank;
          this.userType = res.UserType; // ⬅️ مهم للتحديث الفوري للزرار

          // تحديث AuthService BehaviorSubject (لو مفعّل)
          this.authService.setUserType(res.UserType);

          // this.notification.loadNotifications();
          this.notification.startPolling();

          this.authService.onLoginSuccess(res.Token);

          this.showSuccess("تم تسجيل الدخول بنجاح");
          this.router.navigate(["/home"]);
          this.activePage = "home";
        },
        error: (err) => {
          if (err.status === 401) {
            this.showError("هذا الموظف غير موجود");
          } else if (err.status === 500) {
            this.showError("لا يمكن الاتصال بالخادم. تحقق من الاتصال.");
          } else {
            this.showError("اسم المستخدم أو كلمة المرور غير صحيحة");
          }
        },
      });
  }

  logout() {
    this.authService.logout();
    this.loginForm.reset();
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

  //بفك التوكن ويجيب بيانات المستخدم

  getDecodedToken(): any {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = token.split(".")[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  }

  // بجيب البيانات اللى عايز أعرضها

  getUserInfoFromToken(): { FullName: string; Img: string } | null {
    const decoded: UserInfo = this.getDecodedToken();

    if (!decoded) return null;

    return {
      FullName: decoded.FullName,
      Img: decoded.Img,
    };
  }

  getUserInfoFromLocalStorage(): { FullName: string; Img: string } {
    const fullName = localStorage.getItem("fullName") || "";
    let img = localStorage.getItem("img");
    // لو مفيش صورة أو القيمة فاضية → نحط الصورة الافتراضية
    if (!img || img.trim() === "") {
      img = "photos/user.jpg";
    }
    return { FullName: fullName, Img: img };
  }
}
