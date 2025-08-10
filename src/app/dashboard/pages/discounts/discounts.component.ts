import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DiscountService, Discount } from 'src/app/core/services/discount.service';
import { ModalService } from 'src/app/shared/modal.service';

@Component({
    selector: 'app-discounts',
    templateUrl: './discounts.component.html',
    styleUrls: ['./discounts.component.css']
})
export class DiscountsComponent implements OnInit {
    discounts: Discount[] = [];
    loading = false;
    showForm = false;
    editingDiscount: Discount | null = null;

    discountForm: FormGroup;

    categories = [
        'Electrónicos',
        'Ropa',
        'Hogar',
        'Deportes',
        'Libros',
        'Juguetes',
        'Alimentos',
        'Belleza',
        'Automotriz',
        'Otros'
    ];

    discountTypes = [
        { value: 'percentage', label: 'Porcentaje (%)' },
        { value: 'fixed', label: 'Cantidad fija ($)' },
        { value: 'category', label: 'Por categoría' },
        { value: 'coupon', label: 'Cupón' }
    ];

    stats = {
        totalDiscounts: 0,
        activeDiscounts: 0,
        totalUsage: 0,
        categoryDiscounts: 0,
        couponDiscounts: 0
    };

    constructor(
        private discountService: DiscountService,
        private modalService: ModalService,
        private fb: FormBuilder
    ) {
        this.discountForm = this.fb.group({
            type: ['', Validators.required],
            value: [0, [Validators.required, Validators.min(0)]],
            description: ['', Validators.required],
            startDate: [null],
            endDate: [null],
            category: [''],
            couponCode: [''],
            isActive: [true],
            minPurchase: [0, [Validators.min(0)]],
            maxDiscount: [0, [Validators.min(0)]],
            usageLimit: [0, [Validators.min(0)]]
        });

        this.setupFormValidation();
    }

    ngOnInit(): void {
        this.loadDiscounts();
        this.loadStats();
    }

    private setupFormValidation(): void {
        // Validaciones específicas por tipo de descuento
        this.discountForm.get('type').valueChanges.subscribe(type => {
            const categoryControl = this.discountForm.get('category');
            const couponCodeControl = this.discountForm.get('couponCode');
            const valueControl = this.discountForm.get('value');

            // Limpiar validaciones
            if (categoryControl) categoryControl.clearValidators();
            if (couponCodeControl) couponCodeControl.clearValidators();

            // Aplicar validaciones según el tipo
            if (type === 'category') {
                if (categoryControl) categoryControl.setValidators([Validators.required]);
                if (valueControl) valueControl.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
            } else if (type === 'coupon') {
                if (couponCodeControl) couponCodeControl.setValidators([Validators.required, Validators.pattern(/^[A-Z0-9]+$/)]);
                if (valueControl) valueControl.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
            } else if (type === 'percentage') {
                if (valueControl) valueControl.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
            } else if (type === 'fixed') {
                if (valueControl) valueControl.setValidators([Validators.required, Validators.min(0)]);
            }

            if (categoryControl) categoryControl.updateValueAndValidity();
            if (couponCodeControl) couponCodeControl.updateValueAndValidity();
            if (valueControl) valueControl.updateValueAndValidity();
        });

        // Validación de fechas
        this.discountForm.get('endDate').valueChanges.subscribe(endDate => {
            const startDate = this.discountForm.get('startDate').value;
            if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
                const endDateControl = this.discountForm.get('endDate');
                if (endDateControl) endDateControl.setErrors({ invalidDateRange: true });
            }
        });
    }

    loadDiscounts(): void {
        this.loading = true;
        this.discountService.getDiscounts().subscribe(
            discounts => {
                this.discounts = discounts;
                this.loading = false;
            },
            error => {
                this.modalService.showModal('error', 'Error al cargar los descuentos');
                this.loading = false;
                console.error(error);
            }
        );
    }

    loadStats(): void {
        this.discountService.getDiscountStats().subscribe(stats => {
            this.stats = stats;
        });
    }

    showCreateForm(): void {
        this.editingDiscount = null;
        this.discountForm.reset({
            type: '',
            value: 0,
            description: '',
            startDate: null,
            endDate: null,
            category: '',
            couponCode: '',
            isActive: true,
            minPurchase: 0,
            maxDiscount: 0,
            usageLimit: 0
        });
        this.showForm = true;
    }

    showEditForm(discount: Discount): void {
        this.editingDiscount = discount;
        this.discountForm.patchValue({
            type: discount.type,
            value: discount.value,
            description: discount.description || '',
            startDate: discount.startDate ? new Date(discount.startDate).toISOString().split('T')[0] : null,
            endDate: discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : null,
            category: discount.category || '',
            couponCode: discount.couponCode || '',
            isActive: discount.isActive,
            minPurchase: discount.minPurchase || 0,
            maxDiscount: discount.maxDiscount || 0,
            usageLimit: discount.usageLimit || 0
        });
        this.showForm = true;
    }

    onSubmit(): void {
        if (this.discountForm.invalid) {
            this.markFormGroupTouched();
            return;
        }

        const formValue = this.discountForm.value;
        const discountData = {
            ...formValue,
            startDate: formValue.startDate ? new Date(formValue.startDate) : undefined,
            endDate: formValue.endDate ? new Date(formValue.endDate) : undefined
        };

        if (this.editingDiscount) {
            this.discountService.updateDiscount(this.editingDiscount.id, discountData).subscribe(
                () => {
                    this.modalService.showModal('success', 'Descuento actualizado correctamente');
                    this.loadDiscounts();
                    this.loadStats();
                    this.closeForm();
                },
                error => {
                    this.modalService.showModal('error', 'Error al actualizar el descuento');
                    console.error(error);
                }
            );
        } else {
            this.discountService.createDiscount(discountData).subscribe(
                () => {
                    this.modalService.showModal('success', 'Descuento creado correctamente');
                    this.loadDiscounts();
                    this.loadStats();
                    this.closeForm();
                },
                error => {
                    this.modalService.showModal('error', 'Error al crear el descuento');
                    console.error(error);
                }
            );
        }
    }

    deleteDiscount(discount: Discount): void {
        if (confirm(`¿Estás seguro de que quieres eliminar el descuento "${discount.description}"?`)) {
            this.discountService.deleteDiscount(discount.id).subscribe(
                () => {
                    this.modalService.showModal('success', 'Descuento eliminado correctamente');
                    this.loadDiscounts();
                    this.loadStats();
                },
                error => {
                    this.modalService.showModal('error', 'Error al eliminar el descuento');
                    console.error(error);
                }
            );
        }
    }

    toggleDiscountStatus(discount: Discount): void {
        this.discountService.updateDiscount(discount.id, { isActive: !discount.isActive }).subscribe(
            () => {
                this.modalService.showModal('success', `Descuento ${discount.isActive ? 'desactivado' : 'activado'} correctamente`);
                this.loadDiscounts();
                this.loadStats();
            },
            error => {
                this.modalService.showModal('error', 'Error al cambiar el estado del descuento');
                console.error(error);
            }
        );
    }

    closeForm(): void {
        this.showForm = false;
        this.editingDiscount = null;
        this.discountForm.reset();
    }

    private markFormGroupTouched(): void {
        Object.keys(this.discountForm.controls).forEach(key => {
            const control = this.discountForm.get(key);
            if (control) control.markAsTouched();
        });
    }

    getErrorMessage(controlName: string): string {
        const control = this.discountForm.get(controlName);
        if (control && control.errors && control.touched) {
            if (control.errors['required']) return 'Este campo es requerido';
            if (control.errors['min']) return `El valor mínimo es ${control.errors['min'].min}`;
            if (control.errors['max']) return `El valor máximo es ${control.errors['max'].max}`;
            if (control.errors['pattern']) return 'Formato inválido';
            if (control.errors['invalidDateRange']) return 'La fecha de fin debe ser posterior a la fecha de inicio';
        }
        return '';
    }

    getDiscountTypeLabel(type: string): string {
        const discountType = this.discountTypes.find(dt => dt.value === type);
        return discountType ? discountType.label : type;
    }

    isDiscountActive(discount: Discount): boolean {
        const now = new Date();

        if (discount.startDate && now < new Date(discount.startDate)) {
            return false;
        }

        if (discount.endDate && now > new Date(discount.endDate)) {
            return false;
        }

        return discount.isActive;
    }

    getDiscountStatusClass(discount: Discount): string {
        if (!discount.isActive) return 'badge bg-secondary';
        if (!this.isDiscountActive(discount)) return 'badge bg-warning';
        return 'badge bg-success';
    }

    getDiscountStatusText(discount: Discount): string {
        if (!discount.isActive) return 'Inactivo';
        if (!this.isDiscountActive(discount)) return 'Expirado';
        return 'Activo';
    }

    formatDate(date: Date | string | undefined): string {
        if (!date) return 'Sin fecha';
        return new Date(date).toLocaleDateString('es-ES');
    }

    getUsagePercentage(discount: Discount): number {
        if (!discount.usageLimit) return 0;
        return Math.round((discount.usedCount / discount.usageLimit) * 100);
    }

    getUsageClass(discount: Discount): string {
        const percentage = this.getUsagePercentage(discount);
        if (percentage >= 90) return 'text-danger';
        if (percentage >= 75) return 'text-warning';
        return 'text-success';
    }
}
