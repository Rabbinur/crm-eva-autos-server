import { CategoryModel } from "./category.model";
import { ICategory } from "./category.interface";
import ApiError from "@/middlewares/error";
import { HttpStatusCode } from "@/lib/httpStatus";
import { IPaginationOptions } from "@/interfaces/pagination.interfaces";
import { paginationHelpers } from "@/helpers/paginationHelpers";

class Service {
  async createCategory(data: ICategory) {
    const isExist = await CategoryModel.findOne({
      name: data.name,
      company_name: data.company_name,
    });
    if (isExist) {
      throw new ApiError(
        HttpStatusCode.CONFLICT,
        "Category already exists for this company"
      );
    }
    return await CategoryModel.create(data);
  }

  async getAllCategories(
    options: IPaginationOptions,
    search_query: string,
    company_name?: string
  ) {
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
    if (company_name) {
      searchCondition.company_name = company_name;
    }

    const result = await CategoryModel.find({ ...searchCondition })
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    const total = await CategoryModel.countDocuments(searchCondition);

    return {
      meta: { page, limit, total },
      data: result,
    };
  }

  async getCategoryById(id: string) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Category not found");
    }
    return category;
  }

  async updateCategory(id: string, data: Partial<ICategory>) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Category not found");
    }
    return await CategoryModel.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    );
  }

  async deleteCategory(id: string) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Category not found");
    }
    return await CategoryModel.findByIdAndDelete(id);
  }
}

export const CategoryService = new Service();
