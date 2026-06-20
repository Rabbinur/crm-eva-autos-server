import { IRoles } from "@/constants/roles";
import { HttpStatusCode } from "@/lib/httpStatus";
import ApiError from "@/middlewares/error";

class Service {
  userIDGenerator(role: IRoles): string {
    if (!role) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "Role is required to generate user ID"
      );
    }
    // Extract the first letter of the role (uppercase)
    const firstLetter = role.charAt(0).toUpperCase();

    // Generate random number (padded with zeros)
    const randomNumber = Math.floor(Math.random() * 900000) + 100000; // 100000 to 999999

    const timestamp = Date.now().toString().slice(-5);

    return `MH${firstLetter}${randomNumber}${timestamp}`;
  }

  orderIDGenerator(): string {
    const randomNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
    return `MHO-`.padEnd(7, "0") + randomNumber.toString();
  }
}

export const IDGeneratorService = new Service();
