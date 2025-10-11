import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "../../services/authservice";
import { UserResponse } from "../../shared/tokenpayload";
import { CommonModule } from "@angular/common";
import { MatSelectModule } from "@angular/material/select";
import { CheckboxModule } from "primeng/checkbox";
import { MessageService } from "primeng/api";

@Component({
  selector: "app-register",
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    FormsModule,
    CheckboxModule,
  ],
  templateUrl: "./register.html",
  styleUrl: "./register.scss",
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  isSubmitting = false;
  selectedImage: string | ArrayBuffer | null = null;
  uploadedFile: File | null = null;
  branches = [
    { name: "فرع 1", code: "BR1" },
    { name: "فرع 2", code: "BR2" },
    { name: "فرع 3", code: "BR3" },
  ];

  classification = [
    { name: "A", code: "A1" },
    { name: "A +", code: "A2" },
    { name: "B", code: "B1" },
    { name: "B +", code: "B2" },
  ];

  ranks = [
    { name: "مدير", code: "RANK1" },
    { name: "مشرف +", code: "RANK2" },
    { name: "موظف", code: "RANK3" },
  ];
  fromTime: Date | null = null;
  toTime: Date | null = null;

  daysOfWeek: string[] = [
    "السبت",
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
  ];

  selectedDays: string[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      FirstName: ["", Validators.required],
      SecondName: ["", Validators.required],
      ThirdName: ["", Validators.required],
      Rank: ["", Validators.required],
      FullName: ["", Validators.required],
      NationalId: ["", [Validators.required, Validators.minLength(14)]],
      UserName: ["", Validators.required],
      Password: ["", [Validators.required, Validators.minLength(6)]],
      Email: ["", [Validators.required, Validators.email]],
      Phone: ["", Validators.required],
      Phone2: [""],
      BranchId: ["", Validators.required],
      Classification: ["", Validators.required],
      FromTime: ["", Validators.required],
      ToTime: ["", Validators.required],
      Img: [null], // ✅ حقل الصورة
      Days: this.fb.array(this.daysOfWeek.map(() => this.fb.control(false))),
    });

    this.registerForm.valueChanges.subscribe((val) => {
      const full = `${val.FirstName || ""} ${val.SecondName || ""} ${
        val.ThirdName || ""
      }`.trim();
      this.registerForm.patchValue({ FullName: full }, { emitEvent: false });
    });
  }

  get dayControls(): FormControl[] {
    return (this.registerForm.get("Days") as FormArray)
      .controls as FormControl[];
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.registerForm.value;

    // 🕒 أيام الأسبوع
    const daysBooleans = formValue.Days.map((checked: boolean) => checked);

    const formData = new FormData();
    formData.append("FirstName", formValue.FirstName);
    formData.append("SecondName", formValue.SecondName);
    formData.append("ThirdName", formValue.ThirdName);
    formData.append("FullName", formValue.FullName);
    formData.append("NationalId", formValue.NationalId);
    formData.append("UserName", formValue.UserName);
    formData.append("Password", formValue.Password);
    formData.append("Email", formValue.Email);
    formData.append("Phone", formValue.Phone);
    formData.append("Phone2", formValue.Phone2);
    formData.append("BranchId", formValue.BranchId);
    formData.append("Classification", formValue.Classification);
    formData.append("FromTime", formValue.FromTime);
    formData.append("ToTime", formValue.ToTime);

    // ✅ الصورة (لو فيه)
    if (this.uploadedFile) {
      formData.append("Img", this.uploadedFile, this.uploadedFile.name);
    }

    // 🗓️ الأيام
    formData.append("SatShift", daysBooleans[0]);
    formData.append("SunShift", daysBooleans[1]);
    formData.append("MonShift", daysBooleans[2]);
    formData.append("TueShift", daysBooleans[3]);
    formData.append("WedShift", daysBooleans[4]);
    formData.append("ThuShift", daysBooleans[5]);
    formData.append("FriShift", daysBooleans[6]);

    this.authService.register(formData as any).subscribe({
      next: (res) => {
        console.log("✅ Register success:", res);
        this.showSuccess("تم تسجيل الموظف بنجاح");

        this.isSubmitting = false;
        this.registerForm.reset();
        this.uploadedFile = null;
        this.selectedImage = null;
      },
      error: (err) => {
        this.showError("هناك مشكلة فى التسجيل");
        this.isSubmitting = false;
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadedFile = input.files[0];
      this.registerForm.patchValue({ Img: this.uploadedFile });

      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result;
      };
      reader.readAsDataURL(this.uploadedFile);
    }
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
