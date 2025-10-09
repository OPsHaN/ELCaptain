import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
})
export class Login {
  loginForm: FormGroup;
  showPassword = false;
  isLoggedIn = false;
  activePage: string = 'home';

  buttons = [
    { label: 'الرئيسية', route: 'home', icon: 'bi bi-house' },
    { label: 'من نحن', route: './about', icon: 'bi bi-info-circle' },
    { label: 'الخدمات', route: 'services', icon: 'bi bi-tools' },
    { label: 'اتصل بنا', route: './contact', icon: 'bi bi-telephone' },
    { label: 'خروج', route: './login', icon: 'bi bi-box-arrow-right' },
  ];
  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.required]],
      password: ['', Validators.required],
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // يخلّى كل الحقول تُظهر الأخطاء
      return;
    }

    this.isLoggedIn = true;
    this.router.navigate(['/home']); // أول ما يسجل يدخل على الرئيسية
    this.activePage = 'home'; // ✅ غيّر الصفحة المعروضة
  }

  goTo(route: string) {
    this.activePage = route; // ✅ غيّر الصفحة المعروضة
  }
}
