import { CompanyModel } from "./company.model";
import { ICompany } from "./company.interface";
import ApiError from "@/middlewares/error";
import { HttpStatusCode } from "@/lib/httpStatus";
import { IPaginationOptions } from "@/interfaces/pagination.interfaces";
import { paginationHelpers } from "@/helpers/paginationHelpers";

class Service {
  async createCompany(data: ICompany) {
    const isExist = await CompanyModel.findOne({ name: data.name });
    if (isExist) {
      throw new ApiError(HttpStatusCode.CONFLICT, "Company already exists");
    }
    return await CompanyModel.create(data);
  }

  async getAllCompanies(options: IPaginationOptions, search_query: string) {
    const {
      limit = 100,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = paginationHelpers.calculatePagination(options);

    const searchCondition: any = {};
    if (search_query) {
      searchCondition.name = { $regex: search_query, $options: "i" };
    }

    const result = await CompanyModel.find({ ...searchCondition })
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    const total = await CompanyModel.countDocuments(searchCondition);

    return {
      meta: { page, limit, total },
      data: result,
    };
  }

  async getCompanyById(id: string) {
    const company = await CompanyModel.findById(id);
    if (!company) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Company not found");
    }
    return company;
  }

  async updateCompany(id: string, data: Partial<ICompany>) {
    const company = await CompanyModel.findById(id);
    if (!company) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Company not found");
    }
    return await CompanyModel.findByIdAndUpdate(id, { ...data }, { new: true });
  }

  async deleteCompany(id: string) {
    const company = await CompanyModel.findById(id);
    if (!company) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Company not found");
    }
    return await CompanyModel.findByIdAndDelete(id);
  }
}

export const CompanyService = new Service();
