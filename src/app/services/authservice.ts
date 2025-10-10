import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { UserResponse } from "../shared/tokenpayload";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse extends UserResponse {}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private baseUrl = "http://20.19.89.91/api/auth";

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, data);
  }

  register(data: UserResponse): Observable<UserResponse> {
    return this.http.post<UserResponse>(
      `${this.baseUrl}/Regsiter
`,
      data
    );
  }
}
