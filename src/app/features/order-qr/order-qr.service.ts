import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { QRResponse, QRValidationResponse } from "./order-qr.models";

@Injectable({ providedIn: 'root' })
export class OrderQRService {
    constructor(private http: HttpClient) {}
    
    getQR(orderId: number) : Observable<QRResponse> {

        // TODO: Mock data - replace with actual HTTP call once controller endpoint is ready.
        return of(
            { 
                base64QRString: 'iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6AQAAAACgl2eQAAABd0lEQVR4Xu2XUa6EMAhFSVyAS3LrXZILaNLHuegkOr759iYlpoNwfghw68T4bS3ukZtNoGwCZRMom0DZe4AeWL712JaMrY331Q3Ab31tY8+4nCPoBVAaDmUKjjAFFGzLzukLjH3Dj1j+KfP1AG52Kpcln/4wcg6A1p8enc99/R2Aw3balHHtzmFGAGVSGrufJyKwlw5YAUeWfcmYnO2+We8HWJmWb/QLERsLjTMD8rfX4p9kRwQcATrVdaGkJj+V+XagBixP/KxXt8lV5TyA6lGQ3ShZWTsARgrA7qvGe7PeD6zEg4+ThFMBttQB5a2Ac+QkxQP4a+QMAFqj2yT/gGhr7iNnAmjkgjNTe9a7XUfOAkCBOy3DwVADM6CsGtQ1bJ9+GQFdlVUqdz/09X5VOQeAihp3unS4HkOgUZqkmGtRVSvvCJD61IsOeAJ8utMvWvbUrJcDuEyaFDhqg+wAzZiqY/CG7nflnYAfNoGyCZRNoGwCZR7AH70LaQ6ZeScBAAAAAElFTkSuQmCC'
            }
        );
    }

    uploadQR(formData: FormData): Observable<QRValidationResponse> {
        
        //TODO: Mock data - replace with actual HTTP call once controller endpoint is ready.
        return of(
            {
                isValid: true,
                token: '60407a78-2fc0-4f10-9161-7234ebd415c2'
            }
        )
    }

}