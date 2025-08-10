import { Component, OnInit } from '@angular/core';
import { User, UserService } from 'src/app/core/services/user.service';
import { Router } from '@angular/router';
import { ModalService } from 'src/app/shared/modal.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filtered: User[] = [];
  search = '';
  loading = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private modal: ModalService
  ) { }

  ngOnInit() {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.userService.getUsers().subscribe(
      (data) => {
        this.users = data || [];
        this.applyFilters();
        this.loading = false;
      },
      () => {
        this.modal.showModal('error', 'Error al cargar usuarios');
        this.loading = false;
      }
    );
  }

  applyFilters(): void {
    const q = this.search.trim().toLowerCase();
    this.filtered = this.users.filter(u =>
      !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  create(): void {
    this.router.navigate(['/dashboard/users/create']);
  }

  edit(u: User): void {
    if (!u.id) return;
    this.router.navigate(['/dashboard/users/edit', u.id]);
  }

  remove(u: User): void {
    if (!u.id) return;
    if (confirm('¿Eliminar este usuario?')) {
      this.userService.deleteUser(u.id).subscribe(
        () => {
          this.modal.showModal('success', 'Usuario eliminado');
          this.load();
        },
        () => this.modal.showModal('error', 'Error al eliminar el usuario')
      );
    }
  }
}
