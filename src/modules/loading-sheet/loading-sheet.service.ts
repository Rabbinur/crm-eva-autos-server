import mongoose from "mongoose";
import {
  LoadingSheetModel,
  LoadingSheetDetailModel,
} from "./loading-sheet.model";
import { ILoadingSheetItem } from "./loading-sheet.interface";
import { ProductModel } from "../product/product.model";
import { DeliveryManModel } from "../delivery-man/delivery-man.model";
import ApiError from "@/middlewares/error";
import { HttpStatusCode } from "@/lib/httpStatus";
import { IPaginationOptions } from "@/interfaces/pagination.interfaces";
import { paginationHelpers } from "@/helpers/paginationHelpers";

/**
 * Executes a callback within a Mongoose transaction if supported.
 * Falls back to standard execution with OCC version verification if standalone MongoDB.
 */
async function runTransactionWithFallback<T>(
  fn: (session?: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  let session: mongoose.ClientSession | undefined;
  try {
    session = await mongoose.startSession();
    let result: T;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result!;
  } catch (error: any) {
    const isNotSupported =
      error.message?.includes("transaction") ||
      error.message?.includes("replica set") ||
      error.message?.includes("standalone") ||
      error.code === 20 ||
      error.code === 263;

    if (isNotSupported) {
      console.warn(
        "⚠️ Mongoose transactions are not supported on this MongoDB deployment. Falling back to non-transactional execution with OCC."
      );
      return await fn();
    }
    throw error;
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

class Service {
  async createLoadingSheet(data: any): Promise<any> {
    return await runTransactionWithFallback(async (session) => {
      // Verify active delivery man
      const deliveryMan = await DeliveryManModel.findById(
        data.deliveryManId
      ).session(session || null);
      if (!deliveryMan) {
        throw new ApiError(
          HttpStatusCode.NOT_FOUND,
          "Delivery representative not found"
        );
      }
      if (deliveryMan.status !== "active") {
        throw new ApiError(
          HttpStatusCode.BAD_REQUEST,
          "Selected delivery representative is inactive"
        );
      }

      // 1. Create LoadingSheet record
      const loadingSheetDoc = new LoadingSheetModel({
        delivery_man_id: data.deliveryManId,
        delivery_man_name: data.deliveryManName,
        status: data.status || "loaded",
        loading_date: data.date ? new Date(data.date) : new Date(),
        route: data.route,
      });

      const savedSheet = await loadingSheetDoc.save({ session });

      // 2. Perform FIFO allocation and create details
      const items = data.items || [];
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

        // Calculate total available stock across all batches
        const totalAvailable = product.batches.reduce(
          (sum, b) => sum + (Number(b.packs_added) || 0),
          0
        );

        if (totalAvailable < item.quantity) {
          throw new ApiError(
            HttpStatusCode.BAD_REQUEST,
            `Insufficient stock for product ${product.name}. Available: ${totalAvailable}, Requested: ${item.quantity}`
          );
        }

        // Sort batches oldest first
        product.batches.sort(
          (a, b) =>
            new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
        );

        let qtyNeeded = item.quantity;
        for (const batch of product.batches) {
          if (qtyNeeded <= 0) break;
          const available = Number(batch.packs_added) || 0;
          if (available <= 0) continue;

          const allocated = Math.min(qtyNeeded, available);

          // Calculate rates per piece
          const cartonPackets = product.carton_packets || 1;
          const purchasePrice =
            Number(batch.purchase_rate_carton) / cartonPackets;
          const sellingPrice = Number(batch.pack_price) || 0;

          // Create LoadingSheetDetail
          const detail = new LoadingSheetDetailModel({
            loading_sheet_id: savedSheet._id,
            product_id: product._id.toString(),
            product_name: product.name,
            batch_id: batch._id,
            loaded_qty: allocated,
            sold_qty: 0,
            returned_qty: 0,
            damaged_qty: 0,
            free_qty: 0,
            purchase_price: purchasePrice,
            selling_price: sellingPrice,
          });

          await detail.save({ session });

          // Update batch quantities
          batch.packs_added = available - allocated;
          batch.hold_qty = (Number(batch.hold_qty) || 0) + allocated;

          qtyNeeded -= allocated;
        }

        // Save updated product
        await product.save({ session });
      }

      return await this.getLoadingSheetById(savedSheet._id.toString(), session);
    });
  }

  async getAllLoadingSheets(
    options: IPaginationOptions,
    search_query: string
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
        { delivery_man_name: { $regex: search_query, $options: "i" } },
        { route: { $regex: search_query, $options: "i" } },
        { status: { $regex: search_query, $options: "i" } },
      ];
    }

    const sheets = await LoadingSheetModel.find({ ...searchCondition })
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const result = [];
    for (const sheet of sheets) {
      const details = await LoadingSheetDetailModel.find({
        loading_sheet_id: sheet._id,
      }).lean();
      const items = this.groupDetailsToItems(details);
      const totalCost = items.reduce(
        (s, i) => s + i.quantity * i.purchasePrice,
        0
      );
      const totalExpectedSales = items.reduce(
        (s, i) => s + i.quantity * i.sellingPrice,
        0
      );

      result.push({
        id: sheet._id.toString(),
        invoiceNo:
          sheet.invoice_no ||
          `INV-${sheet._id.toString().slice(-6).toUpperCase()}`,
        date: sheet.loading_date
          ? new Date(sheet.loading_date).toISOString().slice(0, 10)
          : "",
        deliveryManName: sheet.delivery_man_name,
        deliveryManId: sheet.delivery_man_id,
        route: sheet.route,
        status: sheet.status,
        items,
        totalCost,
        totalExpectedSales,
      });
    }

    const total = await LoadingSheetModel.countDocuments(searchCondition);

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  }

  async getLoadingSheetById(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<any> {
    const sheet = await LoadingSheetModel.findById(id)
      .session(session || null)
      .lean();
    if (!sheet) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Loading sheet not found");
    }

    const details = await LoadingSheetDetailModel.find({
      loading_sheet_id: sheet._id,
    })
      .session(session || null)
      .lean();

    const items = this.groupDetailsToItems(details);
    const totalCost = items.reduce(
      (s, i) => s + i.quantity * i.purchasePrice,
      0
    );
    const totalExpectedSales = items.reduce(
      (s, i) => s + i.quantity * i.sellingPrice,
      0
    );

    return {
      id: sheet._id.toString(),
      invoiceNo:
        sheet.invoice_no ||
        `INV-${sheet._id.toString().slice(-6).toUpperCase()}`,
      date: sheet.loading_date
        ? new Date(sheet.loading_date).toISOString().slice(0, 10)
        : "",
      deliveryManName: sheet.delivery_man_name,
      deliveryManId: sheet.delivery_man_id,
      route: sheet.route,
      status: sheet.status,
      items,
      totalCost,
      totalExpectedSales,
    };
  }

  async updateLoadingSheet(id: string, data: any): Promise<any> {
    return await runTransactionWithFallback(async (session) => {
      const sheet = await LoadingSheetModel.findById(id).session(
        session || null
      );
      if (!sheet) {
        throw new ApiError(HttpStatusCode.NOT_FOUND, "Loading sheet not found");
      }

      // Map fields from camelCase to snake_case if present
      if (data.deliveryManId !== undefined)
        sheet.delivery_man_id = data.deliveryManId;
      if (data.deliveryManName !== undefined)
        sheet.delivery_man_name = data.deliveryManName;
      if (data.status !== undefined) sheet.status = data.status;
      if (data.route !== undefined) sheet.route = data.route;
      if (data.date !== undefined) sheet.loading_date = new Date(data.date);

      await sheet.save({ session });
      return await this.getLoadingSheetById(id, session);
    });
  }

  async deleteLoadingSheet(id: string): Promise<any> {
    return await runTransactionWithFallback(async (session) => {
      const sheet = await LoadingSheetModel.findById(id).session(
        session || null
      );
      if (!sheet) {
        throw new ApiError(HttpStatusCode.NOT_FOUND, "Loading sheet not found");
      }

      // If the sheet is loaded or in transit, we release the hold stock back to available
      if (sheet.status !== "settled") {
        const details = await LoadingSheetDetailModel.find({
          loading_sheet_id: sheet._id,
        }).session(session || null);
        for (const detail of details) {
          const product = await ProductModel.findById(
            detail.product_id
          ).session(session || null);
          if (product) {
            const batch = product.batches.find(
              (b: any) => b._id?.toString() === detail.batch_id.toString()
            );
            if (batch) {
              const hold = Number(batch.hold_qty) || 0;
              const currentAvailable = Number(batch.packs_added) || 0;
              const loaded = Number(detail.loaded_qty) || 0;

              // Move hold back to available
              batch.hold_qty = Math.max(0, hold - loaded);
              batch.packs_added = currentAvailable + Math.min(hold, loaded);
              await product.save({ session });
            }
          }
        }
      }

      // Delete details and the sheet
      await LoadingSheetDetailModel.deleteMany({
        loading_sheet_id: sheet._id,
      }).session(session || null);
      await LoadingSheetModel.findByIdAndDelete(sheet._id).session(
        session || null
      );

      return null;
    });
  }

  /**
   * Reconstructs a list of product-level items from batch-wise details.
   */
  private groupDetailsToItems(details: any[]): ILoadingSheetItem[] {
    const itemsMap: Record<string, ILoadingSheetItem> = {};
    for (const d of details) {
      const prodId = d.product_id;
      if (!itemsMap[prodId]) {
        itemsMap[prodId] = {
          productId: prodId,
          productName: d.product_name,
          quantity: 0,
          purchasePrice: d.purchase_price,
          sellingPrice: d.selling_price,
          soldQuantity: 0,
          returnedQuantity: 0,
          damagedQuantity: 0,
          freeQuantity: 0,
        };
      }
      itemsMap[prodId].quantity += Number(d.loaded_qty) || 0;
      itemsMap[prodId].soldQuantity! += Number(d.sold_qty) || 0;
      itemsMap[prodId].returnedQuantity! += Number(d.returned_qty) || 0;
      itemsMap[prodId].damagedQuantity! += Number(d.damaged_qty) || 0;
      itemsMap[prodId].freeQuantity! += Number(d.free_qty) || 0;
    }
    return Object.values(itemsMap);
  }
}

export const LoadingSheetService = new Service();
export { runTransactionWithFallback };
