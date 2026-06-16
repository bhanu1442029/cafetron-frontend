import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { QRValidationResponse } from "../order-qr.models";
import { OrderQRService } from "../order-qr.service";
import { FormsModule } from "@angular/forms";

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule],
    selector: 'order-qr-upload',
    templateUrl: './order-qr-upload.component.html',
    styleUrl: './order-qr-upload.component.css'
})
export class OrderQRUploadComponent {

    @Output()
    uploadCompleted = new EventEmitter<QRValidationResponse>();

    selectedFile: File | null = null;
    isUploading: boolean = false;

    constructor(
        private orderQRService: OrderQRService
    ) {}

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if ( input.files && input.files.length > 0 ) {
            this.selectedFile = input.files[0];
        }
    }

    onUpload(): void {
        if ( !this.selectedFile ) {
            return;
        }

        const formData = new FormData();
        formData.append("qr", this.selectedFile, this.selectedFile.name);

        this.isUploading = true;

        this.orderQRService.uploadQR(formData).subscribe({
            next: (response) => {
                console.log(response)
                this.uploadCompleted.emit(response);
            },
            error: (err) => {
                console.error(`Upload failed: ${err.message || err}`);
            },
            complete: () => {
                this.isUploading = false;
                this.selectedFile = null;
            }
        })
    }
}