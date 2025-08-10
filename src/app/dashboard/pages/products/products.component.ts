import { Component, OnInit } from "@angular/core";
import { ProductService } from "src/app/core/services/product.service";
import { ModalService } from "src/app/shared/modal.service";

@Component({
  selector: "app-products",
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.css"],
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  loading = false;

  // Filtros y búsqueda
  searchTerm = "";
  selectedCategory = "";
  selectedStatus = "";
  sortBy = "name";
  sortDirection = "asc";

  // Paginación
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;

  // Categorías
  categories = [
    'Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros',
    'Juguetes', 'Alimentos', 'Belleza', 'Automotriz', 'Otros'
  ];

  constructor(
    private productService: ProductService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe(
      (products) => {
        this.products = products;
        this.applyFilters();
        this.loading = false;
      },
      (error) => {
        this.modalService.showModal('error', 'Error al cargar los productos');
        this.loading = false;
        console.error(error);
      }
    );
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }


  applyFilters(): void {
    let filtered = [...this.products];

    // Filtro por búsqueda
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        (product.name && product.name.toLowerCase().includes(search)) ||
        (product.sku && product.sku.toLowerCase().includes(search)) ||
        (product.description && product.description.toLowerCase().includes(search))
      );
    }

    // Filtro por categoría
    if (this.selectedCategory) {
      filtered = filtered.filter(product => product.category === this.selectedCategory);
    }

    // Filtro por estado
    if (this.selectedStatus !== "") {
      const isActive = this.selectedStatus === "true";
      filtered = filtered.filter(product => product.isActive === isActive);
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue = a[this.sortBy];
      let bValue = b[this.sortBy];

      if (this.sortBy === "price") {
        aValue = a.discountPrice || a.price;
        bValue = b.discountPrice || b.price;
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return this.sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

    this.filteredProducts = filtered;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }

  getPaginatedProducts(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getStockClass(stock: number, minStock: number): string {
    if (stock <= 0) return "text-danger";
    if (stock <= minStock) return "text-warning";
    return "text-success";
  }

  onImageError(event: any): void {
    event.target.src = 'assets/img/no-image.png';
  }

  viewProduct(product: any): void {
    this.modalService.showModal('success', `Vista previa de: ${product.name}`);
  }

  deleteProduct(productId: string): void {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      this.productService.deleteProduct(productId).subscribe(
        () => {
          this.modalService.showModal('success', 'Producto eliminado correctamente');
          this.loadProducts();
        },
        (error) => {
          this.modalService.showModal('error', 'Error al eliminar el producto');
          console.error(error);
        }
      );
    }
  }
}
