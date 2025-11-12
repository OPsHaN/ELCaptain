import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Apiservice } from "../../services/apiservice";
import { CommonModule } from "@angular/common";
import { DialogModule } from "primeng/dialog";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ClientRegister } from "../client-register/client-register";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-completed-deals",
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ConfirmDialogModule,
    ClientRegister,
    FormsModule,
  ],
  templateUrl: "./completed-deals.html",
  styleUrl: "./completed-deals.scss",
})
export class CompletedDeals implements OnInit {
  completedDeals: any[] = [];
  role: number = 0;

  constructor(private api: Apiservice, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getAllCompletedDeals();

    const storedRole = localStorage.getItem("userType");
    if (storedRole) {
      this.role = +storedRole; // نحولها لرقم
    }
  }

  getAllCompletedDeals() {
    this.api.GetAllDelivered().subscribe({
      next: (res: any) => {
        this.completedDeals = (res as any[]).map((item) => ({
          Id: item.Id,
          ClientName: item.Client?.ClientName ?? "-",
          ClientPhone: item.Client?.PhoneNumber ?? "-", // رقم تليفون العميل
          PhoneNumber: item.Client?.PhoneNumber ?? "-",
          RequestedCarModel: item.RequestedCarModel ?? "-",
          IsDelivered: item.IsDelivered ?? false,
          DeliveryDate: item.EditedAt ?? item.AssignedAt ?? null,
          EmployeeName: item.Sales?.FullName ?? "-", // اسم الموظف المسؤول
          Notes: item.Notes ?? "-",
          EmployeePhone: item.Sales?.Phone ?? "-", // رقم الموظف
          // الملاحظات
        }));
        this.cdr.detectChanges();
        console.log("✅ Completed Deals:", this.completedDeals);
      },
      error: (err) => console.error("❌ خطأ في جلب الصفقات المنتهية:", err),
    });
  }

  trackById(index: number, item: any) {
    return item.Id;
  }

  viewDeal(c: any) {}
}
