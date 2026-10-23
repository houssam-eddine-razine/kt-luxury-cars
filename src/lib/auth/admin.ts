export function getAdministratorEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdministratorEmail(
  email: string | null | undefined,
) {
  if (!email) {
    return false;
  }

  return getAdministratorEmails().includes(
    email.trim().toLowerCase(),
  );
}