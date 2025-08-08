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

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ["", Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: [""],
    });

    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.isEditMode = true;
        this.productId = params["id"];
        //this.loadProduct();
      }
    });
  }

  // loadProduct(): void {
  //   this.api.post("login", this.productForm);
  //   this.api.post("products", this.productForm).subscribe(
  //     (response) => {
  //       if (response && response) {
  //         this.router.navigate(["/products"]);
  //       } else if (response && response.error) {
  //         this.modalService.showModal('success', 'La operación fue exitosa');
  //       }
  //     },
  //     (error) => {
  //       this.loading = false;
  //       this.showError(
  //         error.error.error.message || "Error de inicio de sesión"
  //       );
  //       console.error(error);
  //     }
  //   );
  // }

  onSubmit(): void {
    if (this.productForm.invalid) return;

    const productData = this.productForm.value;

    if (this.isEditMode) {
      this.productService
        .updateProduct(this.productId, productData)
        .subscribe(() => {
          this.router.navigate(["/dashboard/products"]);
        });
    } else {
      this.productService.createProduct(productData).subscribe(() => {
        this.router.navigate(["/dashboard/products"]);
      });
    }
  }
}
