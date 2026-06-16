import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  credentials: LoginRequest = {
    employeeId: '',
    password: ''
  };

  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate([this.authService.getDefaultRoute()]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Invalid email or password';
        this.cdr.detectChanges();
      }
    });
  }

}
