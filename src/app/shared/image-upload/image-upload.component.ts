import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

export interface ImageFile {
    file: File;
    preview: string;
    name: string;
    size: number;
    type: string;
    uploaded: boolean;
    url: string;
}

@Component({
    selector: 'app-image-upload',
    templateUrl: './image-upload.component.html',
    styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent implements OnInit {
    @Input() maxFiles: number = 10;
    @Input() maxFileSize: number = 5 * 1024 * 1024; // 5MB
    @Input() acceptedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp'];
    @Input() multiple: boolean = true;
    @Input() existingImages: string[] = [];
    @Input() showPreview: boolean = true;
    @Input() allowDragDrop: boolean = true;

    @Output() imagesChange = new EventEmitter<ImageFile[]>();
    @Output() imageRemove = new EventEmitter<{ index: number, image: ImageFile }>();
    @Output() imageReorder = new EventEmitter<{ from: number, to: number }>();

    images: ImageFile[] = [];
    isDragOver = false;
    loading = false;

    ngOnInit(): void {
        // Cargar imágenes existentes si las hay
        if (this.existingImages && this.existingImages.length > 0) {
            this.existingImages.forEach((url, index) => {
                this.images.push({
                    file: null as any,
                    preview: url,
                    name: `Imagen ${index + 1}`,
                    size: 0,
                    type: 'image/jpeg',
                    uploaded: true,
                    url: url
                });
            });
        }
    }

    onFileSelected(event: any): void {
        const files = event.target.files;
        if (files) {
            this.processFiles(Array.from(files));
        }
    }

    onDragOver(event: DragEvent): void {
        if (!this.allowDragDrop) return;

        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = true;
    }

    onDragLeave(event: DragEvent): void {
        if (!this.allowDragDrop) return;

        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
    }

    onDrop(event: DragEvent): void {
        if (!this.allowDragDrop) return;

        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;

        const files = event.dataTransfer && event.dataTransfer.files;
        if (files) {
            this.processFiles(Array.from(files));
        }
    }

    private async processFiles(files: File[]): Promise<void> {
        this.loading = true;

        for (const file of files) {
            if (this.images.length >= this.maxFiles) {
                this.showError(`Máximo ${this.maxFiles} imágenes permitidas`);
                break;
            }

            if (!this.validateFile(file)) {
                continue;
            }

            try {
                const processedFile = await this.processImage(file);
                this.images.push(processedFile);
                this.imagesChange.emit(this.images);
            } catch (error) {
                console.error('Error procesando imagen:', error);
                this.showError(`Error al procesar ${file.name}`);
            }
        }

        this.loading = false;
    }

    private validateFile(file: File): boolean {
        // Validar tipo de archivo
        if (!this.acceptedTypes.includes(file.type)) {
            this.showError(`${file.name}: Tipo de archivo no permitido`);
            return false;
        }

        // Validar tamaño
        if (file.size > this.maxFileSize) {
            this.showError(`${file.name}: El archivo es demasiado grande (máximo ${this.formatFileSize(this.maxFileSize)})`);
            return false;
        }

        return true;
    }

    private async processImage(file: File): Promise<ImageFile> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e: any) => {
                const img = new Image();
                img.onload = () => {
                    // Crear canvas para redimensionar si es necesario
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        reject(new Error('No se pudo obtener el contexto del canvas'));
                        return;
                    }

                    // Calcular nuevas dimensiones (máximo 1200px de ancho)
                    const maxWidth = 1200;
                    let { width, height } = img;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Dibujar imagen redimensionada
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convertir a blob con compresión
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const processedFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now()
                            });

                            const imageFile: ImageFile = {
                                file: processedFile,
                                preview: e.target.result,
                                name: file.name,
                                size: blob.size,
                                type: file.type,
                                uploaded: true,
                                url: e.target.result
                            };

                            resolve(imageFile);
                        } else {
                            reject(new Error('Error al procesar la imagen'));
                        }
                    }, file.type, 0.8); // Compresión al 80%
                };

                img.onerror = () => {
                    reject(new Error('Error al cargar la imagen'));
                };

                img.src = e.target.result;
            };

            reader.onerror = () => {
                reject(new Error('Error al leer el archivo'));
            };

            reader.readAsDataURL(file);
        });
    }

    removeImage(index: number): void {
        const image = this.images[index];
        this.images.splice(index, 1);
        this.imageRemove.emit({ index, image });
        this.imagesChange.emit(this.images);
    }

    reorderImages(fromIndex: number, toIndex: number): void {
        if (fromIndex === toIndex) return;

        const image = this.images[fromIndex];
        this.images.splice(fromIndex, 1);
        this.images.splice(toIndex, 0, image);

        this.imageReorder.emit({ from: fromIndex, to: toIndex });
        this.imagesChange.emit(this.images);
    }

    setMainImage(index: number): void {
        if (index === 0) return; // Ya es la imagen principal

        const image = this.images[index];
        this.images.splice(index, 1);
        this.images.unshift(image);

        this.imageReorder.emit({ from: index, to: 0 });
        this.imagesChange.emit(this.images);
    }

    private formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    private showError(message: string): void {
        // Aquí podrías usar un servicio de notificaciones
        console.error(message);
        alert(message); // Temporal, deberías usar un servicio de notificaciones
    }

    getImages(): ImageFile[] {
        return this.images;
    }

    getMainImage(): ImageFile | null {
        return this.images.length > 0 ? this.images[0] : null;
    }

    clearImages(): void {
        this.images = [];
        this.imagesChange.emit(this.images);
    }

    hasImages(): boolean {
        return this.images.length > 0;
    }

    canAddMore(): boolean {
        return this.images.length < this.maxFiles;
    }

    onImageError(event: any): void {
        event.target.src = 'assets/img/no-image.png';
    }
}
