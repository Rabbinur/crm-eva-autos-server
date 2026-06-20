import mongoose from "mongoose";
import { SettlementModel } from "./settlement.model";
import { SaleBatchDetailModel } from "./sale-batch-detail.model";
import {
  DamageRecordModel,
  generateDamageNumber,
} from "../damage-record/damage-record.model";
import {
  LoadingSheetModel,
  LoadingSheetDetailModel,
} from "../loading-sheet/loading-sheet.model";
import { ProductModel } from "../product/product.model";
import { runTransactionWithFallback } from "../loading-sheet/loading-sheet.service";
import ApiError from "@/middlewares/error";
import { HttpStatusCode } from "@/lib/httpStatus";
import { IPaginationOptions } from "@/interfaces/pagination.interfaces";
import { paginationHelpers } from "@/helpers/paginationHelpers";

class Service {
  async createSettlement(data: any): Promise<any> {
    const settlementId = new mongoose.Types.ObjectId();
    return await runTransactionWithFallback(async (session) => {
      // 1. Fetch loading sheet
      const loadingSheet = await LoadingSheetModel.findById(
        data.loadingSheetId
      ).session(session || null);
      if (!loadingSheet) {
        throw new ApiError(HttpStatusCode.NOT_FOUND, "Loading sheet not found");
      }
      if (loadingSheet.status === "settled") {
        throw new ApiError(
          HttpStatusCode.BAD_REQUEST,
          "Loading sheet is already settled"
        );
      }

      // Initialize audit totals
      let totalLoaded = 0;
      let totalSold = 0;
      let totalReturned = 0;
      let totalDamaged = 0;
      let totalSales = 0;
      let totalCostOfSales = 0;
      let totalLoss = 0;

      const items = data.items || [];
      const updatedItems = [];

      for (const item of items) {
        const loadedQty = Number(item.loadedQuantity) || 0;
        const soldQty = Number(item.soldQuantity) || 0;
        const returnedQty = Number(item.returnedQuantity) || 0;
        const damagedQty = Number(item.damagedQuantity) || 0;
        const freeQty = Number(item.freeQuantity) || 0;

        // 2. Validate quantities: loaded_qty = sold_qty + returned_qty + damaged_qty + free_qty
        if (loadedQty !== soldQty + returnedQty + damagedQty + freeQty) {
          throw new ApiError(
            HttpStatusCode.BAD_REQUEST,
            `Quantities do not match loaded quantity for product ${item.productName}. Loaded: ${loadedQty}, Sum: ${soldQty + returnedQty + damagedQty + freeQty}`
          );
        }

        // 3. Find loading sheet details for this product
        const details = await LoadingSheetDetailModel.find({
          loading_sheet_id: loadingSheet._id,
          product_id: item.productId,
        })
          .session(session || null)
          .sort({ createdAt: 1 }); // FIFO allocation order

        if (details.length === 0) {
          throw new ApiError(
            HttpStatusCode.BAD_REQUEST,
            `No loading sheet details found for product ${item.productName}`
          );
        }

        // Distribute quantities across details
        let remainingReturned = returnedQty;
        let remainingDamaged = damagedQty;
        let remainingFree = freeQty;

        for (const detail of details) {
          const detailLoaded = Number(detail.loaded_qty) || 0;

          // Allocate returned quantity
          const ret = Math.min(remainingReturned, detailLoaded);
          detail.returned_qty = ret;
          remainingReturned -= ret;

          // Allocate damaged quantity
          const dmg = Math.min(remainingDamaged, detailLoaded - ret);
          detail.damaged_qty = dmg;
          remainingDamaged -= dmg;

          // Allocate free quantity
          const free = Math.min(remainingFree, detailLoaded - ret - dmg);
          detail.free_qty = free;
          remainingFree -= free;

          // Remaining is sold quantity
          const sold = detailLoaded - ret - dmg - free;
          detail.sold_qty = sold;

          // Save detail updates
          await detail.save({ session });

          // 4. Update product batches
          const product = await ProductModel.findById(
            detail.product_id
          ).session(session || null);
          if (product) {
            const batch = product.batches.find(
              (b: any) => b._id?.toString() === detail.batch_id.toString()
            );
            if (batch) {
              // Deduct loaded quantity from Hold Stock
              const currentHold = Number(batch.hold_qty) || 0;
              batch.hold_qty = Math.max(0, currentHold - detailLoaded);

              // Return returned stock to Available Stock
              const currentAvailable = Number(batch.packs_added) || 0;
              batch.packs_added = currentAvailable + ret;

              await product.save({ session });
            }
          }

          // 5. Record Damaged Stock Losses (ERP Traceable)
          if (dmg > 0) {
            const lossAmount = Number((dmg * detail.purchase_price).toFixed(2));
            const damageRecord = new DamageRecordModel({
              damage_number: generateDamageNumber(),
              source_type: "Delivery Settlement",
              source_reference_id: settlementId,
              created_by: data.deliveryManName || "System",
              status: "Approved", // Pre-approved on settlement finalization
              damage_date: data.date || new Date().toISOString().slice(0, 10),
              damage_reason: "Delivery Settlement Damage",
              qty: dmg,
              loss_amount: lossAmount,
              items: [
                {
                  product_id: detail.product_id,
                  product_name: detail.product_name,
                  batch_id: detail.batch_id.toString(),
                  qty: dmg,
                  purchase_price: detail.purchase_price,
                  loss_amount: lossAmount,
                },
              ],
            });
            await damageRecord.save({ session });
            totalLoss = Number((totalLoss + lossAmount).toFixed(2));
          }

          // 6. Record Sales Batch Details
          if (sold > 0) {
            const sellingPrice =
              Number(item.sellingPrice) || detail.selling_price;
            const revenue = Number((sold * sellingPrice).toFixed(2));
            const cost = Number((sold * detail.purchase_price).toFixed(2));
            const profit = Number((revenue - cost).toFixed(2));

            const saleBatch = new SaleBatchDetailModel({
              sale_id: settlementId,
              batch_id: detail.batch_id,
              qty: sold,
              purchase_price: detail.purchase_price,
              selling_price: sellingPrice,
              revenue,
              cost,
              profit,
            });

            await saleBatch.save({ session });

            totalSales = Number((totalSales + revenue).toFixed(2));
            totalCostOfSales = Number((totalCostOfSales + cost).toFixed(2));
          }
        }

        // Keep track of counts
        totalLoaded += loadedQty;
        totalSold += soldQty;
        totalReturned += returnedQty;
        totalDamaged += damagedQty;

        updatedItems.push({
          productId: item.productId,
          productName: item.productName,
          loadedQuantity: loadedQty,
          soldQuantity: soldQty,
          returnedQuantity: returnedQty,
          damagedQuantity: damagedQty,
          freeQuantity: freeQty,
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice,
        });
      }

      // Compute Net Profit (Gross Profit - Loss)
      const grossProfit = Number((totalSales - totalCostOfSales).toFixed(2));
      const netProfit = Number((grossProfit - totalLoss).toFixed(2));

      // 7. Create Settlement document
      const settlement = new SettlementModel({
        _id: settlementId,
        date: data.date
          ? new Date(data.date).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        deliveryManName: data.deliveryManName,
        deliveryManId: data.deliveryManId,
        route: data.route || loadingSheet.route,
        loadingSheetId: data.loadingSheetId,
        loadingSheetInvoiceNo:
          loadingSheet.invoice_no ||
          `INV-${loadingSheet._id.toString().slice(-6).toUpperCase()}`,
        totalLoaded,
        totalSold,
        totalReturned,
        totalDamaged,
        totalSales,
        totalProfit: netProfit,
        totalLoss,
        status: "finalized",
        items: updatedItems,
      });

      const savedSettlement = await settlement.save({ session });

      // Associate the created SaleBatchDetail records with this Settlement ID
      await SaleBatchDetailModel.updateMany(
        { sale_id: null },
        { $set: { sale_id: savedSettlement._id } }
      ).session(session || null);

      // 8. Mark loading sheet as settled
      loadingSheet.status = "settled";
      loadingSheet.settlement_date = new Date(settlement.date);
      await loadingSheet.save({ session });

      return savedSettlement;
    });
  }

  async getAllSettlements(
    options: IPaginationOptions,
    search_query: string,
    filters: { start_date?: string; end_date?: string } = {}
  ): Promise<any> {
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
        { deliveryManName: { $regex: search_query, $options: "i" } },
        { route: { $regex: search_query, $options: "i" } },
      ];
    }

    // Apply date range filters
    if (filters.start_date && filters.end_date) {
      searchCondition.date = {
        $gte: filters.start_date,
        $lte: filters.end_date,
      };
    } else if (filters.start_date) {
      searchCondition.date = { $gte: filters.start_date };
    } else if (filters.end_date) {
      searchCondition.date = { $lte: filters.end_date };
    }

    const result = await SettlementModel.find({ ...searchCondition })
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    const total = await SettlementModel.countDocuments(searchCondition);

    // Calculate aggregate totals for the filtered range
    const summaryResult = await SettlementModel.aggregate([
      { $match: searchCondition },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalSales" },
          totalProfit: { $sum: "$totalProfit" },
          totalLoss: { $sum: "$totalLoss" },
        },
      },
    ]);

    const summary = summaryResult[0] || {
      totalSales: 0,
      totalProfit: 0,
      totalLoss: 0,
    };

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
      summary: {
        totalSales: summary.totalSales,
        totalProfit: summary.totalProfit,
        totalLoss: summary.totalLoss,
      },
    };
  }

  async getSettlementById(id: string): Promise<any> {
    const settlement = await SettlementModel.findById(id);
    if (!settlement) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Settlement not found");
    }
    return settlement;
  }
}

export const SettlementService = new Service();
