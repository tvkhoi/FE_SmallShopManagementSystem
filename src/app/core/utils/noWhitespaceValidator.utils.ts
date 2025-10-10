import { AbstractControl, ValidationErrors } from '@angular/forms';

export function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  if (control.value == null) return null;
  const hasWhitespace = /\s/.test(control.value);
  return hasWhitespace ? { whitespace: true } : null;
}
