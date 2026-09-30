export const MIN_AGE = 21

/** Whole years between a date of birth and today. */
export function ageFromDob(dob: Date, today = new Date()): number {
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

export function isOfAge(dob: Date, today = new Date()) {
  return ageFromDob(dob, today) >= MIN_AGE
}
