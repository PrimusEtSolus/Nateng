// Input validation utilities for API routes and forms

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class Validator {
  static email(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email || typeof email !== 'string') {
      errors.push('Email is required');
      return { isValid: false, errors };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    if (email.length > 255) {
      errors.push('Email must be less than 255 characters');
    }

    return { isValid: errors.length === 0, errors };
  }

  static mobileNumber(phone: string): ValidationResult {
    const errors: string[] = [];
    
    if (!phone || typeof phone !== 'string') {
      errors.push('Mobile number is required');
      return { isValid: false, errors };
    }

    const mobileRegex = /^09\d{9}$/;
    if (!mobileRegex.test(phone)) {
      errors.push('Mobile number must be in format: 09xxxxxxxx (11 digits)');
    }

    return { isValid: errors.length === 0, errors };
  }

  static password(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (!password || typeof password !== 'string') {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }

    return { isValid: errors.length === 0, errors };
  }

  static userName(name: string, fieldName: string = 'Name'): ValidationResult {
    const errors: string[] = [];
    
    if (!name || typeof name !== 'string') {
      errors.push(`${fieldName} is required`);
      return { isValid: false, errors };
    }

    if (name.length < 2) {
      errors.push(`${fieldName} must be at least 2 characters long`);
    }

    if (name.length > 50) {
      errors.push(`${fieldName} must be less than 50 characters`);
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(name)) {
      errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
    }

    return { isValid: errors.length === 0, errors };
  }

  static role(role: string): ValidationResult {
    const errors: string[] = [];
    const validRoles = ['farmer', 'buyer', 'business', 'reseller', 'admin'];
    
    if (!role || typeof role !== 'string') {
      errors.push('Role is required');
      return { isValid: false, errors };
    }

    if (!validRoles.includes(role.toLowerCase())) {
      errors.push(`Role must be one of: ${validRoles.join(', ')}`);
    }

    return { isValid: errors.length === 0, errors };
  }

  static price(price: number): ValidationResult {
    const errors: string[] = [];
    
    if (typeof price !== 'number') {
      errors.push('Price must be a number');
      return { isValid: false, errors };
    }

    if (price < 0) {
      errors.push('Price cannot be negative');
    }

    if (price > 999999.99) {
      errors.push('Price cannot exceed 999,999.99');
    }

    return { isValid: errors.length === 0, errors };
  }

  static quantity(quantity: number): ValidationResult {
    const errors: string[] = [];
    
    if (typeof quantity !== 'number') {
      errors.push('Quantity must be a number');
      return { isValid: false, errors };
    }

    if (quantity < 0) {
      errors.push('Quantity cannot be negative');
    }

    if (quantity > 999999) {
      errors.push('Quantity cannot exceed 999,999');
    }

    if (!Number.isInteger(quantity)) {
      errors.push('Quantity must be a whole number');
    }

    return { isValid: errors.length === 0, errors };
  }

  static id(id: any, fieldName: string = 'ID'): ValidationResult {
    const errors: string[] = [];
    
    if (id === null || id === undefined) {
      errors.push(`${fieldName} is required`);
      return { isValid: false, errors };
    }

    const numId = Number(id);
    if (isNaN(numId)) {
      errors.push(`${fieldName} must be a valid number`);
      return { isValid: false, errors };
    }

    if (numId <= 0) {
      errors.push(`${fieldName} must be a positive number`);
    }

    if (!Number.isInteger(numId)) {
      errors.push(`${fieldName} must be a whole number`);
    }

    return { isValid: errors.length === 0, errors };
  }

  static required(value: any, fieldName: string): ValidationResult {
    const errors: string[] = [];
    
    if (value === null || value === undefined || value === '') {
      errors.push(`${fieldName} is required`);
    }

    return { isValid: errors.length === 0, errors };
  }

  static maxLength(value: string, maxLength: number, fieldName: string): ValidationResult {
    const errors: string[] = [];
    
    if (value && value.length > maxLength) {
      errors.push(`${fieldName} must be ${maxLength} characters or less`);
    }

    return { isValid: errors.length === 0, errors };
  }

  static minLength(value: string, minLength: number, fieldName: string): ValidationResult {
    const errors: string[] = [];
    
    if (value && value.length < minLength) {
      errors.push(`${fieldName} must be at least ${minLength} characters long`);
    }

    return { isValid: errors.length === 0, errors };
  }

  static combine(...results: ValidationResult[]): ValidationResult {
    const allErrors = results.flatMap(r => r.errors);
    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }
}

// Helper function to validate and return early if invalid
export function validateRequest(data: Record<string, any>, rules: Record<string, (value: any) => ValidationResult>): ValidationResult {
  const results: ValidationResult[] = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    if (data.hasOwnProperty(field)) {
      results.push(rule(data[field]));
    }
  }
  
  return Validator.combine(...results);
}

// Sanitization utilities
export class Sanitizer {
  static string(value: any): string {
    if (typeof value !== 'string') {
      return '';
    }
    return value.trim();
  }

  static email(value: any): string {
    const email = this.string(value);
    return email.toLowerCase();
  }

  static number(value: any): number | null {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  static html(value: any): string {
    if (typeof value !== 'string') {
      return '';
    }
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '');
  }
}
