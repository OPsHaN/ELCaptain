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
  private baseUrl = "https://elcaptainauto.com/api/auth/";

  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn.asObservable();
  activePage: string = "home";

  constructor(
    private http: HttpClient,
    public router: Router,
    private messageService: MessageService
  ) {
    const token = localStorage.getItem("token");
    if (token) {
      this._isLoggedIn.next(true); // 👈 لو فيه توكن خلي الحالة True
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

  logout() {
    this._isLoggedIn.next(false); // 👈 إشعار للكل إنك سجلت خروج
    this.router.navigate(["/login"]);
    localStorage.removeItem("token");
    this.activePage = "home";
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
