import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "src/app/core/services/api.service";
import { ProductService } from "src/app/core/services/product.service";
import { ModalService } from "src/app/shared/modal.service";

@Component({
  selector: "app-product-form",
  templateUrl: "./product-form.component.html",
  styleUrls: ["./product-form.component.css"],
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  productId: string;
  loading = false;
  selectedFiles: File[] = [];
  imagePreviewUrls: string[] = [];

  categories = [
    'Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros',
    'Juguetes', 'Alimentos', 'Belleza', 'Automotriz', 'Otros'
  ];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.setupRouteListener();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(3)]],
      sku: ["", [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]],
      description: ["", [Validators.required, Validators.minLength(10)]],
      category: ["", Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      discountPrice: [0, [Validators.min(0)]],
      discountPercentage: [0, [Validators.min(0), Validators.max(100)]],
      discountStartDate: [null],
      discountEndDate: [null],
      stock: [0, [Validators.required, Validators.min(0)]],
      minStock: [5, [Validators.min(0)]],
      weight: [0, [Validators.min(0)]],
      dimensions: this.fb.group({
        length: [0, [Validators.min(0)]],
        width: [0, [Validators.min(0)]],
        height: [0, [Validators.min(0)]]
      }),
      tags: [""],
      isActive: [true],
      seoTitle: ["", [Validators.maxLength(60)]],
      seoDescription: ["", [Validators.maxLength(160)]]
    });
    this.setupDiscountValidations();
  }

  private setupDiscountValidations(): void {
    const discountPriceControl = this.productForm.get('discountPrice');
    const discountPercentageControl = this.productForm.get('discountPercentage');
    const priceControl = this.productForm.get('price');

    // Validar que el precio con descuento no sea mayor al precio original
    discountPriceControl.valueChanges.subscribe(value => {
      const price = priceControl.value || 0;
      if (value > price) {
        discountPriceControl.setErrors({ invalidDiscount: true });
      } else {
        discountPriceControl.setErrors(null);
      }
    });

    // Validar fechas de descuento
    this.productForm.get('discountEndDate').valueChanges.subscribe(endDate => {
      const startDate = this.productForm.get('discountStartDate').value;
      if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
        this.productForm.get('discountEndDate').setErrors({ invalidDateRange: true });
      }
    });
  }

  private setupRouteListener(): void {
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.isEditMode = true;
        this.productId = params["id"];
        this.loadProduct();
      }
    });
  }

  loadProduct(): void {
    this.loading = true;
    this.productService.getProductById(this.productId).subscribe(
      (product) => {
        this.productForm.patchValue(product);
        if (product.images) {
          this.imagePreviewUrls = product.images;
        }
        this.loading = false;
      },
      (error) => {
        this.modalService.showModal('error', 'Error al cargar el producto');
        this.loading = false;
        console.error(error);
      }
    );
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (this.validateImageFile(file)) {
          this.selectedFiles.push(file);
          this.createImagePreview(file);
        }
      }
    }
  }

  private validateImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      this.modalService.showModal('error', 'Solo se permiten imágenes JPG, PNG y WebP');
      return false;
    }

    if (file.size > maxSize) {
      this.modalService.showModal('error', 'La imagen no puede superar 5MB');
      return false;
    }

    return true;
  }

  private createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviewUrls.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);
  }

  calculateDiscountPercentage(): void {
    const price = this.productForm.get('price').value || 0;
    const discountPrice = this.productForm.get('discountPrice').value || 0;

    if (price > 0 && discountPrice > 0) {
      const percentage = ((price - discountPrice) / price) * 100;
      this.productForm.patchValue({ discountPercentage: Math.round(percentage) });
    }
  }

  calculateDiscountPrice(): void {
    const price = this.productForm.get('price').value || 0;
    const percentage = this.productForm.get('discountPercentage').value || 0;

    if (price > 0 && percentage > 0) {
      const discountPrice = price - (price * percentage / 100);
      this.productForm.patchValue({ discountPrice: Math.round(discountPrice * 100) / 100 });
    }
  }

  generateSKU(): void {
    const name = this.productForm.get('name').value;
    const category = this.productForm.get('category').value;

    if (name && category) {
      const sku = `${category.substring(0, 3).toUpperCase()}-${name.substring(0, 5).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      this.productForm.patchValue({ sku });
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const productData = this.prepareProductData();

    if (this.isEditMode) {
      this.productService.updateProduct(this.productId, productData).subscribe(
        () => {
          this.modalService.showModal('success', 'Producto actualizado correctamente');
          this.router.navigate(["/dashboard/products"]);
        },
        (error) => {
          this.modalService.showModal('error', 'Error al actualizar el producto');
          this.loading = false;
        }
      );
    } else {
      this.productService.createProduct(productData).subscribe(
        () => {
          this.modalService.showModal('success', 'Producto creado correctamente');
          this.router.navigate(["/dashboard/products"]);
        },
        (error) => {
          this.modalService.showModal('error', 'Error al crear el producto');
          this.loading = false;
        }
      );
    }
  }

  private prepareProductData(): FormData {
    const formData = new FormData();
    const formValue = this.productForm.value;

    // Agregar campos del formulario
    Object.keys(formValue).forEach(key => {
      if (key === 'dimensions') {
        formData.append(key, JSON.stringify(formValue[key]));
      } else if (key === 'tags') {
        const tags = formValue[key].split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
        formData.append(key, JSON.stringify(tags));
      } else {
        formData.append(key, formValue[key]);
      }
    });

    // Agregar imágenes
    this.selectedFiles.forEach((file, index) => {
      formData.append(`images`, file);
    });

    return formData;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.productForm.get(controlName);
    if (control.errors && control.touched) {
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
      if (control.errors['min']) return `El valor mínimo es ${control.errors['min'].min}`;
      if (control.errors['max']) return `El valor máximo es ${control.errors['max'].max}`;
      if (control.errors['pattern']) return 'Formato inválido';
      if (control.errors['invalidDiscount']) return 'El precio con descuento no puede ser mayor al precio original';
      if (control.errors['invalidDateRange']) return 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    return '';
  }

  goBack(): void {
    this.router.navigate(['/dashboard/products']);
  }
}
