import { IRoles, ROLES } from "@/constants/roles";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "./error";
import { HttpStatusCode } from "@/lib/httpStatus";
import JwtHelper from "@/helpers/jwtHelper";
import { pubClient } from "@/config/redis";

const verifyToken =
  (allowedRoles?: IRoles[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const raw_token = req.headers.authorization;

      if (!raw_token) {
        throw new ApiError(
          HttpStatusCode.UNAUTHORIZED,
          "Authenticated failed. Please provide access token in authorization headers to access the resource(s)"
        );
      }
      let token = raw_token;
      if (raw_token.startsWith("Bearer ")) {
        token = raw_token.split(" ")[1];
      }

      const isVerified: JwtPayload | null = JwtHelper.verifyToken(token);

      if (!isVerified) {
        throw new ApiError(
          HttpStatusCode.UNAUTHORIZED,
          "Invalid or incomplete token payload"
        );
      }

      // Check login session in Redis
      const sessionKey = `session:${isVerified.id}`;
      const sessionExists = await pubClient.get(sessionKey);
      if (!sessionExists) {
        throw new ApiError(
          HttpStatusCode.UNAUTHORIZED,
          "Session has expired or is invalid. Please login again."
        );
      }

      // If allowedRoles is provided and non-empty, check if role is permitted
      if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
        let isAllowed = allowedRoles.includes(isVerified.role as IRoles);

        // Centralized Moderator permission bypass:
        // A moderator is allowed to access any route that requires admin/super_admin role,
        // EXCEPT the user management endpoints (/admin/users).
        if (!isAllowed && isVerified.role === ROLES.MODERATOR) {
          const isRequestingUserManagement =
            req.baseUrl.startsWith("/admin/users") ||
            req.originalUrl.startsWith("/api/v1/admin/users");
          const requiresAdminRole =
            allowedRoles.includes(ROLES.ADMIN) ||
            allowedRoles.includes(ROLES.SUPER_ADMIN);

          if (requiresAdminRole && !isRequestingUserManagement) {
            isAllowed = true;
          }
        }

        if (!isAllowed) {
          throw new ApiError(
            HttpStatusCode.FORBIDDEN,
            "Forbidden: Access denied"
          );
        }
      }

      // Attach user info to request
      req.user = isVerified;

      next();
    } catch (error) {
      next(error);
    }
  };

export default verifyToken;
