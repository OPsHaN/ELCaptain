import { RegisterDeal } from "./../register-deal/register-deal";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { CommonModule } from "@angular/common";
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { Apiservice } from "../../services/apiservice";
import { FormsModule } from "@angular/forms";
import { NotesOnlyPipe } from "../../shared/pipe/notes-only-pipe";
import { MatTabsModule } from "@angular/material/tabs";
import { NotificationService } from "../../services/notification";
import { switchMap, timer } from "rxjs";

@Component({
  selector: "app-deals",
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ConfirmDialogModule,
    RegisterDeal,
    DragDropModule,
    FormsModule,
    NotesOnlyPipe,
    MatTabsModule,
  ],

  templateUrl: "./deals.html",
  styleUrls: ["./deals.scss"],
  providers: [ConfirmationService],
})
export class Deals implements OnInit {
  deals: any[] = [];
  selectedDeal: any = null;
  showRegisterDealForm = false;
  isEditMode = false;
  defaultAvatar = "assets/images/user-placeholder.png";
  selectedDeals: any | null = null;
  showRegisterForm = false;
  showDealDialog = false;
  openDeals: any[] = [];
  closedDeals: any[] = [];
  rejectedDeals: any[] = [];
  pendingDeals: any[] = [];
  showNoteDialog = false;
  noteText = "";
  showReminderDialog = false;
  notificationText = "";
  validFrom = "";
  currentOperationId = 0; // Id الصفقة الحالية
  editEmployeeMode = false;
  selectedEmployeeId: number | null = null;
  allEmployees: any = [];
  role = 0;
  private subscription: any;
  constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    // Initialization logic can be added here
    this.subscription = timer(0, 100000)
      .pipe(switchMap(async () => this.getAllDeals()))
      .subscribe();

    const storedRole = localStorage.getItem("userType");
    if (storedRole) {
      this.role = +storedRole; // نحولها لرقم
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }

  getAllDeals() {
    this.api.getOperationWithStatus(2).subscribe((res: any) => {
      this.deals = res;
      console.log(res);

      // تصنيف الصفقات حسب الحالة
      this.openDeals = this.deals.filter((d) => d.DealStatus === 1);
      this.rejectedDeals = this.deals.filter((d) => d.DealStatus === 3);
      this.closedDeals = this.deals.filter(
        (d) => d.DealStatus === 2 && d.IsDelivered === false
      );
      this.pendingDeals = this.deals.filter((d) => d.DealStatus === 4);

      this.cdr.detectChanges();
    });
  }

  /** 🧾 تحميل جميع الموظفين */
  loadEmployees() {
    this.api.getAllEmployee().subscribe({
      next: (res) => {
        this.allEmployees = res;
      },
      error: (err) => {
        console.error("❌ خطأ في تحميل الموظفين:", err);
        this.showError("تعذر تحميل الموظفين");
      },
    });
  }

  /** ✏️ تبديل وضع تعديل الموظف */
  toggleEditEmployee() {
    this.editEmployeeMode = !this.editEmployeeMode;

    // تحميل الموظفين عند أول فتح
    if (this.editEmployeeMode && this.allEmployees.length === 0) {
      this.loadEmployees();
    }
  }

  /** ✅ تحديث الموظف المسؤول */
  updateEmployee(employeeId: number | null) {
    if (!employeeId || !this.selectedDeal) return;

    // نجيب النسخة الأصلية من الصفقة
    const original = this.deals.find(
      (op: any) => op.Id === this.selectedDeal.Id
    );
    if (!original) {
      console.error("❌ لم يتم العثور على الصفقة الأصلية!");
      return;
    }

    // نعمل نسخة عميقة لتجنب تعديل الأصل مباشرة
    const body = JSON.parse(JSON.stringify(original));

    // نعدل فقط SalesId
    body.SalesId = employeeId;
    body.EditedAt = new Date().toISOString(); // تحديث الوقت

    this.api.updateOperation(body).subscribe({
      next: () => {
        // تحديث محلي
        const newEmp = this.allEmployees.find((e: any) => e.Id === employeeId);
        if (newEmp) {
          this.selectedDeal.Sales = { ...newEmp };
          const idx = this.deals.findIndex(
            (d) => d.Id === this.selectedDeal.Id
          );
          if (idx !== -1) this.deals[idx].Sales = { ...newEmp };
        }

        this.editEmployeeMode = false;
        this.showSuccess("تم تحديث الموظف بنجاح ✅");
        this.getAllDeals();
      },
      error: (err) => {
        console.error("❌ خطأ أثناء تحديث الموظف:", err);
        this.showError("حدث خطأ أثناء تحديث الموظف");
      },
    });
  }

  /** 🚗 تبديل حالة تسليم العربية */
  /** 🚗 تبديل حالة تسليم العربية */
  toggleDelivered(deal: any) {
    if (!deal) return;

    // نجيب النسخة الأصلية من الصفقة
    const original = this.deals.find((op: any) => op.Id === deal.Id);
    if (!original) {
      console.error("❌ لم يتم العثور على الصفقة الأصلية!");
      return;
    }

    // نعمل نسخة عميقة لتجنب تعديل الأصل مباشرة
    const body = JSON.parse(JSON.stringify(original));

    // نعدل فقط IsDelivered
    body.IsDelivered = deal.IsDelivered;
    body.EditedAt = new Date().toISOString(); // تحديث الوقت

    this.api.updateOperation(body).subscribe({
      next: () => {
        // تحديث محلي
        const idx = this.deals.findIndex((d) => d.Id === deal.Id);
        if (idx !== -1) this.deals[idx].IsDelivered = deal.IsDelivered;

        this.selectedDeal.IsDelivered = deal.IsDelivered;

        this.showSuccess(
          deal.IsDelivered ? "تم تحديد التسليم ✅" : "تم إلغاء التسليم ❌"
        );
        this.getAllDeals();
      },
      error: (err) => {
        console.error("❌ خطأ أثناء تحديث حالة التسليم:", err);
        this.showError("حدث خطأ أثناء تحديث حالة التسليم");
      },
    });
  }

  openNoteDialog() {
    this.noteText = "";
    this.showNoteDialog = true;
  }

  openReminderDialog(operationId: number) {
    this.currentOperationId = operationId;
    this.notificationText = "";
    this.validFrom = "";
    this.showReminderDialog = true;
  }

  addCommand() {
    if (!this.noteText.trim() || !this.selectedDeal) return;

    const body = {
      Id: 0,
      Text: this.noteText.trim(),
      OpertionId: this.selectedDeal.Id,
      IsNotes: true,
    };

    // 🟢 إرسال إلى الـ API
    this.api.addCommands(body).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: "success",
          summary: "تمت الإضافة ✅",
          detail: "تمت إضافة الملاحظة بنجاح",
        });

        this.showNoteDialog = false;
        this.noteText = "";
        this.cdr.detectChanges();
        this.getAllDeals();

        // لو عندك list للملاحظات:
        // this.notesLogs.push(body);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: "error",
          summary: "خطأ ❌",
          detail: "حدث خطأ أثناء إضافة الملاحظة",
        });
      },
    });
  }

  addReminder() {
    const userId = Number(localStorage.getItem("userId")) || 0;

    const body = {
      Id: 0,
      UserId: userId,
      OperationId: this.currentOperationId,
      NotificationText: this.notificationText,
      Seen: false,
      IsReminder: true,
      ValidFrom: this.validFrom, // التاريخ والوقت
    };

    this.api.addReminder(body).subscribe({
      next: () => {
        this.showReminderDialog = false;
        this.noteText = "";
        this.validFrom = "";
        this.notification.loadNotifications(); // تحديث الإشعارات والعداد
        this.showSuccess("تم إضافة التذكير بنجاح");
      },
      error: (err) => {
        console.error(err);
        this.showError("حدث خطأ أثناء إضافة التذكير");
      },
    });
  }

  onDrop(event: CdkDragDrop<any[]>, newStatus: number) {
    if (event.previousContainer === event.container) {
      // نفس العمود ⇒ ترتيب فقط
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // نقل من عمود لعمود آخر
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // الصفقة المنقولة
      const movedDeal = event.container.data[event.currentIndex];

      // ✅ تحديث الحالة الجديدة
      movedDeal.DealStatus = newStatus;

      // ✅ إرسالها كاملة إلى الـ API
      this.api.updateOperation(movedDeal).subscribe({
        next: () => {
          this.messageService.add({
            severity: "success",
            summary: "تم التحديث",
            detail: `تم نقل الصفقة رقم ${movedDeal.Id} بنجاح ✅`,
          });

          this.getAllDeals();
        },
        error: (err) => {
          console.error("❌ خطأ أثناء تحديث الصفقة:", err);
          this.messageService.add({
            severity: "error",
            summary: "خطأ",
            detail: "تعذر تحديث حالة الصفقة ❌",
          });

          // ⛔ في حالة الخطأ: نرجع الصفقة إلى العمود الأصلي
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
        },
      });
    }

    this.cdr.detectChanges();
  }

  toggleRegisterForm() {
    this.showRegisterForm = !this.showRegisterForm;
    if (!this.showRegisterForm) {
      this.selectedDeal = null;
      this.isEditMode = false;
    }
  }

  /** ✅ عرض تفاصيل صفقة */
  viewDeal(deal: any): void {
    this.selectedDeal = { ...deal };
    this.showDealDialog = true;
    this.cdr.detectChanges();
  }

  /** ✅ تعديل صفقة */
  editDeal(deal: any): void {
    this.selectedDeal = { ...deal };
    this.isEditMode = true;
    this.showRegisterForm = true;
  }

  /** ✅ حذف صفقة */
  deleteDeal(deal: any): void {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف الصفقة <b>${deal.DealName}</b>؟`,
      acceptLabel: "نعم",
      rejectLabel: "لا",
      icon: "pi pi-exclamation-triangle",
      // accept: () => {
      //   this.api.deleteDeal(deal.Id).subscribe({
      //     next: () => {
      //       this.messageService.add({
      //         severity: "success",
      //         summary: "تم الحذف",
      //         detail: "تم حذف الصفقة بنجاح",
      //       });
      //       this.getAllDeals();
      //     },
      //     error: (err) => {
      //       console.error("❌ خطأ أثناء الحذف:", err);
      //       this.messageService.add({
      //         severity: "error",
      //         summary: "خطأ",
      //         detail: "تعذر حذف الصفقة",
      //       });
      //     },
      //   });
      // },
    });
  }

  /** ✅ لتنسيق trackBy بالكروت */
  trackById(index: number, item: any): number {
    return item.Id;
  }

  /** ✅ طريقة الدفع */
  getPaymentMethod(method: number): string {
    switch (method) {
      case 1:
        return "نقدي";
      case 2:
        return "كاش";
      case 3:
        return "تحويل بنكي";
      default:
        return "غير محدد";
    }
  }

  getStatusName(status: number): string {
    switch (status) {
      case 1:
        return "مفتوحة";
      case 2:
        return "منتهية";
      case 3:
        return "مرفوضة";
      case 4:
        return "معلقة";
      default:
        return "غير معروفة";
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
