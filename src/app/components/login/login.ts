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
  userImg: string = "assets/images/user.png";

  buttons = [
    { label: "الرئيسية", route: "home", icon: "bi bi-house" },
    { label: "السيارات ", route: "./cars", icon: "bi bi-car-front" },
    { label: "الموظفين", route: "/employees", icon: "bi bi-people" },
    { label: "العملاء ", route: "./clients", icon: "bi bi-person-lines-fill" },
    { label: "الصفقات", route: "/deals", icon: "bi bi-briefcase" },
    { label: "الرسائل", route: "/messages", icon: "bi bi-envelope" },
    { label: "تسجيل موظف", route: "/register", icon: "bi bi-person-plus" },

    {
      label: "خروج",
      action: () => this.logout(),
      icon: "bi bi-box-arrow-right",
    },
  ];
  constructor(
    private fb: FormBuilder,
    public router: Router,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required]],
      password: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem("token");
    if (token) {
      this.isLoggedIn = true;
      this.router.navigate(["/home"]);
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
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
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
          localStorage.setItem("token", res.Token);
          localStorage.setItem("fullName", res.FullName || "");
          localStorage.setItem("img", res.Img || "");

          this.userFullName = res.FullName || "";
          this.userImg = res.Img || "assets/images/user.png";

          this.isLoggedIn = true;
          this.showSuccess("تم تسجيل الدخول بنجاح");
          this.router.navigate(["/home"]);
          this.activePage = "home";
        },
        error: (err) => {
          console.error("Login error:", err);

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
    this.isLoggedIn = false;
    this.loginForm.reset();
    this.router.navigate(["/login"]);
    localStorage.removeItem("token");
    this.showSuccess("تم تسجيل الخروج بنجاح");
    this.activePage = "home";
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
    console.log("Decoded token:", decoded);

    if (!decoded) return null;

    return {
      FullName: decoded.FullName,
      Img: decoded.Img,
    };
  }

  getUserInfoFromLocalStorage(): { FullName: string; Img: string } {
    const fullName = localStorage.getItem("fullName") || "";
    const img = localStorage.getItem("img") || "assets/images/user.png";
    return { FullName: fullName, Img: img };
  }
}
