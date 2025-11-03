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
  importTypes = [
    { id: 1, name: "مبادرة", img: "/photos/export.jpg" },
    { id: 2, name: "إستيراد شخصى", img: "/photos/export.jpg" },
  ];
  importedCars: any[] = [];
  filteredImportedCars: any[] = [];
  selectedImportType: number | null = null;
  cars: any[] = [];
  selectedBrandId: number | null = null;
  filteredBrands: any[] = [];
  filteredCountries: any[] = [];
  selectedContainer: "stock" | "import" | null = null;

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
    this.loadCars();
  }

  loadCars() {
    this.api.getAllCars().subscribe({
      next: (data: any[]) => {
        this.cars = data;
        this.importedCars = data.filter((c) => c.InstantDelivery === true);
      },
      error: (err) => console.error(err),
    });
  }

  selectContainer(container: "stock" | "import", importType?: number) {
    this.selectedContainer = container;
    this.selectedImportType = importType || null;
    this.selectedCountryId = null;
    this.selectedBrandId = null;
    this.filteredCountries = [];
    this.filteredBrands = [];
  }

  loadCountries() {
    this.api.getAllCountry().subscribe({
      next: (res: Country[]) => {
        this.countries = res;
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

  onSelectImportType(typeId: number) {
    this.selectedImportType = typeId;
    this.selectedCountryId = null;
    this.selectedBrandId = null;

    const filtered = this.importedCars.filter(
      (c) => c.InitiativeType === typeId
    );

    // الدول المتاحة لهذا النوع
    const uniqueCountries = filtered
      .map((c) => c.Brand?.Country)
      .filter(
        (country, i, arr) =>
          country && arr.findIndex((x) => x?.Id === country.Id) === i
      );

    this.filteredCountries = uniqueCountries;
  }

  // عند اختيار دولة
  selectImportCountry(country: any) {
    this.selectedCountryId = country.Id;
    this.selectedBrandId = null;

    this.filteredBrands = this.importedCars
      .filter(
        (c) =>
          c.InitiativeType === this.selectedImportType &&
          c.Brand?.Country?.Id === country.Id
      )
      .map((c) => c.Brand)
      .filter((b, i, arr) => arr.findIndex((x) => x?.Id === b.Id) === i);
  }
  // عند اختيار البراند
  selectImportBrand(brand: any) {
    this.selectedBrandId = brand.Id;

    this.router.navigate(["/cars"], {
      queryParams: {
        InstantDelivery: true, // دائمًا استيراد
        importType: this.selectedImportType, // 1 = مبادرة أو 2 = استيراد شخصي
        countryId: this.selectedCountryId,
        brandId: this.selectedBrandId,
      },
    });
  }

  showContainer(type: string) {
    this.activeContainer = type;
  }

  selectCountry(country: any) {
    this.selectedCountryId = country.id;
    this.selectedBrandId = null;

    this.api.getBrandByCountryId(country.id).subscribe({
      next: (res: any[]) => (this.brands = res),
    });
  }

  selectBrand(brand: any) {
    const container = this.selectedContainer || "stock";

    // تحديد حالة العربيات حسب المخزن أو الاستيراد
    const instantDelivery = container === "stock" ? false : true;
    const importType = instantDelivery ? this.selectedImportType : null;

    // فلترة العربيات حسب الخيارات المحددة قبل التوجيه (اختياري إذا حاب تعرض قبل التوجيه)
    let filteredCars = this.cars.filter(
      (c) => c.InstantDelivery === instantDelivery
    );

    if (instantDelivery && importType) {
      filteredCars = filteredCars.filter(
        (c) => c.InitiativeType === importType
      );
    }

    if (this.selectedCountryId) {
      filteredCars = filteredCars.filter(
        (c) => c.Brand?.CountryId === this.selectedCountryId
      );
    }

    if (brand?.Id) {
      filteredCars = filteredCars.filter((c) => c.Brand?.Id === brand.Id);
    }

    // إرسال البيانات للكمونت العربيات عبر الراوتر
    this.router.navigate(["/cars"], {
      queryParams: {
        InstantDelivery: instantDelivery, // true = استيراد، false = مخزن
        importType: importType, // 1 = مبادرة أو 2 = استيراد شخصي
        countryId: this.selectedCountryId,
        brandId: brand?.Id,
      },
    });
  }
}
