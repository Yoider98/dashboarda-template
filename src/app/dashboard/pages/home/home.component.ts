import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-dashboard-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    stats = [
        { label: 'Productos', icon: 'fas fa-boxes', value: 0 },
        { label: 'Usuarios', icon: 'fas fa-users', value: 0 },
        { label: 'Perfiles', icon: 'fas fa-id-badge', value: 0 },
    ];

    constructor() { }

    ngOnInit(): void { }
}


