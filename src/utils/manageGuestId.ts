import { UUIDService } from "@/lib/uuid";
import { Request, Response } from "express";

const manageGuestId = (req: Request, res: Response) => {
  let guestId = req.cookies.guest_id;
  console.log({ guestId });

  if (!guestId) {
    guestId = UUIDService.generateFull();

    res.cookie("guest_id", guestId, {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
  }

  req.guest_id = guestId;
  req.isGuestAllowed = true;
};

export default manageGuestId;
