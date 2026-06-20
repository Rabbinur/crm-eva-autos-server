import { ProductModel, generateBatchId } from "./product.model";
import { IBatch, IProduct } from "./product.interface";
import ApiError from "@/middlewares/error";
import { HttpStatusCode } from "@/lib/httpStatus";
import { IPaginationOptions } from "@/interfaces/pagination.interfaces";
import { paginationHelpers } from "@/helpers/paginationHelpers";
import { CategoryModel } from "../category/category.model";
import { CompanyModel } from "../company/company.model";
import { UnitModel } from "../unit/unit.model";

function calculateProductStock(product: any) {
  if (!product) return null;
  const productObj = product.toObject ? product.toObject() : product;
  const batches = productObj.batches || [];
  const carton_packets = productObj.carton_packets || 1;

  // Available stock
  const total_stock = batches.reduce(
    (sum: number, b: any) => sum + (Math.round(Number(b.packs_added)) || 0),
    0
  );

  // In-transit hold stock
  const total_hold_stock = batches.reduce(
    (sum: number, b: any) => sum + (Math.round(Number(b.hold_qty)) || 0),
    0
  );

  // Total physical stock (available + hold)
  const total_physical_stock = total_stock + total_hold_stock;

  // Available stock value (expected revenue)
  const total_stock_value = Number(
    batches
      .reduce(
        (sum: number, b: any) =>
          sum + (Number(b.packs_added) || 0) * (Number(b.pack_price) || 0),
        0
      )
      .toFixed(2)
  );

  // Hold stock value
  const total_hold_stock_value = Number(
    batches
      .reduce(
        (sum: number, b: any) =>
          sum + (Number(b.hold_qty) || 0) * (Number(b.pack_price) || 0),
        0
      )
      .toFixed(2)
  );

  // Total physical stock value
  const total_physical_stock_value = Number(
    (total_stock_value + total_hold_stock_value).toFixed(2)
  );

  // Calculate carton price ranges
  let minPurchase = 0;
  let maxPurchase = 0;
  let minSelling = 0;
  let maxSelling = 0;

  if (batches.length > 0) {
    const purchaseRates = batches.map(
      (b: any) => Number(b.purchase_rate_carton) || 0
    );
    const sellingRates = batches.map(
      (b: any) => Number(b.selling_rate_carton) || 0
    );
    minPurchase = Math.min(...purchaseRates);
    maxPurchase = Math.max(...purchaseRates);
    minSelling = Math.min(...sellingRates);
    maxSelling = Math.max(...sellingRates);
  }

  // Calculate weighted averages based on total physical quantities
  let weightedAvgPurchase = 0;
  let weightedAvgSelling = 0;

  const totalPhysicalQty = batches.reduce(
    (sum: number, b: any) =>
      sum + (Number(b.packs_added) || 0) + (Number(b.hold_qty) || 0),
    0
  );

  if (totalPhysicalQty > 0) {
    const totalPurchaseWeight = batches.reduce(
      (sum: number, b: any) =>
        sum +
        ((Number(b.packs_added) || 0) + (Number(b.hold_qty) || 0)) *
          (Number(b.purchase_rate_carton) || 0),
      0
    );
    const totalSellingWeight = batches.reduce(
      (sum: number, b: any) =>
        sum +
        ((Number(b.packs_added) || 0) + (Number(b.hold_qty) || 0)) *
          (Number(b.selling_rate_carton) || 0),
      0
    );
    weightedAvgPurchase = Number(
      (totalPurchaseWeight / totalPhysicalQty).toFixed(2)
    );
    weightedAvgSelling = Number(
      (totalSellingWeight / totalPhysicalQty).toFixed(2)
    );
  } else if (batches.length > 0) {
    // Fallback to simple average
    const sumPurchase = batches.reduce(
      (sum: number, b: any) => sum + (Number(b.purchase_rate_carton) || 0),
      0
    );
    const sumSelling = batches.reduce(
      (sum: number, b: any) => sum + (Number(b.selling_rate_carton) || 0),
      0
    );
    weightedAvgPurchase = Number((sumPurchase / batches.length).toFixed(2));
    weightedAvgSelling = Number((sumSelling / batches.length).toFixed(2));
  }

  // Calculate costs, margins and profit
  let estTotalPurchaseCost = 0;
  let estTotalHoldPurchaseCost = 0;
  let estProfit = 0;
  let estHoldProfit = 0;
  const enrichedBatches = batches.map((b: any) => {
    const bObj = b.toObject ? b.toObject() : b;
    const batch_id = bObj.batch_id || (bObj._id ? bObj._id.toString() : "");
    const id = bObj.id || batch_id;
    const qty = Number(bObj.packs_added) || 0;
    const hold = Number(bObj.hold_qty) || 0;
    const price = Number(bObj.pack_price) || 0;

    // Purchase rate per piece (acquisition rate)
    const purchasePricePerPiece =
      (Number(bObj.purchase_rate_carton) || 0) / carton_packets;

    // Available stock calculations
    const packs_total_price = Number((qty * price).toFixed(2));
    const purchase_cost = Number((qty * purchasePricePerPiece).toFixed(2));
    const profit = Number((packs_total_price - purchase_cost).toFixed(2));

    // Hold stock calculations
    const hold_total_price = Number((hold * price).toFixed(2));
    const hold_purchase_cost = Number(
      (hold * purchasePricePerPiece).toFixed(2)
    );
    const hold_profit = Number(
      (hold_total_price - hold_purchase_cost).toFixed(2)
    );

    // Aggregate totals
    estTotalPurchaseCost = Number(
      (estTotalPurchaseCost + purchase_cost).toFixed(2)
    );
    estTotalHoldPurchaseCost = Number(
      (estTotalHoldPurchaseCost + hold_purchase_cost).toFixed(2)
    );
    estProfit = Number((estProfit + profit).toFixed(2));
    estHoldProfit = Number((estHoldProfit + hold_profit).toFixed(2));

    return {
      id,
      batch_id,
      ...bObj,
      packs_total_price,
      purchase_cost,
      profit,
      hold_total_price,
      hold_purchase_cost,
      hold_profit,
    };
  });

  // Calculate overall profit margin percentage
  let profitMarginPercent = 0;
  if (estTotalPurchaseCost > 0) {
    profitMarginPercent = Number(
      ((estProfit / estTotalPurchaseCost) * 100).toFixed(2)
    );
  } else if (total_stock_value > 0) {
    profitMarginPercent = 100.0;
  }

  // Carton and box conversion calculations for available stock
  const has_box_size =
    !!productObj.box_size && productObj.box_size < carton_packets;
  const box_size = has_box_size ? productObj.box_size : carton_packets;

  const cartons = Math.floor(total_stock / carton_packets);
  const remainingAfterCartons = total_stock % carton_packets;
  const boxes = has_box_size ? Math.floor(remainingAfterCartons / box_size) : 0;
  const pieces = has_box_size
    ? remainingAfterCartons % box_size
    : remainingAfterCartons;

  const equivalent_stock = `${cartons} Ctn${has_box_size ? `, ${boxes} Box` : ""}, ${pieces} Pcs`;

  // Carton and box conversion calculations for hold stock
  const hold_cartons = Math.floor(total_hold_stock / carton_packets);
  const hold_remaining = total_hold_stock % carton_packets;
  const hold_boxes = has_box_size ? Math.floor(hold_remaining / box_size) : 0;
  const hold_pieces = has_box_size ? hold_remaining % box_size : hold_remaining;

  const equivalent_hold_stock = `${hold_cartons} Ctn${has_box_size ? `, ${hold_boxes} Box` : ""}, ${hold_pieces} Pcs`;

  return {
    ...productObj,
    total_stock,
    total_hold_stock,
    total_physical_stock,
    total_stock_value,
    total_hold_stock_value,
    total_physical_stock_value,
    minPurchase,
    maxPurchase,
    minSelling,
    maxSelling,
    weightedAvgPurchase,
    weightedAvgSelling,
    estTotalPurchaseCost,
    estTotalHoldPurchaseCost,
    estProfit,
    estHoldProfit,
    profitMarginPercent,
    cartons,
    boxes,
    pieces,
    hold_cartons,
    hold_boxes,
    hold_pieces,
    has_box_size,
    equivalent_stock,
    equivalent_hold_stock,
    batches: enrichedBatches,
  };
}

class Service {
  async createProduct(data: IProduct) {
    const isExist = await ProductModel.findOne({
      name: data.name,
      category_name: data.category_name,
      company_name: data.company_name,
    });
    if (isExist) {
      throw new ApiError(
        HttpStatusCode.CONFLICT,
        "Product with this name already exists for this company in this category"
      );
    }

    // Auto-generate BAT-XXXXXX IDs for new batches
    if (data.batches) {
      data.batches = data.batches.map((b) => {
        if (!b.batch_id || !b.batch_id.startsWith("BAT-")) {
          b.batch_id = generateBatchId();
        }
        return b;
      });
    }

    // Auto-upsert Category, Company, and Unit if they don't exist
    if (data.category_name) {
      await CategoryModel.findOneAndUpdate(
        { name: data.category_name },
        { name: data.category_name, status: "Active" },
        { upsert: true, new: true }
      );
    }
    if (data.company_name) {
      await CompanyModel.findOneAndUpdate(
        { name: data.company_name },
        { name: data.company_name, status: "Active" },
        { upsert: true, new: true }
      );
    }
    if (data.unit) {
      await UnitModel.findOneAndUpdate(
        { name: data.unit },
        { name: data.unit, status: "Active" },
        { upsert: true, new: true }
      );
    }

    const created = await ProductModel.create(data);
    return calculateProductStock(created);
  }

  async getAllProducts(options: IPaginationOptions, search_query: string) {
    const {
      limit = 10,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = paginationHelpers.calculatePagination(options);

    const searchCondition: any = {};
    if (search_query) {
      searchCondition.$or = [
        { name: { $regex: search_query, $options: "i" } },
        { company_name: { $regex: search_query, $options: "i" } },
        { category_name: { $regex: search_query, $options: "i" } },
      ];
    }

    const result = await ProductModel.find({ ...searchCondition })
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    const total = await ProductModel.countDocuments(searchCondition);

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result.map(calculateProductStock),
    };
  }

  async getProductById(id: string) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Product not found");
    }
    return calculateProductStock(product);
  }

  async updateProduct(id: string, data: Partial<IProduct>) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Product not found");
    }

    if (data.name || data.category_name || data.company_name) {
      const nameToCheck = data.name || product.name;
      const categoryToCheck = data.category_name || product.category_name;
      const companyToCheck = data.company_name || product.company_name;
      const isExist = await ProductModel.findOne({
        name: nameToCheck,
        category_name: categoryToCheck,
        company_name: companyToCheck,
        _id: { $ne: id },
      });
      if (isExist) {
        throw new ApiError(
          HttpStatusCode.CONFLICT,
          "Product with this name already exists for this company in this category"
        );
      }
    }

    // Auto-generate BAT-XXXXXX IDs for new batches during edit
    if (data.batches) {
      data.batches = data.batches.map((b) => {
        if (!b.batch_id || !b.batch_id.startsWith("BAT-")) {
          b.batch_id = generateBatchId();
        }
        return b;
      });
    }

    const updated = await ProductModel.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    );
    return calculateProductStock(updated);
  }

  async deleteProduct(id: string) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Product not found");
    }
    return await ProductModel.findByIdAndDelete(id);
  }

  async addBatch(productId: string, batch: IBatch) {
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Product not found");
    }

    // Auto-generate BAT-XXXXXX ID for restocked batch
    if (!batch.batch_id || !batch.batch_id.startsWith("BAT-")) {
      batch.batch_id = generateBatchId();
    }

    product.batches.push(batch);
    const saved = await product.save();
    return calculateProductStock(saved);
  }
}

export const ProductService = new Service();
