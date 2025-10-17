import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  Input,
  OnInit,
  EventEmitter,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  AbstractControl,
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
  selectedImage: File | null = null;
  uploadedFile: File | null = null;
  branches: any[] = [];
  profilePreview: string | null = null;
  @Input() employee: any;
  defaultAvatar = "./photos/user.jpg";
  private pendingEmployee: any = null;
  @Input() isEditMode = false;
  employeeIdToUpdate: number | null = null;

  @Output() closeForm = new EventEmitter<void>();
  @Output() refreshEmployees = new EventEmitter<void>(); 

  classification = [
    { name: "A", code: "A" },
    { name: "A +", code: "A+" },
    { name: "B", code: "B" },
    { name: "B +", code: "B+" },
  ];

  ranks = [
    { name: "عضو مجلس إدارة", code: 1 },
    { name: "مدير فرع", code: 2 },
    { name: "موظف", code: 3 },
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["employee"]) {
      if (this.employee) {
        this.isEditMode = true;
        if (this.registerForm) {
          this.patchFormData(this.employee);
        } else {
          this.pendingEmployee = this.employee;
        }
      } else {
        this.isEditMode = false;
        if (this.registerForm) {
          this.resetForm(); // ✅ الفورم جاهز
        } else {
          this.pendingEmployee = null;
        }
      }
    }
  }

  resetForm() {
    this.registerForm.reset();
    // ✅ إعادة تهيئة الـ Days Array
    const daysArray = this.registerForm.get("Days") as FormArray;
    daysArray.controls.forEach((control) => control.setValue(false));
    this.profilePreview = this.defaultAvatar;
  }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      FirstName: ["", Validators.required],
      SecondName: [""],
      ThirdName: ["", Validators.required],
      UserType: ["", Validators.required],
      FullName: [""],
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
      Days: this.fb.array(
        this.daysOfWeek.map(() => this.fb.control(false)),
        [this.minSelectedCheckboxes(1)]
      ), // 🕒 أيام الأسبوع
    });

    if (this.pendingEmployee) {
      this.patchFormData(this.pendingEmployee);
      this.pendingEmployee = null;
    }

    this.registerForm.valueChanges.subscribe((val) => {
      const full = `${val.FirstName || ""} ${val.SecondName || ""} ${
        val.ThirdName || ""
      }`.trim();
      this.registerForm.patchValue({ FullName: full }, { emitEvent: false });
    });

    this.loadBranches();
  }

  private patchFormData(emp: any) {
    this.registerForm.patchValue({
      FirstName: emp.FirstName,
      SecondName: emp.SecondName,
      ThirdName: emp.ThirdName,
      UserType: emp.UserType,
      FullName: emp.FullName,
      NationalId: emp.NationalId,
      UserName: emp.UserName,
      Password: emp.Password,
      Email: emp.Email,
      Phone: emp.Phone,
      Phone2: emp.Phone2,
      BranchId: emp.BranchId,
      Classification: emp.Classification,
      FromTime: this.formatTime(emp.ShiftFrom),
      ToTime: this.formatTime(emp.ShiftTo),
      Img: emp.Img,
    });

    // ✅ تعبئة الأيام حسب الـ API
    const daysArray = this.registerForm.get("Days") as FormArray;
    const shifts = [
      emp.SatShift,
      emp.SunShift,
      emp.MonShift,
      emp.TueShift,
      emp.WedShift,
      emp.ThuShift,
      emp.FriShift,
    ];
    shifts.forEach((val, i) => daysArray.at(i).setValue(val === true));

    // 🟡 عرض صورة الموظف
    this.profilePreview = emp.Img ? emp.Img : this.defaultAvatar;
  }

  private formatTime(timeString: string | null): string | null {
    if (!timeString) return null;

    // نفصل الساعة والدقيقة
    const [hourStr, minuteStr] = timeString.split(":");
    const hour = hourStr.padStart(2, "0"); // تضيف صفر بادئ لو الساعة رقم واحد
    const minute = (minuteStr || "00").padStart(2, "0"); // تضيف صفر لو ناقص دقيقة

    return `${hour}:${minute}`;
  }

  get dayControls(): FormControl[] {
    return (this.registerForm.get("Days") as FormArray)
      .controls as FormControl[];
  }

  minSelectedCheckboxes(min: number) {
    return (formArray: AbstractControl) => {
      const totalSelected = (formArray as FormArray).controls
        .map((control) => control.value)
        .filter((value) => value).length;
      return totalSelected >= min ? null : { required: true };
    };
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

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.registerForm.value;

    // 🕒 معالجة أيام الأسبوع وتحويلها إلى Boolean
    const daysBooleans = formValue.Days.map((checked: boolean) => checked);
    const selectedBranch = this.branches.find(
      (b: any) => b.Id === formValue.BranchId
    );
    const token = localStorage.getItem("token") || "";
    const payload: UserResponse = {
      Id: this.isEditMode && this.employee ? this.employee.Id : 0, // ✅ هنا التعديل
      Classification: formValue.Classification || "",
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
      UserType: parseInt(formValue.UserType),
      RegisterDate: new Date().toISOString(),
      PassSalt: "",
      PassHash: "",
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
      Img: this.profilePreview || "",
      Message: "",
      Token: token,
      Branch: {
        Id: formValue.BranchId,
        BranchName: selectedBranch ? selectedBranch.BranchName : "",
        Message: "",
        AddedBy: 0,
        AddedAt: new Date().toISOString(),
      },
    };
    // 🟡 لو تعديل → استخدم update
    if (this.isEditMode) {
      this.api.updateEmployee(payload).subscribe({
        next: (res) => {
          this.showSuccess("تم تعديل الموظف بنجاح ✅");
          this.isEditMode = false;
          this.registerForm.reset();
          this.employeeIdToUpdate = null;
          this.closeForm.emit();
          this.refreshEmployees.emit(); // 🆕 بعد التعديل
        },
        error: (err) => {
          console.error("❌ Update error:", err);
          this.showError("حدث خطأ أثناء تعديل الموظف");
        },
      });
    } else {
      this.authService.register(payload).subscribe({
        next: (res) => {
          console.log("✅ Register success:", res);
          this.isSubmitting = false;
          this.registerForm.reset();
          this.showSuccess("تم تسجيل الموظف بنجاح");
          this.closeForm.emit();
          this.refreshEmployees.emit(); // 🆕 بعد التعديل
        },
        error: (err) => {
          console.error("❌ Register error:", err);
          this.isSubmitting = false;
        },
      });
    }
  }

  // onFileSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     this.uploadedFile = input.files[0];
  //     this.registerForm.patchValue({ Img: this.uploadedFile });

  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       this.selectedImage = reader.result;
  //     };
  //     reader.readAsDataURL(this.uploadedFile);
  //   }
  // }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
      // ✅ رفع الصورة مباشرة
      this.api.uploadImage(this.selectedImage).subscribe({
        next: (res: any) => {
          const imageUrl = res.fileUrl;

          this.profilePreview = imageUrl;
          this.cdr.detectChanges();

          this.showSuccess("تم رفع الصورة بنجاح");
        },

        error: (err) => {
          console.error("❌ خطأ في الرفع", err);
        },
      });
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
