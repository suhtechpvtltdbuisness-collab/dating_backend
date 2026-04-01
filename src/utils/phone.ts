const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

export function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[\s()-]/g, "").trim();
}

export function isValidPhoneNumber(phoneNumber: string): boolean {
  return E164_PHONE_REGEX.test(phoneNumber);
}
