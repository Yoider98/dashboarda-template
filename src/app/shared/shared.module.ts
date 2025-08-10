import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { ModalMessageComponent } from './modal-message/modal-message.component';
import { ReplacePipe } from './pipes/replace.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';

@NgModule({
    declarations: [
        ImageUploadComponent,
        ModalMessageComponent,
        ReplacePipe,
        FileSizePipe
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        ImageUploadComponent,
        ModalMessageComponent,
        ReplacePipe,
        FileSizePipe,
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class SharedModule { }
