import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { getPendingPasswordRules } from './password.utils';
import { PasswordPolicy } from '../models/domain/PasswordPolicy';

export function createPasswordPolicyValidator(policy: PasswordPolicy): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || '';
    const pending = getPendingPasswordRules(value, policy);
    return pending.length === 0 ? null : { passwordPolicy: pending.map((r) => r.label) };
  };
}
