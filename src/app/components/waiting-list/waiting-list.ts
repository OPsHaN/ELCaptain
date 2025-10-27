import { Component, OnInit } from "@angular/core";
import { TableModule } from "primeng/table";
import { CheckboxModule } from "primeng/checkbox";
import { FormBuilder, FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { CommonModule, formatDate } from "@angular/common";
import { ConfirmationService, MessageService } from "primeng/api";
import { AuthService } from "../../services/authservice";
import { Router } from "@angular/router";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";

interface Deal {
  name: string;
  clientName: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
}
@Component({
  selector: "app-waiting-list",
  standalone: true,
  imports: [
    TableModule,
    CheckboxModule,
    CommonModule,
    ButtonModule,
    FormsModule,
    ConfirmDialogModule,
    DialogModule,
    MatSelectModule,
    MatInputModule,
  ],
  templateUrl: "./waiting-list.html",
  styleUrls: ["./waiting-list.scss"],
  providers: [ConfirmationService],
})
export class WaitingList implements OnInit {
  selectAll = false;
  showRegisterForm = false;
  isEditMode = false;
  displayModal = false; // تحكم في إظهار المودال
  selectedDeal: any = null; // الصف اللي ضغط عليه
  employeeName: any = ""; // اسم الموظف (ممكن تجيبه من session أو Auth)
  currentDateTime = ""; // التاريخ والوقت الحالي
  message = "";

  deals = [
    {
      order: 1,
      name: "محمد أحمد",
      intersted: "كورى",
      empolyee: "إسماعيل",
      phone: "0100000000",
      active: false,
      selected: false,
    },
    {
      order: 2,
      name: "سارة علي",
      intersted: "يابانى",
      empolyee: "هبة",
      phone: "0111111111",
      active: false,
      selected: false,
    },
  ];

  contactMethods = [
    { name: "مكالمة", value: "call" },
    { name: "واتساب", value: "whatsapp" },
    { name: "آخرى", value: "visit" },
  ];

  selectedContactMethod: any = null;
  callDuration: number | null = null;

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {}

  toggleRegisterForm() {
    this.showRegisterForm = !this.showRegisterForm;
    if (!this.showRegisterForm) {
      this.selectedDeal = null;
      this.isEditMode = false;
    }
  }

  toggleAll(event: any) {
    const checked = event.checked;
    this.deals.forEach((d) => (d.selected = checked));
  }

  onContactMethodChange(event: any) {
    // لو غير الطريقة، امسح مدة المكالمة
    if (event.value?.value !== "call") {
      this.callDuration = null;
    }
  }

  edit(deal: Deal): void {
    console.log("تعديل", deal);
    // منطق التعديل
  }

  delete(deal: Deal): void {
    console.log("حذف", deal);
    // منطق الحذف
  }

  onToggleActive(deal: any) {
    // لو مش محدد الـ p-checkbox
    if (!deal.selected) {
      this.confirmationService.confirm({
        message: "يجب تحديد العميل أولاً قبل تغيير الحالة ✅",
        acceptLabel: "موافق",
        rejectVisible: false, // نخفي زر "لا" بدل "نعم"
        icon: "pi pi-info-circle",
      });
      return;
    }

    const oldValue = deal.active;

    this.confirmationService.confirm({
      message: "هل تريد تغيير حالة العميل الى عميل جاد ؟",
      acceptLabel: "نعم",
      rejectLabel: "لا",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        deal.active = !oldValue;
      },
      reject: () => {
        deal.active = oldValue;
      },
    });
  }

  openModal(deal: any) {
    if (!deal.selected) {
      this.confirmationService.confirm({
        message: "يجب تحديد العميل أولاً قبل تغيير الحالة ✅",
        acceptLabel: "موافق",
        rejectVisible: false, // نخفي زر "لا" بدل "نعم"
        icon: "pi pi-info-circle",
      });
      return;
    }

    this.selectedDeal = deal;
    this.currentDateTime = formatDate(new Date(), "yyyy/MM/dd HH:mm", "en");
    this.message = "";
    this.displayModal = true;
    this.employeeName = deal.empolyee;
  }

  saveModal() {
    const payload = {
      dealId: this.selectedDeal.id,
      employeeName: this.employeeName,
      dateTime: this.currentDateTime,
      message: this.message,
    };

    // this.http.post('https://api.example.com/save', payload).subscribe({
    //   next: (res) => {
    //     console.log('✅ تم حفظ البيانات', res);
    //     this.displayModal = false;
    //   },
    //   error: (err) => {
    //     console.error('❌ حدث خطأ', err);
    //   },
    // });
  };

  openDetails(){

  }

  editModal(){
    
  }
}
