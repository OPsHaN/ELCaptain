import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
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
import { RegisterDeal } from "../register-deal/register-deal";
import { Apiservice, Country } from "../../services/apiservice";

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
    RegisterDeal,
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
  countries: Country[] = [];
  isDetailsMode = false; // 🔹 علشان نعرف إننا في وضع التفاصيل
  titleModel = "";
  deals: any[] = [];
  commands: any[] = [];
  editMode = false; // 🔹 نعرف إننا في وضع تعديل
  operationData: any = null;
  selectedSalesId: number | null = null;
  salesList: any[] = []; // هتحملها من API
  originalOperations: any[] = [];
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
    private confirmationService: ConfirmationService,
    private api: Apiservice,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getAllOperarions();
    this.loadCountries();
  }

  getAllOperarions() {
    this.api.getOperationWithStatus(1).subscribe({
      next: (res: any) => {
        console.log("Response:", res);

        // نحفظ النسخة الأصلية كما هي
        this.originalOperations = res;

        // نعرض نسخة مبسطة للجدول
        this.deals = res.map((item: any, index: number) => ({
          order: index + 1,
          id: item.Id,
          name: item.Client?.ClientName,
          phone: item.Client?.PhoneNumber,
          intersted: item.Client?.InterstedInCountryId ?? "غير محدد",
          budget: item.Client?.Budget ?? "-",
          empolyee: item.Sales?.FullName,
          salesId: item.Sales?.Id,
          status: item.Status,
          notes: item.Notes,
          communicationType: item.CommunicationType,
          callDuration: item.CallDuration,
          editedAt: item.EditedAt,
          active: item.Status === 2,
          selected: false,
        }));
      },
      error: (err) => console.error("❌ Error loading operations:", err),
    });
  }

  loadCountries(): void {
    this.api.getAllCountry().subscribe({
      next: (res: any) => {
        this.countries = res;
        this.cdr.detectChanges();
        console.log(this.countries);
      },
      error: (err) => {
        console.error("خطأ أثناء جلب الدول:", err);
      },
    });
  }

  onSelectDeal(deal: any) {
    // تحديث البيانات محليًا فقط بدون أي استدعاء API
    deal.status = 2; // غير جاد
    deal.active = false; // إلغاء التفعيل محليًا

    // لو حابب تحتفظ بالـ body للعرض أو اللوج فقط
    const body = {
      Id: deal.id,
      Status: 2,
      OperationType: deal.OperationType ?? 2,
      CallDuration: deal.CallDuration ?? "0",
      Notes: deal.Notes ?? "",
      EditedAt: new Date().toISOString(),
    };

    console.log("🟡 Local update (no API call):", body);
  }

  getCountryNameById(id: number): string {
    const country = this.countries.find((c) => c.id === id);
    return country ? country.name : "غير معروف";
  }

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

  onToggleActive(deal: any) {
    if (!deal.selected) {
      this.confirmationService.confirm({
        message: "يجب تحديد العميل أولاً قبل تغيير الحالة ✅",
        acceptLabel: "موافق",
        rejectVisible: false,
        icon: "pi pi-info-circle",
      });
      return;
    }

    // عكس الحالة محليًا فقط
    deal.active = !deal.active;

    // تحديث الحالة داخل الجدول فقط بدون API
    deal.status = deal.active ? 2 : 3; // 3 = جاد ، 2 = غير جاد

    console.log("🟡 تم تغيير حالة العميل محليًا فقط:", {
      Id: deal.id,
      Status: deal.status,
      OperationType: deal.OperationType ?? 2,
      CallDuration: deal.CallDuration ?? "0",
      Notes: deal.Notes ?? "",
      EditedAt: new Date().toISOString(),
    });
  }

  mapCommunicationType(type: number | string) {
    switch (type) {
      case 1:
        return "call";
      case 2:
        return "whatsapp";
      case 3:
      case "visit":
        return "visit";
      default:
        return "";
    }
  }

  openModal(deal: any) {
    if (!deal.selected) {
      this.confirmationService.confirm({
        message: "يجب تحديد العميل أولاً قبل عرض التفاصيل ✅",
        acceptLabel: "موافق",
        rejectVisible: false,
        icon: "pi pi-info-circle",
      });
      return;
    }

    this.isDetailsMode = false;
    this.editMode = false; // 👈 مش تعديل
    this.titleModel = "تأكيد الحفظ";

    this.selectedDeal = deal;
    this.employeeName = deal.empolyee;
    this.currentDateTime = formatDate(new Date(), "yyyy/MM/dd hh:mm a", "en");

    this.message = deal.notes ?? "";
    this.selectedContactMethod = this.mapCommunicationType(
      deal.communicationType
    );
    this.callDuration = deal.callDuration ?? null;

    this.displayModal = true;
  }

  openDetails(deal: any) {
    this.displayModal = true;
    this.isDetailsMode = true; // ✅ وضع التفاصيل
    this.editMode = false; // ❌ مش تعديل
    this.titleModel = "تفاصيل العملية";

    this.selectedDeal = deal;

    // جلب تفاصيل العميل والعملية
    this.api.getOperation(deal.id).subscribe({
      next: (res: any) => {
        this.operationData = res;
        this.employeeName = res.Sales?.FullName;
        this.currentDateTime = formatDate(
          deal.editedAt ?? deal.addedAt,
          "yyyy/MM/dd hh:mm a",
          "en"
        );

        this.message = res.Notes ?? "";
        this.selectedContactMethod =
          res.CommunicationType === 1
            ? "call"
            : res.CommunicationType === 2
            ? "whatsapp"
            : "other";
        this.callDuration = res.CallDuration ?? null;
        this.commands = res.Commands; // ✅ حفظ الأوامر
      },
      error: (err) => console.error(err),
    });
  }

  editModal(deal: any) {
    this.displayModal = true;
    this.isDetailsMode = false;
    this.editMode = true;
    this.titleModel = "تعديل الموظف المسؤول";

    this.selectedDeal = deal;

    this.api.getOperation(deal.id).subscribe({
      next: (res: any) => {
        this.operationData = res;
        this.employeeName = res.Sales?.FullName;
        this.selectedSalesId = res.Sales?.Id;
        this.currentDateTime = formatDate(
          new Date(),
          "yyyy/MM/dd hh:mm a",
          "en"
        );
        this.message = res.Notes ?? "";
        this.commands = res.Commands;
        this.cdr.detectChanges();
      },
    });

    this.api.getAllEmployee().subscribe({
      next: (res: any) => {
        this.salesList = res;
        this.cdr.detectChanges();
      },
    });
  }

  saveModal() {
    if (!this.editMode || !this.selectedDeal?.id) {
      console.warn("❌ لا يوجد عملية محددة للحفظ");
      return;
    }

    const operationId = this.selectedDeal.id;
    const newSalesId = Number(this.selectedSalesId);

    const body = {
      Commands: [],
      Client: {
        FilesArray: [],
        Id: this.operationData?.Client?.Id ?? 0,
        ClientName: this.operationData?.Client?.ClientName ?? null,
        PhoneNumber: this.operationData?.Client?.PhoneNumber ?? null,
        Classification: this.operationData?.Client?.Classification ?? null,
        InterstedInCountryId:
          this.operationData?.Client?.InterstedInCountryId ?? null,
        Budget: this.operationData?.Client?.Budget ?? null,
        PaymentMethod: this.operationData?.Client?.PaymentMethod ?? null,
        AddedBy: this.operationData?.Client?.AddedBy ?? 0,
        AddedAt:
          this.operationData?.Client?.AddedAt ?? new Date().toISOString(),
        Message: this.operationData?.Client?.Message ?? null,
        EditedBy: this.operationData?.Client?.EditedBy ?? 0,
        SalesId: newSalesId,
        EditedAt: new Date().toISOString(),
      },
      Sales: this.operationData?.Sales ?? {},
      Id: operationId,
      ClientId: this.operationData?.ClientId ?? null,
      OperationType: this.operationData?.OperationType ?? null,
      CommunicationType: this.operationData?.CommunicationType ?? null,
      CallDuration: this.operationData?.CallDuration ?? null,
      Status: this.operationData?.Status ?? null,
      SalesId: newSalesId,
      Notes: this.operationData?.Notes ?? null,
      AddedBy: this.operationData?.AddedBy ?? 0,
      AddedAt: this.operationData?.AddedAt ?? new Date().toISOString(),
      EditedBy: this.operationData?.EditedBy ?? 0,
      EditedAt: new Date().toISOString(),
      Message: "Updated SalesId",
    };

    console.log("📤 إرسال Body للـ API:", body);

    this.api.updateOperation(body).subscribe({
      next: () => {
        const target = this.deals.find((d) => d.id === operationId);
        if (target) {
          const newSales = this.salesList.find((s) => s.Id === newSalesId);
          if (newSales) target.empolyee = newSales.FullName;
        }

        this.messageService.add({
          severity: "success",
          summary: "تم الحفظ",
          detail: "تم تعديل الموظف المسؤول بنجاح ✅",
          life: 3000,
        });

        this.getAllOperarions();

        this.displayModal = false;
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: "error",
          summary: "خطأ",
          detail: "حدث خطأ أثناء التعديل ❌",
          life: 3000,
        });
      },
    });
  }

  saveNewOperation() {
    if (!this.selectedDeal) {
      this.messageService.add({
        severity: "warn",
        summary: "تنبيه",
        detail: "يرجى اختيار صفقة أولاً ⚠️",
      });
      return;
    }

    // ✅ نجيب النسخة الأصلية من العملية
    const original = this.originalOperations.find(
      (op: any) => op.Id === this.selectedDeal.id
    );

    if (!original) {
      console.error("❌ لم يتم العثور على العملية الأصلية!");
      return;
    }

    // ✅ نعمل نسخة جديدة منها عشان نعدل فيها بأمان
    const body = JSON.parse(JSON.stringify(original));

    // 🧩 ندمج التعديلات الجديدة فقط
    body.Status = this.selectedDeal.status ?? body.Status;
    body.DealStatus = this.selectedDeal.DealStatus ?? body.DealStatus;
    body.Notes = this.message || this.selectedDeal.notes || body.Notes;
    body.CommunicationType =
      this.selectedContactMethod === "call"
        ? 1
        : this.selectedContactMethod === "whatsapp"
        ? 2
        : this.selectedContactMethod === "visit"
        ? 3
        : body.CommunicationType;
    body.CallDuration =
      this.selectedContactMethod === "call"
        ? this.callDuration?.toString() || "0"
        : "0";

    body.EditedAt = new Date().toISOString();

    console.log("📦 Body النهائي قبل الإرسال:", body);

    // ✅ حفظ العملية
    this.api.updateOperation(body).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "تم الحفظ",
          detail: "✅ تم حفظ العملية بنجاح",
          life: 3000,
        });
        this.displayModal = false;
        this.getAllOperarions();
      },
      error: (err) => {
        console.error("❌ خطأ أثناء الحفظ:", err);
        this.messageService.add({
          severity: "error",
          summary: "خطأ",
          detail: "حدث خطأ أثناء حفظ البيانات ❌",
          life: 3000,
        });
      },
    });
  }

  resetForm() {
    this.selectedDeal = null;
    // this.employeeName = "";
    // this.currentDateTime = "";
    this.selectedContactMethod = "";
    this.callDuration = null;
    this.message = "";
  }
}
