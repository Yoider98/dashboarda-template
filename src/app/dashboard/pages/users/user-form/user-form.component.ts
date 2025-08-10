import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User, UserService } from 'src/app/core/services/user.service';
import { ModalService } from 'src/app/shared/modal.service';

@Component({
    selector: 'app-user-form',
    templateUrl: './user-form.component.html',
    styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
    form: FormGroup;
    isEdit = false;
    id: string;
    loading = false;

    roles = [
        { value: 'admin', label: 'Administrador' },
        { value: 'editor', label: 'Editor' },
        { value: 'viewer', label: 'Lector' }
    ];

    constructor(
        private fb: FormBuilder,
        private service: UserService,
        private router: Router,
        private route: ActivatedRoute,
        private modal: ModalService
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            role: ['viewer', Validators.required],
            isActive: [true]
        });

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEdit = true;
                this.id = params['id'];
                this.load();
            }
        });
    }

    load(): void {
        this.loading = true;
        this.service.getUserById(this.id).subscribe(
            (u) => {
                this.form.patchValue(u);
                this.loading = false;
            },
            () => {
                this.modal.showModal('error', 'Error al cargar el usuario');
                this.loading = false;
            }
        );
    }

    save(): void {
        if (this.form.invalid) {
            Object.values(this.form.controls).forEach(c => c.markAsTouched());
            return;
        }
        this.loading = true;
        const data: User = this.form.value;
        const req = this.isEdit ? this.service.updateUser(this.id, data) : this.service.createUser(data);
        req.subscribe(
            () => {
                this.modal.showModal('success', this.isEdit ? 'Usuario actualizado' : 'Usuario creado');
                this.router.navigate(['/dashboard/users']);
            },
            () => {
                this.modal.showModal('error', 'Error al guardar el usuario');
                this.loading = false;
            }
        );
    }

    cancel(): void {
        this.router.navigate(['/dashboard/users']);
    }
}


