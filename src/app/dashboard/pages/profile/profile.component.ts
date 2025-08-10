import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/services/user.service';
import { ModalService } from 'src/app/shared/modal.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    form: FormGroup;
    loading = false;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private modal: ModalService
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            email: [{ value: '', disabled: true }],
        });
        this.load();
    }

    load(): void {
        this.loading = true;
        this.userService.getMyProfile().subscribe(
            (me) => {
                this.form.patchValue({ name: me.name, email: me.email });
                this.loading = false;
            },
            () => { this.loading = false; }
        );
    }

    save(): void {
        if (this.form.invalid) {
            Object.values(this.form.controls).forEach(c => c.markAsTouched());
            return;
        }
        this.loading = true;
        this.userService.updateMyProfile({ name: this.form.get('name').value }).subscribe(
            () => {
                this.modal.showModal('success', 'Perfil actualizado');
                this.loading = false;
            },
            () => { this.modal.showModal('error', 'Error al actualizar perfil'); this.loading = false; }
        );
    }
}


