import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { UserResponse } from "../shared/tokenpayload";
import { MessageService } from "primeng/api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse extends UserResponse {}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private baseUrl = "https://elcaptainauto.com:2083/api/auth/";

  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn.asObservable();
  activePage: string = "home";
  private _userType = new BehaviorSubject<number>(0); // ⬅️ رقم الدور
  userType$ = this._userType.asObservable(); // للاشتراك في الكمبوننتات

  constructor(
    private http: HttpClient,
    public router: Router,
    private messageService: MessageService
  ) {
    const token = localStorage.getItem("token");
    const type = +(localStorage.getItem("userType") ?? 0);
    this._userType.next(type); // تعيين الدور من localStorage
    if (token) {
      this._isLoggedIn.next(true);
    }
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}login`, data);
  }

  register(data: UserResponse): Observable<UserResponse> {
    return this.http.post<UserResponse>(
      `${this.baseUrl}Regsiter
`,
      data
    );
  }

  onLoginSuccess(token: string) {
    localStorage.setItem("token", token);
    this._isLoggedIn.next(true);
  }

    setUserType(type: number) {
    this._userType.next(type);
  }

  logout() {
    const token = localStorage.getItem("token");

    // ✅ لو المستخدم مش داخل أصلاً، اكتفي بتسجيل الخروج المحلي
    if (!token) {
      this.handleLocalLogout();
      return;
    }

    // 👇 إرسال طلب الخروج للسيرفر (بدون تأثير من الـ interceptor)
    this.http.post(`${this.baseUrl}logout`, {}).subscribe({
      next: () => {
        this.handleLocalLogout();
      },
      error: (err) => {
        console.warn("Logout API error:", err);
        // حتى لو حصل خطأ، نكمل تسجيل الخروج محليًا
        this.handleLocalLogout();
      },
    });
  }

  /** ✅ دالة واحدة تنفذ تسجيل الخروج المحلي بالكامل */
  private handleLocalLogout() {
    localStorage.clear();
    this._isLoggedIn.next(false);
    this.activePage = "home";

    // استخدم navigateByUrl لتفادي أي مشاكل في إعادة التوجيه
    this.router.navigateByUrl("/login");
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
