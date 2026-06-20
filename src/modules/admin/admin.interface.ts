export type IAdmin = {
  name: string;
  image?: string;
  email: string;
  role?: string;
  status?: "inactive" | "admin_approval" | "active";
  password: string;
  designation?: string;
  bio?: string;
  phone_number?: string;
  driving_license?: string;
  work_place?: string;
  date_of_birth?: Date;
};

export enum ADMIN_ENUMS {
  INACTIVE = "inactive",
  ACTIVE = "active",
  ADMIN_APPROVAL = "admin_approval",
}

export type IChangePassword = {
  old_password: string;
  new_password: string;
};
