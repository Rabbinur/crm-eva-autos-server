import mongoose from "mongoose";
import { DamageRecordModel, generateDamageNumber } from "./damage-record.model";
import { IDamageRecordItem } from "./damage-record.interface";
import { ProductModel } from "../product/product.model";
import { runTransactionWithFallback } from "../loading-sheet/loading-sheet.service";
import ApiError from "@/middlewares/error";
import { HttpStatusCode } from "@/lib/httpStatus";
import { IPaginationOptions } from "@/interfaces/pagination.interfaces";
import { paginationHelpers } from "@/helpers/paginationHelpers";

class Service {
  async createDamageRecord(data: any, operator: string): Promise<any> {
    return await runTransactionWithFallback(async (session) => {
      const items = data.items || [];
      if (items.length === 0) {
        throw new ApiError(
          HttpStatusCode.BAD_REQUEST,
          "Damage record must contain at least one product item"
        );
      }

      let totalQty = 0;
      let totalLoss = 0;
      const processedItems: IDamageRecordItem[] = [];

      for (const item of items) {
        const product = await ProductModel.findById(item.productId).session(
          session || null
        );
        if (!product) {
          throw new ApiError(
            HttpStatusCode.NOT_FOUND,
            `Product not found: ${item.productName}`
          );
        }

        const batch = product.batches.find(
          (b: any) =>
            b.batch_id === item.batchId || b._id?.toString() === item.batchId
        );

        const qty = Number(item.qty) || 0;
        if (qty <= 0) {
          throw new ApiError(
            HttpStatusCode.BAD_REQUEST,
            "Quantity must be greater than zero"
          );
        }

        const cartonPackets = product.carton_packets || 1;
        const purchasePrice = batch
          ? Number(batch.purchase_rate_carton) / cartonPackets
          : Number(item.purchasePrice || 0);

        const lossAmount = Number((qty * purchasePrice).toFixed(2));

        totalQty += qty;
        totalLoss = Number((totalLoss + lossAmount).toFixed(2));

        processedItems.push({
          product_id: product._id,
          product_name: product.name,
          batch_id: batch
            ? batch.batch_id || batch._id.toString()
            : item.batchId,
          qty,
          purchase_price: purchasePrice,
          loss_amount: lossAmount,
        });
      }

      // Sourced from Delivery Settlement is pre-approved
      const status =
        data.source_type === "Delivery Settlement" ? "Approved" : "Pending";

      const damageRecord = new DamageRecordModel({
        damage_number: generateDamageNumber(),
        source_type: data.source_type,
        source_reference_id: data.source_reference_id
          ? new mongoose.Types.ObjectId(data.source_reference_id)
          : undefined,
        created_by: operator || "System",
        status,
        damage_date: data.damage_date || new Date().toISOString().slice(0, 10),
        damage_reason: data.damage_reason,
        qty: totalQty,
        loss_amount: totalLoss,
        items: processedItems,
      });

      const saved = await damageRecord.save({ session });
      return saved;
    });
  }

  async updateDamageStatus(
    id: string,
    status: string,
    operator: string
  ): Promise<any> {
    return await runTransactionWithFallback(async (session) => {
      const record = await DamageRecordModel.findById(id).session(
        session || null
      );
      if (!record) {
        throw new ApiError(HttpStatusCode.NOT_FOUND, "Damage record not found");
      }

      if (status === "Approved") {
        if (record.status !== "Pending") {
          throw new ApiError(
            HttpStatusCode.BAD_REQUEST,
            `Cannot approve a record with status: ${record.status}`
          );
        }

        // Deduct items from available stock in products collection
        for (const item of record.items) {
          const product = await ProductModel.findById(item.product_id).session(
            session || null
          );
          if (!product) {
            throw new ApiError(
              HttpStatusCode.NOT_FOUND,
              `Product not found: ${item.product_name}`
            );
          }

          const batch = product.batches.find(
            (b: any) =>
              b.batch_id === item.batch_id ||
              b._id?.toString() === item.batch_id
          );

          if (!batch) {
            throw new ApiError(
              HttpStatusCode.NOT_FOUND,
              `Batch ${item.batch_id} not found for product ${product.name}`
            );
          }

          const currentAvailable = Number(batch.packs_added) || 0;
          if (currentAvailable < item.qty) {
            throw new ApiError(
              HttpStatusCode.BAD_REQUEST,
              `Insufficient stock in batch ${batch.batch_id} for product ${product.name}. Available: ${currentAvailable}, Required: ${item.qty}`
            );
          }

          // Deduct from available stock
          batch.packs_added = currentAvailable - item.qty;
          await product.save({ session });
        }

        record.status = "Approved";
        record.approved_by = operator;
      } else if (status === "Rejected") {
        if (record.status !== "Pending") {
          throw new ApiError(
            HttpStatusCode.BAD_REQUEST,
            `Cannot reject a record with status: ${record.status}`
          );
        }
        record.status = "Rejected";
        record.approved_by = operator;
      } else if (status === "Disposed") {
        if (record.status !== "Approved") {
          throw new ApiError(
            HttpStatusCode.BAD_REQUEST,
            `Only Approved records can be Disposed. Current status: ${record.status}`
          );
        }
        record.status = "Disposed";
        record.approved_by = operator;
      } else {
        throw new ApiError(
          HttpStatusCode.BAD_REQUEST,
          `Invalid status value: ${status}`
        );
      }

      await record.save({ session });
      return record;
    });
  }

  async getAllDamageRecords(
    options: IPaginationOptions,
    search_query: string,
    filters: {
      start_date?: string;
      end_date?: string;
      status?: string;
      source_type?: string;
    } = {}
  ): Promise<any> {
    const {
      limit = 20,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = paginationHelpers.calculatePagination(options);

    const condition: any = {};

    if (search_query) {
      condition.$or = [
        { damage_number: { $regex: search_query, $options: "i" } },
        { damage_reason: { $regex: search_query, $options: "i" } },
        { created_by: { $regex: search_query, $options: "i" } },
        { "items.product_name": { $regex: search_query, $options: "i" } },
      ];
    }

    if (filters.status) {
      condition.status = filters.status;
    }

    if (filters.source_type) {
      condition.source_type = filters.source_type;
    }

    if (filters.start_date && filters.end_date) {
      condition.damage_date = {
        $gte: filters.start_date,
        $lte: filters.end_date,
      };
    } else if (filters.start_date) {
      condition.damage_date = { $gte: filters.start_date };
    } else if (filters.end_date) {
      condition.damage_date = { $lte: filters.end_date };
    }

    const result = await DamageRecordModel.find(condition)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    const total = await DamageRecordModel.countDocuments(condition);

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  }

  async getDamageStockSummary(
    options: IPaginationOptions,
    search_query: string
  ): Promise<any> {
    const {
      limit = 20,
      page = 1,
      skip,
    } = paginationHelpers.calculatePagination(options);

    // Aggregate damage items of Approved records (excluding rejected/disposed items)
    const matchCondition: any = { status: "Approved" };

    const pipeline: any[] = [
      { $match: matchCondition },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          company: "$productDetails.company_name",
          product: "$items.product_name",
          batch_id: "$items.batch_id",
          purchase_price: "$items.purchase_price",
          qty: "$items.qty",
          loss_amount: "$items.loss_amount",
        },
      },
      {
        $group: {
          _id: {
            product: "$product",
            batch_id: "$batch_id",
          },
          company: { $first: "$company" },
          purchase_price: { $first: "$purchase_price" },
          qty: { $sum: "$qty" },
          total_value: { $sum: "$loss_amount" },
        },
      },
      {
        $project: {
          _id: 0,
          company: 1,
          product: "$_id.product",
          batch_id: "$_id.batch_id",
          purchase_price: 1,
          qty: 1,
          total_value: 1,
        },
      },
    ];

    if (search_query) {
      pipeline.push({
        $match: {
          $or: [
            { product: { $regex: search_query, $options: "i" } },
            { company: { $regex: search_query, $options: "i" } },
            { batch_id: { $regex: search_query, $options: "i" } },
          ],
        },
      });
    }

    const allAggregated = await DamageRecordModel.aggregate(pipeline);
    const total = allAggregated.length;

    // Apply pagination sorting & skip/limit
    pipeline.push({ $skip: skip }, { $limit: limit });
    const paginated = await DamageRecordModel.aggregate(pipeline);

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: paginated,
    };
  }

  async getDamageReports(
    filters: { start_date?: string; end_date?: string } = {}
  ): Promise<any> {
    const matchCondition: any = { status: { $in: ["Approved", "Disposed"] } };

    if (filters.start_date && filters.end_date) {
      matchCondition.damage_date = {
        $gte: filters.start_date,
        $lte: filters.end_date,
      };
    }

    // 1. Total Metrics
    const totalSummary = await DamageRecordModel.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalLoss: { $sum: "$loss_amount" },
          totalQty: { $sum: "$qty" },
          totalRecords: { $sum: 1 },
        },
      },
    ]);

    const summary = totalSummary[0] || {
      totalLoss: 0,
      totalQty: 0,
      totalRecords: 0,
    };

    // 2. Loss by Source
    const lossBySource = await DamageRecordModel.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$source_type",
          loss: { $sum: "$loss_amount" },
          qty: { $sum: "$qty" },
        },
      },
      { $project: { source: "$_id", loss: 1, qty: 1, _id: 0 } },
    ]);

    // 3. Loss by Month (Monthly trend)
    const lossByMonth = await DamageRecordModel.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: { $substr: ["$damage_date", 0, 7] }, // YYYY-MM
          loss: { $sum: "$loss_amount" },
          qty: { $sum: "$qty" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: "$_id", loss: 1, qty: 1, _id: 0 } },
    ]);

    // 4. Loss by Product (Top products damaged)
    const lossByProduct = await DamageRecordModel.aggregate([
      { $match: matchCondition },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product_name",
          loss: { $sum: "$items.loss_amount" },
          qty: { $sum: "$items.qty" },
        },
      },
      { $sort: { loss: -1 } },
      { $limit: 10 },
      { $project: { product: "$_id", loss: 1, qty: 1, _id: 0 } },
    ]);

    // 5. Loss by Batch
    const lossByBatch = await DamageRecordModel.aggregate([
      { $match: matchCondition },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.batch_id",
          loss: { $sum: "$items.loss_amount" },
          qty: { $sum: "$items.qty" },
        },
      },
      { $sort: { loss: -1 } },
      { $limit: 10 },
      { $project: { batch: "$_id", loss: 1, qty: 1, _id: 0 } },
    ]);

    // 6. Loss by Delivery Representative (Delivery Man)
    const lossByDeliveryMan = await DamageRecordModel.aggregate([
      {
        $match: {
          ...matchCondition,
          source_type: "Delivery Settlement",
        },
      },
      {
        $group: {
          _id: "$created_by", // Contains the delivery man name
          loss: { $sum: "$loss_amount" },
          qty: { $sum: "$qty" },
        },
      },
      { $sort: { loss: -1 } },
      { $project: { deliveryMan: "$_id", loss: 1, qty: 1, _id: 0 } },
    ]);

    // 7. Loss by Warehouse (Warehouse damages)
    const lossByWarehouse = await DamageRecordModel.aggregate([
      {
        $match: {
          ...matchCondition,
          source_type: "Warehouse",
        },
      },
      {
        $group: {
          _id: "$damage_reason",
          loss: { $sum: "$loss_amount" },
          qty: { $sum: "$qty" },
        },
      },
      {
        $project: {
          reason: { $ifNull: ["$_id", "Unspecified Reason"] },
          loss: 1,
          qty: 1,
          _id: 0,
        },
      },
    ]);

    return {
      summary,
      lossBySource,
      lossByMonth,
      lossByProduct,
      lossByBatch,
      lossByDeliveryMan,
      lossByWarehouse,
    };
  }
}

export const DamageRecordService = new Service();
