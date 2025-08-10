import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Discount {
    id: string;
    type: 'percentage' | 'fixed' | 'category' | 'coupon';
    value: number;
    startDate: Date | undefined;
    endDate: Date | undefined;
    category: string | undefined;
    couponCode: string | undefined;
    isActive: boolean;
    description: string | undefined;
    minPurchase: number | undefined;
    maxDiscount: number | undefined;
    usageLimit: number | undefined;
    usedCount: number;
}

export interface ProductDiscount {
    productId: string;
    originalPrice: number;
    discountPrice: number;
    discountPercentage: number;
    discountAmount: number;
    isActive: boolean;
    startDate: Date | undefined;
    endDate: Date | undefined;
}

@Injectable({
    providedIn: 'root'
})
export class DiscountService {

    private discounts: Discount[] = [
        {
            id: '1',
            type: 'percentage',
            value: 15,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            category: undefined,
            couponCode: undefined,
            isActive: true,
            description: 'Descuento general del 15%',
            minPurchase: 50,
            maxDiscount: 100,
            usageLimit: 1000,
            usedCount: 0
        },
        {
            id: '2',
            type: 'category',
            value: 20,
            category: 'Electrónicos',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-06-30'),
            couponCode: undefined,
            isActive: true,
            description: 'Descuento del 20% en electrónicos',
            minPurchase: 100,
            maxDiscount: 200,
            usageLimit: 500,
            usedCount: 0
        },
        {
            id: '3',
            type: 'coupon',
            value: 10,
            couponCode: 'WELCOME10',
            startDate: undefined,
            endDate: undefined,
            category: undefined,
            isActive: true,
            description: 'Cupón de bienvenida 10%',
            minPurchase: 25,
            maxDiscount: 50,
            usageLimit: 100,
            usedCount: 0
        }
    ];

    constructor() { }

    // Obtener todos los descuentos
    getDiscounts(): Observable<Discount[]> {
        return of(this.discounts.filter(d => d.isActive));
    }

    // Obtener descuento por ID
    getDiscountById(id: string): Observable<Discount | null> {
        const discount = this.discounts.find(d => d.id === id);
        return of(discount || null);
    }

    // Crear nuevo descuento
    createDiscount(discount: Omit<Discount, 'id' | 'usedCount'>): Observable<Discount> {
        const newDiscount: Discount = {
            ...discount,
            id: this.generateId(),
            usedCount: 0
        };
        this.discounts.push(newDiscount);
        return of(newDiscount);
    }

    // Actualizar descuento
    updateDiscount(id: string, updates: Partial<Discount>): Observable<Discount | null> {
        const index = this.discounts.findIndex(d => d.id === id);
        if (index !== -1) {
            this.discounts[index] = { ...this.discounts[index], ...updates };
            return of(this.discounts[index]);
        }
        return of(null);
    }

    // Eliminar descuento
    deleteDiscount(id: string): Observable<boolean> {
        const index = this.discounts.findIndex(d => d.id === id);
        if (index !== -1) {
            this.discounts.splice(index, 1);
            return of(true);
        }
        return of(false);
    }

    // Calcular descuento para un producto
    calculateProductDiscount(
        product: any,
        couponCode?: string
    ): ProductDiscount {
        const now = new Date();
        let bestDiscount: ProductDiscount = {
            productId: product.id,
            originalPrice: product.price,
            discountPrice: product.price,
            discountPercentage: 0,
            discountAmount: 0,
            isActive: false,
            startDate: undefined,
            endDate: undefined
        };

        // Aplicar descuento directo del producto si existe
        if (product.discountPrice && product.discountPrice < product.price) {
            const discountAmount = product.price - product.discountPrice;
            const discountPercentage = (discountAmount / product.price) * 100;

            bestDiscount = {
                productId: product.id,
                originalPrice: product.price,
                discountPrice: product.discountPrice,
                discountPercentage: Math.round(discountPercentage * 100) / 100,
                discountAmount: discountAmount,
                isActive: this.isDiscountActive(product.discountStartDate, product.discountEndDate),
                startDate: product.discountStartDate,
                endDate: product.discountEndDate
            };
        }

        // Verificar descuentos por categoría
        const categoryDiscount = this.discounts.find(d =>
            d.type === 'category' &&
            d.category === product.category &&
            d.isActive &&
            this.isDiscountActive(d.startDate, d.endDate)
        );

        if (categoryDiscount) {
            const discountAmount = (product.price * categoryDiscount.value) / 100;
            const finalDiscountAmount = Math.min(discountAmount, categoryDiscount.maxDiscount || discountAmount);
            const discountPrice = product.price - finalDiscountAmount;
            const discountPercentage = (finalDiscountAmount / product.price) * 100;

            if (discountPrice < bestDiscount.discountPrice) {
                bestDiscount = {
                    productId: product.id,
                    originalPrice: product.price,
                    discountPrice: discountPrice,
                    discountPercentage: Math.round(discountPercentage * 100) / 100,
                    discountAmount: finalDiscountAmount,
                    isActive: true,
                    startDate: categoryDiscount.startDate,
                    endDate: categoryDiscount.endDate
                };
            }
        }

        // Verificar cupones
        if (couponCode) {
            const couponDiscount = this.discounts.find(d =>
                d.type === 'coupon' &&
                d.couponCode === couponCode.toUpperCase() &&
                d.isActive &&
                this.isDiscountActive(d.startDate, d.endDate) &&
                d.usedCount < (d.usageLimit || Infinity)
            );

            if (couponDiscount && product.price >= (couponDiscount.minPurchase || 0)) {
                const discountAmount = (product.price * couponDiscount.value) / 100;
                const finalDiscountAmount = Math.min(discountAmount, couponDiscount.maxDiscount || discountAmount);
                const discountPrice = product.price - finalDiscountAmount;
                const discountPercentage = (finalDiscountAmount / product.price) * 100;

                if (discountPrice < bestDiscount.discountPrice) {
                    bestDiscount = {
                        productId: product.id,
                        originalPrice: product.price,
                        discountPrice: discountPrice,
                        discountPercentage: Math.round(discountPercentage * 100) / 100,
                        discountAmount: finalDiscountAmount,
                        isActive: true,
                        startDate: couponDiscount.startDate,
                        endDate: couponDiscount.endDate
                    };
                }
            }
        }

        return bestDiscount;
    }

    // Validar cupón
    validateCoupon(couponCode: string, totalAmount: number): Observable<{ valid: boolean; discount?: Discount; message?: string }> {
        const coupon = this.discounts.find(d =>
            d.type === 'coupon' &&
            d.couponCode === couponCode.toUpperCase()
        );

        if (!coupon) {
            return of({ valid: false, message: 'Cupón no válido' });
        }

        if (!coupon.isActive) {
            return of({ valid: false, message: 'Cupón inactivo' });
        }

        if (coupon.usedCount >= (coupon.usageLimit || Infinity)) {
            return of({ valid: false, message: 'Cupón agotado' });
        }

        if (coupon.startDate && new Date() < coupon.startDate) {
            return of({ valid: false, message: 'Cupón aún no válido' });
        }

        if (coupon.endDate && new Date() > coupon.endDate) {
            return of({ valid: false, message: 'Cupón expirado' });
        }

        if (coupon.minPurchase && totalAmount < coupon.minPurchase) {
            return of({
                valid: false,
                message: `Compra mínima de ${coupon.minPurchase} requerida`
            });
        }

        return of({ valid: true, discount: coupon });
    }

    // Aplicar cupón (incrementar contador de uso)
    applyCoupon(couponCode: string): Observable<boolean> {
        const coupon = this.discounts.find(d =>
            d.type === 'coupon' &&
            d.couponCode === couponCode.toUpperCase()
        );

        if (coupon && coupon.usedCount < (coupon.usageLimit || Infinity)) {
            coupon.usedCount++;
            return of(true);
        }

        return of(false);
    }

    // Obtener descuentos por categoría
    getDiscountsByCategory(category: string): Observable<Discount[]> {
        const categoryDiscounts = this.discounts.filter(d =>
            d.type === 'category' &&
            d.category === category &&
            d.isActive &&
            this.isDiscountActive(d.startDate, d.endDate)
        );
        return of(categoryDiscounts);
    }

    // Obtener descuentos activos
    getActiveDiscounts(): Observable<Discount[]> {
        const activeDiscounts = this.discounts.filter(d =>
            d.isActive &&
            this.isDiscountActive(d.startDate, d.endDate)
        );
        return of(activeDiscounts);
    }

    // Verificar si un descuento está activo
    private isDiscountActive(startDate?: Date, endDate?: Date): boolean {
        const now = new Date();

        if (startDate && now < startDate) {
            return false;
        }

        if (endDate && now > endDate) {
            return false;
        }

        return true;
    }

    // Generar ID único
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Calcular descuento por porcentaje
    calculatePercentageDiscount(price: number, percentage: number, maxDiscount?: number): number {
        const discountAmount = (price * percentage) / 100;
        return maxDiscount ? Math.min(discountAmount, maxDiscount) : discountAmount;
    }

    // Calcular descuento fijo
    calculateFixedDiscount(price: number, fixedAmount: number): number {
        return Math.min(fixedAmount, price);
    }

    // Formatear precio con descuento
    formatDiscountedPrice(originalPrice: number, discountPrice: number): string {
        return discountPrice.toFixed(2);
    }

    // Obtener estadísticas de descuentos
    getDiscountStats(): Observable<{
        totalDiscounts: number;
        activeDiscounts: number;
        totalUsage: number;
        categoryDiscounts: number;
        couponDiscounts: number;
    }> {
        const stats = {
            totalDiscounts: this.discounts.length,
            activeDiscounts: this.discounts.filter(d => d.isActive).length,
            totalUsage: this.discounts.reduce((sum, d) => sum + d.usedCount, 0),
            categoryDiscounts: this.discounts.filter(d => d.type === 'category').length,
            couponDiscounts: this.discounts.filter(d => d.type === 'coupon').length
        };
        return of(stats);
    }
}
