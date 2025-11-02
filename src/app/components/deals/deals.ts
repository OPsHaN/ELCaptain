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

  constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Initialization logic can be added here
    this.getAllDeals();
  }

  getAllDeals() {
    this.api.getOperationWithStatus(2).subscribe((res: any) => {
      this.deals = res;
      console.log(res);

      // تصنيف الصفقات حسب الحالة
      this.openDeals = this.deals.filter((d) => d.DealStatus === 1);
      this.rejectedDeals = this.deals.filter((d) => d.DealStatus === 3);
      this.closedDeals = this.deals.filter((d) => d.DealStatus === 2);
      this.pendingDeals = this.deals.filter((d) => d.DealStatus === 4);

      this.cdr.detectChanges();
    });
  }

  openNoteDialog() {
    this.noteText = "";
    this.showNoteDialog = true;
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
        return "معلقة";
      case 3:
        return "مغلقة";
      case 4:
        return "مرفوضة";
      default:
        return "غير معروفة";
    }
  }
}
