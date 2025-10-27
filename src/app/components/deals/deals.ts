import { RegisterDeal } from "./../register-deal/register-deal";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { CommonModule } from "@angular/common";
import {
  CdkDragDrop,
  DragDropModule,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { Apiservice } from "../../services/apiservice";
@Component({
  selector: "app-deals",
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ConfirmDialogModule,
    RegisterDeal,
    DragDropModule,
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
  dealColumns = [
    { title: "Backlog", status: "backlog", deals: [] },
    { title: "To Do", status: "todo", deals: [] },
    { title: "In Progress", status: "inProgress", deals: [] },
    { title: "In Review", status: "inReview", deals: [] },
    { title: "Done", status: "done", deals: [] },
  ];

  constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Initialization logic can be added here

    
  }

  getAllDeals() {
    // this.api.getAllDeals().subscribe({
    //   next: (res: any) => (this.deals = res),
    //   error: (err) => console.error(err),
    // });
  }

  onDrop(event: CdkDragDrop<any[]>, newStatus: string) {
    if (event.previousContainer === event.container) return;
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    // هنا ممكن تعمل API call لتحديث حالة الصفقة
    const movedDeal = event.container.data[event.currentIndex];
    console.log(`🔄 نقل الصفقة ${movedDeal.DealName} إلى ${newStatus}`);
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
    this.selectedDeal = deal;
    this.showDealDialog = true;
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
  getPaymentMethod(method: string): string {
    switch (method) {
      case "cash":
        return "نقدي";
      case "installment":
        return "تقسيط";
      case "transfer":
        return "تحويل بنكي";
      default:
        return "غير محدد";
    }
  }
}
