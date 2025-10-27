import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Nav } from "../../shared/nav/nav";
import { MessageService } from "primeng/api";
import { Apiservice, Country } from "../../services/apiservice";
import { Router } from "@angular/router";

@Component({
  selector: "app-home",
  imports: [CommonModule, FormsModule, Nav],
  templateUrl: "./home.html",
  styleUrl: "./home.scss",
})
export class Home {
  activeContainer: string | null = null;
  countries: Country[] = [];
  countryMap: { [key: number]: string } = {};
  selectedCountryId: number | null = null;
  brands: any[] = [];
  constructor(
    private api: Apiservice,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCountries(); // جلب البيانات عند بداية الكمبوننت
    // this.loadBrands();
    // this.loadBranchs();
  }

  loadCountries() {
    this.api.getAllCountry().subscribe({
      next: (res: Country[]) => {
        this.countries = res;
        console.log("الدول المحملة:", this.countries);
        this.countryMap = {};
        for (const c of this.countries) {
          if (c.id != null) this.countryMap[c.id] = c.name;
        }
      },
      error: (err) => {
        console.error("خطأ جلب الدول:", err);
      },
    });
  }

  showContainer(type: string) {
    this.activeContainer = type;
  }

  selectCountry(country: any) {
    if (this.selectedCountryId === country.id) {
      // ✅ لو ضغط على نفس الدولة تانى → يلغى الاختيار
      this.selectedCountryId = null;
      this.brands = [];
      return;
    }

    this.selectedCountryId = country.id;

    // 📡 جلب البراندات حسب الدولة
    this.api.getBrandByCountryId(country.id).subscribe({
      next: (res: any[]) => {
        this.brands = res;
      },
      error: (err) => {
        console.error("❌ خطأ في جلب البراندات:", err);
      },
    });
  }

  selectBrand(brand: any) {
    console.log("تم اختيار البراند:", brand);
    // 📡 جلب السيارات حسب البراند
    this.api.getCarsInBrands(brand.Id).subscribe(
      (res: any) => {
        this.router.navigate(["/cars"], {
          queryParams: {
            countryId: this.selectedCountryId,
            brandId: brand.Id,
          },
        });
      },
      (err) => {
        console.error("❌ خطأ في جلب السيارات:", err);
      }
    );
  }
}
