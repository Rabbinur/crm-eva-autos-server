import { AreaModel } from "./area.model";
import { IArea } from "./area.interface";
import ApiError from "@/middlewares/error";
import { HttpStatusCode } from "@/lib/httpStatus";
import { IPaginationOptions } from "@/interfaces/pagination.interfaces";
import { paginationHelpers } from "@/helpers/paginationHelpers";

class Service {
  async createArea(data: IArea) {
    const isExist = await AreaModel.findOne({ name: data.name });
    if (isExist) {
      throw new ApiError(HttpStatusCode.CONFLICT, "Area already exists");
    }
    return await AreaModel.create(data);
  }

  async getAllAreas(options: IPaginationOptions, search_query: string) {
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

    const result = await AreaModel.find({ ...searchCondition })
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    const total = await AreaModel.countDocuments(searchCondition);

    return {
      meta: { page, limit, total },
      data: result,
    };
  }

  async getAreaById(id: string) {
    const area = await AreaModel.findById(id);
    if (!area) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Area not found");
    }
    return area;
  }

  async updateArea(id: string, data: Partial<IArea>) {
    const area = await AreaModel.findById(id);
    if (!area) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Area not found");
    }
    return await AreaModel.findByIdAndUpdate(id, { ...data }, { new: true });
  }

  async deleteArea(id: string) {
    const area = await AreaModel.findById(id);
    if (!area) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Area not found");
    }
    return await AreaModel.findByIdAndDelete(id);
  }
}

export const AreaService = new Service();
