import { Clients } from "./../clients/clients";
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ConfirmationService, MessageService } from "primeng/api";
import { Apiservice } from "../../services/apiservice";
import { CheckboxModule } from "primeng/checkbox";
import { MatSelectModule } from "@angular/material/select";
import { CommonModule } from "@angular/common";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { Router } from "@angular/router";

@Component({
  selector: "app-register-deal",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ConfirmDialogModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: "./register-deal.html",
  styleUrl: "./register-deal.scss",
  providers: [ConfirmationService],
})
export class RegisterDeal {
  @Input() isEditMode = false;
  @Input() deal: any;
  @Output() closeForm = new EventEmitter<void>();
  @Output() refreshDeals = new EventEmitter<void>();
  dealForm!: FormGroup;
  isSubmitting = false;
  // previews for uploaded images (optional)
  imagesPreview: string[] = [];
  uploadedFiles: File[] = [];
  clients: any[] = [];
  filteredClients: any[] = [];
  isSalesAutoAssigned = false;

  // dropdown data placeholders - you should load these from API or inputs
  countries: any[] = []; // {Id, CountryName}
  salesList: any[] = []; // {Id, FullName}
  paymentMethods = [
    { label: "نقدي", value: 1 },
    { label: "تقسيط", value: 2 },
  ];

  constructor(
    private fb: FormBuilder,
    private api: Apiservice,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    public router: Router
  ) {}

  ngOnInit(): void {
    // reactive form
    this.dealForm = this.fb.group({
      ClientName: ["", Validators.required],
      PhoneNumber: ["", Validators.required],
      SalesId: [null, Validators.required], // responsible sales
      CommunicationType: [null], // default whatsapp
      CallDuration: [""],
      Notes: [""],
      ClientId: [null],
      DealStatus: 0,
      Classification: [""],
      InterstedInCountryId: [null],
      Budget: [""],
      PaymentMethod: [null],
    });

    this.loadCountries();
    this.loadSales();
    this.loadClients();
  }

  loadCountries(): void {
    this.api.getAllCountry().subscribe({
      next: (res: any) => {
        this.countries = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("خطأ أثناء جلب الدول:", err);
      },
    });
  }

  loadSales() {
    this.api.getAllEmployee().subscribe({
      next: (res: any) => {
        this.salesList = (res || []).map((s: any) => ({
          label: s.FullName,
          value: s.Id,
          raw: s,
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  loadClients() {
    this.api.getAllClients().subscribe({
      next: (res: any) => {
        this.clients = res;
        this.cdr.detectChanges();
        this.filteredClients = [...this.clients];
      },
      error: (err) => {
        console.error("خطأ أثناء جلب الدول:", err);
      },
    });
  }

  filterClients(event: any) {
    const searchValue = event.target.value.toLowerCase();
    this.filteredClients = this.clients.filter((c) =>
      c.ClientName.toLowerCase().includes(searchValue)
    );

    console.log(this.filteredClients);
  }

  onClientChange(selectedId: number) {
    const selectedClient = this.clients.find((c) => c.Id === selectedId);
    if (selectedClient) {
      this.dealForm.patchValue({
        ClientName: selectedClient.ClientName,
        ClientId: selectedClient.Id,
        PhoneNumber: selectedClient.PhoneNumber,
        Classification: selectedClient.Classification ?? "",
        InterstedInCountryId: selectedClient.InterstedInCountryId ?? null,
        Budget: selectedClient.Budget ?? "",
        PaymentMethod: selectedClient.PaymentMethod ?? null,
        FilesArray: selectedClient.FilesArray ?? [], // لو عايز تعرض الملفات كـ preview
        SalesId: selectedClient.SalesId ?? null, // الموظف المسؤول تلقائيًا
      });
      this.isSalesAutoAssigned = true;
    } else {
      // إذا تم إلغاء اختيار العميل
      this.dealForm.patchValue({ SalesId: null });
      this.isSalesAutoAssigned = false;
    }
  }

  addNewClient() {
    this.router.navigate(["/client-register"]);
  }

  onSalesChange(selectedId: number) {
    const selectedSales = this.salesList.find(
      (s) => s.value === selectedId
    )?.raw;
    if (selectedSales) {
      // نخزن البيانات في الفورم
      this.dealForm.patchValue({
        SalesId: selectedSales.Id,
        SalesFullName: selectedSales.FullName,
        SalesClassification: selectedSales.Classification ?? "",
        SalesEmail: selectedSales.Email ?? "",
        SalesPhone: selectedSales.Phone ?? "",
        SalesPhone2: selectedSales.Phone2 ?? "",
        SalesBranch: selectedSales.Branch ?? null,
        SalesExperiencedInCountryId:
          selectedSales.ExperiencedInCountryId ?? null,
      });
    }
  }

  onFileSelected(evt: any) {
    const files: FileList = evt.target.files;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      this.uploadedFiles.push(f);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagesPreview.push(e.target.result);
      };
      reader.readAsDataURL(f);
    }
  }

  removeImage(index: number) {
    this.imagesPreview.splice(index, 1);
    this.uploadedFiles.splice(index, 1);
  }

  // build the body according to your schema
  private buildBody(): any {
    const nowIso = new Date().toISOString();
    const form = this.dealForm.value;

    const commands = [
      {
        Id: 0,
        Text: "",
        OpertionId: 0,
        AddedBy: 0,
        AddedAt: nowIso,
        EditedBy: 0,
        EditedAt: nowIso,
        Message: " ",
      },
    ];

    const client = {
      FilesArray: this.uploadedFiles.map((f) => ({
        Id: 0,
        ClientId: form.ClientId ?? 0,
        FilePath: f.name,
        AddedBy: 0,
        AddedAt: nowIso,
        Message: "",
        EditedBy: 0,
        EditedAt: nowIso,
      })),
      Id: form.ClientId,
      ClientName: form.ClientName,
      PhoneNumber: form.PhoneNumber,
      Classification: form.Classification ?? null,
      InterstedInCountryId: form.InterstedInCountryId ?? null,
      Budget: form.Budget ?? null,
      PaymentMethod: form.PaymentMethod ?? null,
      AddedBy: 0,
      AddedAt: nowIso,
      Message: null,
      EditedBy: 0,
      SalesId: form.SalesId ?? 0,
      EditedAt: nowIso,
    };
    const selectedSales = this.salesList.find(
      (s) => s.value === form.SalesId
    )?.raw;

    console.log(selectedSales);

    const sales = selectedSales ?? {
      Id: 0,
      Classification: null,
      FullName: null,
      Email: null,
      Phone: null,
      Phone2: null,
      Branch: null,
      ExperiencedInCountryId: null,
      RegisterDate: new Date().toISOString(),
      IsDeleted: false,
      AddedBy: 0,
      AddedAt: new Date().toISOString(),
      EditedBy: 0,
      EditedAt: new Date().toISOString(),
    };

    const body = {
      Commands: commands,
      Client: client,
      Sales: sales,
      Id: 0,
      ClientId: form.ClientId ?? 0, // ✅ هنا أصل المشكلة
      OperationType: 0,
      CommunicationType: form.CommunicationType ?? 0,
      CallDuration: form.CallDuration ?? "",
      DealStatus: 1,
      Status: 1,
      SalesId: form.SalesId ?? 0,
      Notes: form.Notes ?? "",
      AddedBy: 0,
      AddedAt: nowIso,
      EditedBy: 0,
      EditedAt: nowIso,
      Message: "Created from RegisterDeal",
    };

    return body;
  }

  submit() {
    if (this.dealForm.invalid) {
      this.dealForm.markAllAsTouched();
      this.messageService.add({
        severity: "warn",
        summary: "تنبيه",
        detail: "من فضلك اكمل الحقول المطلوبة",
        life: 3000,
      });
      return;
    }

    this.isSubmitting = true;
    const body = this.buildBody();
    // send POST to your API (endpoint name may differ)
    console.log(body);
    this.api.addOperation(body).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.messageService.add({
          severity: "success",
          summary: "تم",
          detail: "تم تسجيل الصفقة بنجاح",
          life: 3000,
        });
        this.refreshDeals.emit();
        this.closeForm.emit();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error(err);
        this.messageService.add({
          severity: "error",
          summary: "خطأ",
          detail: "حدث خطأ أثناء التسجيل",
          life: 4000,
        });
      },
    });
  }
}
