// Chapter 7:: Forms & Validation — vanilla replacement for Yup/Formik validation

export function validate(values, rules) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const value = values[field];
    if (rule.required && !value) {
      errors[field] = `${field} is required`;
    } else if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`;
    } else if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field} is invalid`;
    } else if (rule.custom && !rule.custom(value, values)) {
      errors[field] = rule.message || `${field} is invalid`;
    }
  }
  return errors;
}

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
