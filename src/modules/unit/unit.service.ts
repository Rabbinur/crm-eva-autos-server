import { UnitModel } from "./unit.model";
import { IUnit } from "./unit.interface";
import ApiError from "@/middlewares/error";
import { HttpStatusCode } from "@/lib/httpStatus";
import { IPaginationOptions } from "@/interfaces/pagination.interfaces";
import { paginationHelpers } from "@/helpers/paginationHelpers";

class Service {
  async createUnit(data: IUnit) {
    const isExist = await UnitModel.findOne({ name: data.name });
    if (isExist) {
      throw new ApiError(HttpStatusCode.CONFLICT, "Unit already exists");
    }
    return await UnitModel.create(data);
  }

  async getAllUnits(options: IPaginationOptions, search_query: string) {
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

    const result = await UnitModel.find({ ...searchCondition })
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    const total = await UnitModel.countDocuments(searchCondition);

    return {
      meta: { page, limit, total },
      data: result,
    };
  }

  async getUnitById(id: string) {
    const unit = await UnitModel.findById(id);
    if (!unit) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Unit not found");
    }
    return unit;
  }

  async updateUnit(id: string, data: Partial<IUnit>) {
    const unit = await UnitModel.findById(id);
    if (!unit) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Unit not found");
    }
    return await UnitModel.findByIdAndUpdate(id, { ...data }, { new: true });
  }

  async deleteUnit(id: string) {
    const unit = await UnitModel.findById(id);
    if (!unit) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Unit not found");
    }
    return await UnitModel.findByIdAndDelete(id);
  }
}

export const UnitService = new Service();
