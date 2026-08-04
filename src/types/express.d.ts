import type { Role } from "../../prisma/generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        email: string;
      };
    }
  }
}
