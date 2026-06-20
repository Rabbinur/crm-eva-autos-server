import { DeliveryManModel } from "./delivery-man.model";
import { IDeliveryMan } from "./delivery-man.interface";
import ApiError from "@/middlewares/error";
import { HttpStatusCode } from "@/lib/httpStatus";
import { IPaginationOptions } from "@/interfaces/pagination.interfaces";
import { paginationHelpers } from "@/helpers/paginationHelpers";
import { LoadingSheetModel } from "../loading-sheet/loading-sheet.model";
import { SettlementModel } from "../settlement/settlement.model";

class Service {
  async createDeliveryMan(data: IDeliveryMan) {
    const isExist = await DeliveryManModel.findOne({ phone: data.phone });
    if (isExist) {
      throw new ApiError(
        HttpStatusCode.CONFLICT,
        "Delivery Man with this phone number already exists"
      );
    }
    return await DeliveryManModel.create(data);
  }

  async getAllDeliveryMen(options: IPaginationOptions, search_query: string) {
    const {
      limit = 20,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = paginationHelpers.calculatePagination(options);

    const searchCondition: any = {};
    if (search_query) {
      searchCondition.$or = [
        { name: { $regex: search_query, $options: "i" } },
        { phone: { $regex: search_query, $options: "i" } },
        { nid: { $regex: search_query, $options: "i" } },
      ];
    }

    const result = await DeliveryManModel.find({ ...searchCondition })
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    const total = await DeliveryManModel.countDocuments(searchCondition);

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  }

  async getDeliveryManById(id: string) {
    const deliveryMan = await DeliveryManModel.findById(id);
    if (!deliveryMan) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Delivery Man not found");
    }
    return deliveryMan;
  }

  async updateDeliveryMan(id: string, data: Partial<IDeliveryMan>) {
    const deliveryMan = await DeliveryManModel.findById(id);
    if (!deliveryMan) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Delivery Man not found");
    }
    return await DeliveryManModel.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    );
  }

  async deleteDeliveryMan(id: string) {
    const deliveryMan = await DeliveryManModel.findById(id);
    if (!deliveryMan) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Delivery Man not found");
    }
    return await DeliveryManModel.findByIdAndDelete(id);
  }

  async getDeliveryManStats(id: string) {
    const deliveryMan = await DeliveryManModel.findById(id);
    if (!deliveryMan) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "Delivery representative not found"
      );
    }

    // 1. Loading Sheets (Challans) metrics
    const totalChallans = await LoadingSheetModel.countDocuments({
      delivery_man_id: id,
    });
    const settledChallans = await LoadingSheetModel.countDocuments({
      delivery_man_id: id,
      status: "settled",
    });
    const pendingChallans = await LoadingSheetModel.countDocuments({
      delivery_man_id: id,
      status: "loaded",
    });

    // 2. Aggregate Settlement financial metrics
    const settlementSummary = await SettlementModel.aggregate([
      { $match: { deliveryManId: id } },
      {
        $group: {
          _id: null,
          totalLoaded: { $sum: "$totalLoaded" },
          totalSold: { $sum: "$totalSold" },
          totalReturned: { $sum: "$totalReturned" },
          totalDamaged: { $sum: "$totalDamaged" },
          totalSales: { $sum: "$totalSales" },
          totalProfit: { $sum: "$totalProfit" },
          totalLoss: { $sum: "$totalLoss" },
        },
      },
    ]);

    const summary = settlementSummary[0] || {
      totalLoaded: 0,
      totalSold: 0,
      totalReturned: 0,
      totalDamaged: 0,
      totalSales: 0,
      totalProfit: 0,
      totalLoss: 0,
    };

    // 3. Fetch detailed list of all loading sheets (challans) assigned to him
    const loadingSheets = await LoadingSheetModel.find({ delivery_man_id: id })
      .sort({ createdAt: -1 })
      .lean();

    // Enrich loading sheets with settlement metrics if settled
    const challans = [];
    for (const sheet of loadingSheets) {
      const settlement = await SettlementModel.findOne({
        loadingSheetId: sheet._id.toString(),
      }).lean();

      challans.push({
        id: sheet._id.toString(),
        invoiceNo:
          sheet.invoice_no ||
          `INV-${sheet._id.toString().slice(-6).toUpperCase()}`,
        date: sheet.loading_date
          ? new Date(sheet.loading_date).toISOString().slice(0, 10)
          : "",
        route: sheet.route || "N/A",
        status: sheet.status,
        settlement: settlement
          ? {
              id: settlement._id.toString(),
              invoiceNo:
                settlement.invoiceNo ||
                `SET-${settlement._id.toString().slice(-6).toUpperCase()}`,
              date: settlement.date,
              totalSales: settlement.totalSales,
              totalProfit: settlement.totalProfit,
              totalLoss: settlement.totalLoss,
              totalLoaded: settlement.totalLoaded,
              totalSold: settlement.totalSold,
              totalReturned: settlement.totalReturned,
              totalDamaged: settlement.totalDamaged,
            }
          : null,
      });
    }

    return {
      deliveryMan,
      summary: {
        totalChallans,
        settledChallans,
        pendingChallans,
        ...summary,
      },
      challans,
    };
  }
}

export const DeliveryManService = new Service();
