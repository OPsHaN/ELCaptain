import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Register } from "../register/register";
import { Apiservice } from "../../services/apiservice";
import { finalize } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogModule } from "primeng/dialog";
import { ConfirmDialog } from "primeng/confirmdialog";
import { FormsModule } from "@angular/forms";
import { PaginatorModule } from "primeng/paginator";

@Component({
  selector: "app-employees",
  standalone: true,
  imports: [
    CommonModule,
    Register,
    DialogModule,
    ConfirmDialog,
    FormsModule,
    PaginatorModule,
  ],
  templateUrl: "./employees.html",
  styleUrl: "./employees.scss",
  providers: [ConfirmationService],
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
  searchQuery: string = "";
  filteredEmployees: any[] = [];
  now = new Date();
  page: number = 0;
  pageSize: number = 8;
  totalRecords: number = 0;
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
    { name: "ماركتينج", code: 4 },
  ];

  constructor(
    private api: Apiservice,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }
  ////ريفريش من كمبونت تانى
  getAllEmployees() {
    this.loadEmployees();
  }

  isOnline(lastSeen: string): boolean {
    if (!lastSeen) return false;

    const lastSeenDate = new Date(lastSeen);
    const diffMs = this.now.getTime() - lastSeenDate.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    return diffMinutes <= 5; // متصل لو آخر نشاط خلال 5 دقائق
  }

  getStatusClass(lastSeen: string) {
    return this.isOnline(lastSeen) ? "online" : "offline";
  }

  getStatusText(lastSeen: string) {
    return this.isOnline(lastSeen) ? "متصل" : "غير متصل";
  }

  /** ✅ تحميل الموظفين من الـ API */
  loadEmployees() {
    this.isLoading = true;

    this.api
      .getAllEmployee()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: any) => {
          // ✅ تجهيز البيانات
          this.employees = (res || []).map((emp: any) => ({
            ...emp,
            displayName:
              emp.FullName ||
              `${emp.FirstName} ${emp.SecondName} ${emp.ThirdName}`,
            roleText:
              this.ranks.find((r) => r.code === emp.UserType)?.name ||
              "غير معروف",
            avatar:
              emp.Img && emp.Img !== "string" ? emp.Img : this.defaultAvatar,
            loggedIn: emp.IsLoggedIn ? "متصل" : "غير متصل",
          }));

          // ✅ أول تحميل يعرض الكل
          this.filteredEmployees = [...this.employees].reverse();
          this.totalRecords = this.filteredEmployees.length;

          // لو في نص مكتوب في البحث، فلتر على طول (مفيدة عند الرجوع من صفحة تانية)
          if (this.searchQuery?.trim()) {
            this.onSearchChange();
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error loading employees", err);
          this.showError("حدث خطأ أثناء تحميل الموظفين");
        },
      });
  }

  get paginatedEmpolyees() {
  const start = this.page * this.pageSize;
  const end = start + this.pageSize;
  return this.filteredEmployees.slice(start, end);
}

onPageChange(event: any) {
  this.page = event.page;
  this.pageSize = event.rows;
}

  onSearchChange() {
    const search = this.searchQuery?.toLowerCase().trim();

    if (!search) {
      this.filteredEmployees = [...this.employees];
      return;
    }

    this.filteredEmployees = this.employees.filter((emp: any) =>
      [
        emp.FullName,
        emp.FirstName,
        emp.SecondName,
        emp.ThirdName,
        emp.Phone,
        emp.Phone2,
        emp.Email,
        emp.NationalId,
      ].some((field) => field?.toString().toLowerCase().includes(search))
    );
  }
  /** ✅ إظهار أو إخفاء فورم التسجيل */
  toggleTable(type: string) {
    this.activeTable = this.activeTable === type ? null : type;
  }

  /** 👁 عرض تفاصيل الموظف */
  viewEmployee(emp: any) {
    this.selectedEmployee = emp;
    this.showEmployeeDialog = true;
    console.log(emp);
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
    this.confirmationService.confirm({
      message: `هل أنت متأكد أنك تريد حذف الموظف <strong>${
        e.fullName || ""
      }</strong>؟`,
      header: "تأكيد الحذف",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "نعم",
      rejectLabel: "لا",
      accept: () => {
        this.api.deleteEmployee(e.Id).subscribe({
          next: () => {
            this.employees = this.employees.filter((emp) => emp.id !== e.Id);
            this.showSuccess("✅ تم حذف الموظف بنجاح");
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error("❌ Error deleting employee:", err);
            this.showError("حدث خطأ أثناء حذف الموظف");
          },
        });
      },
      reject: () => {
        // 👌 لا تفعل شيء لو ضغط "لا"
      },
    });
  }

  /** 🔁 تحسين الأداء */
  trackById(index: number, item: any) {
    return item.Id;
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
