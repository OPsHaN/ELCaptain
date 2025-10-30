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
    this.filteredImportedCars = [];
    this.filteredBrands = [];

    // الدول اللي فيها سيارات من نفس النوع
    const filtered = this.importedCars.filter(
      (c) => c.InitiativeType === typeId
    );

    const uniqueCountries = filtered
      .map((c) => c.Country)
      .filter(
        (country, i, arr) =>
          country && arr.findIndex((x) => x.Id === country.Id) === i
      );

    this.filteredCountries = uniqueCountries;
  }
  // اختيار البراند
  selectImportBrand(brand: any) {
    this.selectedBrandId = brand.Id;

    this.filteredImportedCars = this.importedCars.filter(
      (c) =>
        c.Brand?.Id === brand.Id &&
        c.InitiativeType === this.selectedImportType &&
        c.Country?.Id === this.selectedCountryId
    );
  }

   selectImportCountry(country: any) {
    this.selectedCountryId = country.Id;
    this.selectedBrandId = null;
    this.filteredImportedCars = [];

    const filtered = this.importedCars.filter(
      (c) =>
        c.InitiativeType === this.selectedImportType &&
        c.Country?.Id === country.Id
    );
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
    this.router.navigate(["/cars"], {
      queryParams: {
        countryId: this.selectedCountryId,
        brandId: brand.Id,
      },
    });
  }

  selectCar(im: any) {
    console.log(im);
  }
}
