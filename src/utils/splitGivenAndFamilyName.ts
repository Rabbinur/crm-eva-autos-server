export const splitGivenAndFamilyName = (
  fullName: string
): {
  given_name: string;
  family_name: string;
} => {
  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    // Only one name provided
    return { given_name: parts[0], family_name: parts[0] };
  } else if (parts.length === 2) {
    // Simple case like "John Doe"
    return { given_name: parts[0], family_name: parts[1] };
  } else {
    // More than 2 parts: split in the middle
    const mid = Math.floor(parts.length / 2);
    const given_name = parts.slice(0, mid).join(" ");
    const family_name = parts.slice(mid).join(" ");
    return { given_name, family_name };
  }
};
