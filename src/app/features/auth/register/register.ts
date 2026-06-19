import { Component, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {

  formData: RegisterRequest = {
    name: '',
    email: '',
    password: '',
    employeeId: '',
    department: '',
    role: 'EMPLOYEE'
  };

  errorMessage = signal('');
  successMessage = signal('');
  isLoading = signal(false);
  hasSubmitted = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(form: NgForm): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.hasSubmitted.set(true);

    if (form.invalid) {
      this.errorMessage.set(this.getFormErrorMessage(form));
      this.cdr.detectChanges();
      return;
    }

    const request: RegisterRequest = {
      ...this.formData,
      name: this.formData.name.trim(),
      email: this.formData.email.trim().toLowerCase(),
      employeeId: this.formData.employeeId.trim(),
      department: this.formData.department?.trim() || '',
      password: this.formData.password.trim()
    };

    this.isLoading.set(true);
    this.cdr.detectChanges();

    this.authService.register(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Account created successfully!');
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.error || err.error?.message || 'Registration failed. Please try again.'
        );
        this.cdr.detectChanges();
      }
    });
  }

  showFieldError(form: NgForm, fieldName: string): boolean {
    const control = form.controls[fieldName];
    return !!control && control.invalid && (control.touched || this.hasSubmitted());
  }

  private getFormErrorMessage(form: NgForm): string {
    const controls = form.controls;

    if (controls['name']?.errors?.['required']) {
      return 'Full name is required.';
    }

    if (controls['email']?.errors?.['required']) {
      return 'Email is required.';
    }

    if (controls['email']?.errors?.['email']) {
      return 'Enter a valid email address.';
    }

    if (controls['password']?.errors?.['required']) {
      return 'Password is required.';
    }

    if (controls['password']?.errors?.['minlength']) {
      return 'Password must be at least 8 characters.';
    }

    if (controls['employeeId']?.errors?.['required']) {
      return 'Employee ID is required.';
    }

    return 'Please fix the highlighted fields.';
  }
}
