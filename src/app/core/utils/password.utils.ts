import { PasswordPolicy } from '../models/domain/PasswordPolicy';

export interface PasswordRule {
  key: string;
  label: string;
}

export const DEFAULT_RULES: PasswordRule[] = [
  { key: 'requiredLength', label: 'Ít nhất {length} ký tự' },
  { key: 'uppercase', label: 'Chữ hoa (A-Z)' },
  { key: 'lowercase', label: 'Chữ thường (a-z)' },
  { key: 'digit', label: 'Số (0-9)' },
  { key: 'nonAlphanumeric', label: 'Ký tự đặc biệt (!@#$...)' },
];

export function getPendingPasswordRules(password: string, policy: PasswordPolicy): PasswordRule[] {
  const value = password || '';
  return DEFAULT_RULES.filter(rule => {
    switch (rule.key) {
      case 'requiredLength': return value.length < (policy.requiredLength || 8);
      case 'uppercase': return policy.requireUppercase && !/[A-Z]/.test(value);
      case 'lowercase': return policy.requireLowercase && !/[a-z]/.test(value);
      case 'digit': return policy.requireDigit && !/\d/.test(value);
      case 'nonAlphanumeric': return policy.requireNonAlphanumeric && !/[^a-zA-Z0-9]/.test(value);
      default: return true;
    }
  }).map(rule => {
    if (rule.key === 'requiredLength') {
      return { ...rule, label: `Ít nhất ${policy.requiredLength} ký tự` };
    }
    return rule;
  });
}
