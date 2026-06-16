export interface QRResponse {
    base64QRString: string,
    message: string,
}

export interface QRValidationResponse {
    isValid: boolean;
    token: string | null;
    message: string;
}

