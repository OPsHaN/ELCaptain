import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
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
import { Apiservice } from "../../services/apiservice";

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
  branches: any[] = [];

  classification = [
    { name: "A", code: "A1" },
    { name: "A +", code: "A2" },
    { name: "B", code: "B1" },
    { name: "B +", code: "B2" },
  ];

  ranks = [
    { name: "عضو مجلس إدارة", code: "1" },
    { name: "مدير فرع", code: "2" },
    { name: "موظف", code: "3" },
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
    private messageService: MessageService,
    private api: Apiservice,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      FirstName: ["", Validators.required],
      SecondName: [""],
      ThirdName: ["", Validators.required],
      UserType: ["", Validators.required],
      FullName: ["", Validators.required],
      NationalId: ["", [Validators.minLength(14)]],
      UserName: ["", Validators.required],
      Password: ["", [Validators.required, Validators.minLength(6)]],
      Email: [""],
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

    this.loadBranches();
  }

  get dayControls(): FormControl[] {
    return (this.registerForm.get("Days") as FormArray)
      .controls as FormControl[];
  }

  loadBranches(): void {
    this.api.getBranchs().subscribe({
      next: (res: any) => {
        this.branches = res;
        this.cdr.detectChanges();
        console.log(res);
      },
      error: (err) => {
        console.error("خطأ أثناء جلب الفروع:", err);
      },
    });
  }

  // onSubmit(): void {
  //   if (this.registerForm.invalid) {
  //     this.registerForm.markAllAsTouched();
  //     return;
  //   }

  //   this.isSubmitting = true;
  //   const formValue = this.registerForm.value;

  //   // 🕒 أيام الأسبوع
  //   const daysBooleans = formValue.Days.map((checked: boolean) => checked);

  //   const formData = new FormData();
  //   formData.append("FirstName", formValue.FirstName);
  //   formData.append("SecondName", formValue.SecondName);
  //   formData.append("ThirdName", formValue.ThirdName);
  //   formData.append("FullName", formValue.FullName);
  //   formData.append("NationalId", formValue.NationalId);
  //   formData.append("UserName", formValue.UserName);
  //   formData.append("Password", formValue.Password);
  //   formData.append("Email", formValue.Email);
  //   formData.append("Phone", formValue.Phone);
  //   formData.append("Phone2", formValue.Phone2);
  //   formData.append("BranchId", formValue.BranchId);
  //   formData.append("Classification", formValue.Classification);
  //   formData.append("FromTime", formValue.FromTime);
  //   formData.append("ToTime", formValue.ToTime);
  //   formData.append("UserType", formValue.UserType);

  //   // ✅ الصورة (لو فيه)
  //   if (this.uploadedFile) {
  //     formData.append("Img", this.uploadedFile, this.uploadedFile.name);
  //   }

  //   // 🗓️ الأيام
  //   formData.append("SatShift", daysBooleans[0]);
  //   formData.append("SunShift", daysBooleans[1]);
  //   formData.append("MonShift", daysBooleans[2]);
  //   formData.append("TueShift", daysBooleans[3]);
  //   formData.append("WedShift", daysBooleans[4]);
  //   formData.append("ThuShift", daysBooleans[5]);
  //   formData.append("FriShift", daysBooleans[6]);

  //   this.authService.register(formData as any).subscribe({
  //     next: (res) => {
  //       console.log("✅ Register success:", res);
  //       this.showSuccess("تم تسجيل الموظف بنجاح");

  //       this.isSubmitting = false;
  //       this.registerForm.reset();
  //       this.uploadedFile = null;
  //       this.selectedImage = null;
  //     },
  //     error: (err) => {
  //       this.showError("هناك مشكلة فى التسجيل");
  //       this.isSubmitting = false;
  //     },
  //   });
  // }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.registerForm.value;

    // 🕒 معالجة أيام الأسبوع وتحويلها إلى Boolean
    const daysBooleans = formValue.Days.map((checked: boolean) => checked);

    const payload: UserResponse = {
      Id: 0,
      Classification: formValue.Classification,
      FirstName: formValue.FirstName,
      SecondName: formValue.SecondName,
      ThirdName: formValue.ThirdName,
      FamilyName: formValue.FamilyName || "",
      FullName: formValue.FullName,
      NationalId: formValue.NationalId,
      BranchId: formValue.BranchId,
      UserName: formValue.UserName,
      Password: formValue.Password,
      Email: formValue.Email,
      Phone: formValue.Phone,
      Phone2: formValue.Phone2,
      UserType: formValue.UserType,
      RegisterDate: new Date().toISOString(),
      PassSalt: "string",
      PassHash: "string",
      IsDeleted: false,
      AddedBy: 0,
      AddedAt: new Date().toISOString(),

      // 🕒 الشيفت من - إلى
      ShiftFrom: formValue.FromTime,
      ShiftTo: formValue.ToTime,

      // 🗓️ أيام الأسبوع حسب الترتيب (السبت إلى الجمعة)
      SatShift: daysBooleans[0],
      SunShift: daysBooleans[1],
      MonShift: daysBooleans[2],
      TueShift: daysBooleans[3],
      WedShift: daysBooleans[4],
      ThuShift: daysBooleans[5],
      FriShift: daysBooleans[6],

      IsLoggedIn: true,
      Img: "https://www.hp-autoservice.dk/media/kunf1iun/intet-billede-1.png",
      Message: "string",
      Token: "string",
      Branch: {
        Id: formValue.BranchId,
        BranchName: "",
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
        this.showSuccess("تم تسجيل الموظف بنجاح");
      },
      error: (err) => {
        console.error("❌ Register error:", err);
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
