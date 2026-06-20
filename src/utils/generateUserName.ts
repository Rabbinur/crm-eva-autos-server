import { UUIDService } from "@/lib/uuid";

export const generateUserName = (email: string): string => {
  const cleanEmail = email
    .trim()
    .replace(/.*<(.+)>.*/, "$1")
    .toLowerCase();

  const uuidPart = UUIDService.generateFirstPart();

  const emailPrefix = cleanEmail.split("@")[0].replace(/[^a-z0-9]/gi, "");

  const randomNum = Math.floor(1000 + Math.random() * 9000);

  return `${emailPrefix}${randomNum}${uuidPart}`;
};
