import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Register } from "../register/register";
import { Apiservice } from "../../services/apiservice";
import { finalize } from "rxjs";
import { MessageService } from "primeng/api";
import { DialogModule } from "primeng/dialog";

// interface Employee {
//   id: number;
//   name: string;
//   role: string;
//   avatar?: string;
// }

@Component({
  selector: "app-employees",
  standalone: true,
  imports: [CommonModule, Register, DialogModule],
  templateUrl: "./employees.html",
  styleUrl: "./employees.scss",
})
export class Employees implements OnInit {
  employees: any[] = [];
  defaultAvatar = "./photos/user.jpg";
  activeTable: string | null = null;
  isLoading = false;
  showRegisterForm = false;
  selectedEmployee: any | null = null;
  isEditMode = false; // ⬅️ لو true معناها بنعدل موظف
  showEmployeeDialog: boolean = false;

  daysOfWeek = [
    { key: "SatShift", label: "السبت" },
    { key: "SunShift", label: "الأحد" },
    { key: "MonShift", label: "الإثنين" },
    { key: "TueShift", label: "الثلاثاء" },
    { key: "WedShift", label: "الأربعاء" },
    { key: "ThuShift", label: "الخميس" },
    { key: "FriShift", label: "الجمعة" },
  ];

  ranks = [
    { name: "عضو مجلس إدارة", code: 1 },
    { name: "مدير فرع", code: 2 },
    { name: "موظف", code: 3 },
  ];

  constructor(
    private api: Apiservice,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  /** ✅ تحميل الموظفين من الـ API */
  loadEmployees() {
    this.isLoading = true;
    this.api
      .getAllEmployee()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: any) => {
          this.employees = (res || []).map((emp: any) => ({
            ...emp, // ✅ خزن كل بيانات الموظف
            displayName: emp.FullName,
            roleText:
              this.ranks.find((r) => r.code === emp.UserType)?.name ||
              "غير معروف",
            avatar:
              emp.Img && emp.Img !== "string" ? emp.Img : this.defaultAvatar,
            loggedIn: emp.IsLoggedIn === true ? "متصل" : "غير متصل",
          }));
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error loading employees", err);
          this.showError("حدث خطأ أثناء تحميل الموظفين");
        },
      });
  }

  /** ✅ إظهار أو إخفاء فورم التسجيل */
  toggleTable(type: string) {
    this.activeTable = this.activeTable === type ? null : type;
  }

  /** 👁 عرض تفاصيل الموظف */
  viewEmployee(emp: any) {
    this.selectedEmployee = emp;
    this.showEmployeeDialog = true;
  }

  closeDialog() {
    this.showEmployeeDialog = false;
    this.selectedEmployee = null;
  }
  /** ✏️ تعديل الموظف */
  editEmployee(e: any) {
    console.log("Edit employee", e);
    this.selectedEmployee = e; // 🟡 نحفظ الموظف المحدد
    this.showRegisterForm = true; // ✅ نفتح الفورم
    this.isEditMode = true;
    this.cdr.detectChanges();
  }

  /** 🗑 حذف الموظف */
  deleteEmployee(e: any) {
    if (!e?.id) {
      this.showError("هذا الموظف غير صالح للحذف");
      return;
    }

    this.api.deleteEmployee(e.id).subscribe({
      next: () => {
        this.employees = this.employees.filter((emp) => emp.id !== e.id);
        this.showSuccess("✅ تم حذف الموظف بنجاح");
      },
      error: (err) => {
        console.error("Error deleting employee:", err);
        this.showError("حدث خطأ أثناء حذف الموظف");
      },
    });
  }

  /** 🔁 تحسين الأداء */
  trackById(index: number, item: any) {
    return item.id;
  }

  toggleRegisterForm() {
    this.selectedEmployee = null; // ✨ عشان الفورم يفتح فاضي
    this.showRegisterForm = !this.showRegisterForm;
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
