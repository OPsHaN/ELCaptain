import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../services/authservice";
import { UserResponse } from "../../shared/tokenpayload";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-register",
  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./register.html",
  styleUrl: "./register.scss",
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    // 🟡 إنشاء الفورم
    this.registerForm = this.fb.group({
      FirstName: ["", Validators.required],
      SecondName: ["", Validators.required],
      ThirdName: [""],
      FamilyName: ["", Validators.required],
      FullName: [""],
      NationalId: ["", [Validators.required, Validators.minLength(14)]],
      UserName: ["", Validators.required],
      Password: ["", [Validators.required, Validators.minLength(6)]],
      Email: ["", [Validators.required, Validators.email]],
      Phone: ["", Validators.required],
      Phone2: [""],
    });

    this.registerForm.valueChanges.subscribe((val) => {
      const full = `${val.FirstName || ""} ${val.SecondName || ""} ${
        val.ThirdName || ""
      } ${val.FamilyName || ""}`.trim();
      this.registerForm.patchValue({ FullName: full }, { emitEvent: false });
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.registerForm.value;

    const payload: UserResponse = {
      Id: 0,
      Classification: "User",
      FirstName: formValue.FirstName,
      SecondName: formValue.SecondName,
      ThirdName: formValue.ThirdName,
      FamilyName: formValue.FamilyName,
      FullName: formValue.FullName,
      NationalId: formValue.NationalId,
      BranchId: null,
      UserName: formValue.UserName,
      Password: formValue.Password,
      Email: formValue.Email,
      Phone: formValue.Phone,
      Phone2: formValue.Phone2,
      UserType: 0,
      RegisterDate: new Date().toISOString(),
      PassSalt: "string",
      PassHash: "string",
      IsDeleted: false,
      AddedBy: 0,
      AddedAt: new Date().toISOString(),
      ShiftFrom: "string",
      ShiftTo: "string",
      SatShift: true,
      SunShift: true,
      MonShift: true,
      TueShift: true,
      WedShift: true,
      ThuShift: true,
      FriShift: true,
      IsLoggedIn: true,
      Img: "https://www.hp-autoservice.dk/media/kunf1iun/intet-billede-1.png",
      Message: "string",
      Token: "string",
      Branch: {
        Id: 0,
        BranchName: "string",
        Message: "string",
        AddedBy: 0,
        AddedAt: new Date().toISOString(),
      },
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        console.log("✅ Register success:", res);
        this.isSubmitting = false;
        this.registerForm.reset();
      },
      error: (err) => {
        console.error("❌ Register error:", err);
        this.isSubmitting = false;
      },
    });
  }
}
