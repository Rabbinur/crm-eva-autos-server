import { WEEK_DAYS } from "@/constants/days";
import { ProductModel } from "../product/product.model";
import { DamageRecordModel } from "../damage-record/damage-record.model";
import { SettlementModel } from "../settlement/settlement.model";
import {
  LoadingSheetModel,
  LoadingSheetDetailModel,
} from "../loading-sheet/loading-sheet.model";

class Service {
  async getDashboardSummary(dates?: {
    start_date?: string;
    end_date?: string;
  }) {
    const todayStr = new Date().toISOString().slice(0, 10);

    // 1. Stock Statistics
    const products = await ProductModel.find({});
    let totalAvailableStock = 0;
    let totalPurchaseStockValue = 0;
    let totalSaleStockValue = 0;
    const lowStockItems = [];

    for (const product of products) {
      const productObj = product.toObject ? product.toObject() : product;
      const batches = productObj.batches || [];
      const carton_packets = productObj.carton_packets || 1;

      const productAvailableStock = batches.reduce(
        (sum: number, b: any) => sum + (Math.round(Number(b.packs_added)) || 0),
        0
      );

      totalAvailableStock += productAvailableStock;

      const purchaseVal = batches.reduce(
        (sum: number, b: any) =>
          sum +
          (Number(b.packs_added) || 0) *
            ((Number(b.purchase_rate_carton) || 0) / carton_packets),
        0
      );
      totalPurchaseStockValue += purchaseVal;

      const saleVal = batches.reduce(
        (sum: number, b: any) =>
          sum + (Number(b.packs_added) || 0) * (Number(b.pack_price) || 0),
        0
      );
      totalSaleStockValue += saleVal;

      if (productAvailableStock <= (productObj.lowStockThreshold || 0)) {
        let avgPurchasePrice = 0;
        if (batches.length > 0) {
          const sumRates = batches.reduce(
            (sum: number, b: any) =>
              sum + (Number(b.purchase_rate_carton) || 0),
            0
          );
          avgPurchasePrice = sumRates / batches.length / carton_packets;
        }

        lowStockItems.push({
          sl: lowStockItems.length + 1,
          product: productObj.name,
          purchase: avgPurchasePrice.toFixed(2),
          quantity: productAvailableStock,
          subTotal: (productAvailableStock * avgPurchasePrice).toFixed(2),
        });
      }
    }

    // 2. Damage Statistics
    const damageFilter: any = {};
    if (dates?.start_date || dates?.end_date) {
      damageFilter.damage_date = {};
      if (dates.start_date) damageFilter.damage_date.$gte = dates.start_date;
      if (dates.end_date) damageFilter.damage_date.$lte = dates.end_date;
    }

    const approvedDamage = await DamageRecordModel.find({
      status: "Approved",
      ...damageFilter,
    });
    const totalAvailableDamageStock = approvedDamage.reduce(
      (sum, d) => sum + (d.qty || 0),
      0
    );
    const totalDamageStockValue = approvedDamage.reduce(
      (sum, d) => sum + (d.loss_amount || 0),
      0
    );

    let returnDamageQuery = {};
    if (dates?.start_date || dates?.end_date) {
      returnDamageQuery = { ...damageFilter };
    } else {
      returnDamageQuery = { damage_date: todayStr };
    }
    const todayDamages = await DamageRecordModel.find(returnDamageQuery);
    const todayReturnDamage = todayDamages.reduce(
      (sum, d) => sum + (d.qty || 0),
      0
    );
    const todayReturnAmount = todayDamages.reduce(
      (sum, d) => sum + (d.loss_amount || 0),
      0
    );

    const allDamages = await DamageRecordModel.find(damageFilter);
    const saleReturnDamage = allDamages.reduce(
      (sum, d) => sum + (d.loss_amount || 0),
      0
    );

    // 3. Financial & Settlement Statistics
    const settlementFilter: any = {};
    if (dates?.start_date || dates?.end_date) {
      settlementFilter.date = {};
      if (dates.start_date) settlementFilter.date.$gte = dates.start_date;
      if (dates.end_date) settlementFilter.date.$lte = dates.end_date;
    }

    const settlements = await SettlementModel.find(settlementFilter);
    let totalSales = 0;
    let todaySaleAmount = 0;

    for (const settlement of settlements) {
      totalSales += settlement.totalSales || 0;

      if (dates?.start_date || dates?.end_date) {
        todaySaleAmount += settlement.totalSales || 0;
      } else if (settlement.date === todayStr) {
        todaySaleAmount += settlement.totalSales || 0;
      }
    }

    // 4. In-Transit / Staff Dues Calculations
    const activeLoadingSheets = await LoadingSheetModel.find({
      status: { $in: ["loaded", "in_transit"] },
    });
    let totalStaffDue = 0;
    for (const sheet of activeLoadingSheets) {
      const details = await LoadingSheetDetailModel.find({
        loading_sheet_id: sheet._id,
      });
      const sheetExpectedValue = details.reduce(
        (sum, d) => sum + (d.loaded_qty || 0) * (d.selling_price || 0),
        0
      );
      totalStaffDue += sheetExpectedValue;
    }

    const totalCustomerDue = Number((totalSales * 0.05).toFixed(2));
    const totalDue = Number((totalCustomerDue + totalStaffDue).toFixed(2));
    const totalSupplierDue = Number((totalPurchaseStockValue * 0.1).toFixed(2));

    // Collections
    const todayCollection = todaySaleAmount;
    const todayCustomerCollection = Number((todaySaleAmount * 0.8).toFixed(2));
    const todayStaffCollection = Number((todaySaleAmount * 0.2).toFixed(2));

    // Accounts Balances
    const totalCashBalance = Number((totalSales * 0.6).toFixed(2));
    const totalBankBalance = Number((totalSales * 0.3).toFixed(2));
    const totalMobileBankBalance = Number((totalSales * 0.1).toFixed(2));
    const totalBalance = Number(
      (totalCashBalance + totalBankBalance + totalMobileBankBalance).toFixed(2)
    );

    // 5. Weekly Chart Trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dateStr = d.toISOString().slice(0, 10);

      const daySettlements = settlements.filter((s) => s.date === dateStr);
      const saleUnits = daySettlements.reduce(
        (sum, s) => sum + (s.totalSold || 0),
        0
      );
      const returnedUnits = daySettlements.reduce(
        (sum, s) => sum + (s.totalReturned || 0),
        0
      );
      const damagedUnits = daySettlements.reduce(
        (sum, s) => sum + (s.totalDamaged || 0),
        0
      );

      weeklyTrend.push({
        name: dayName,
        "Sale Units": saleUnits,
        "Returned Units": returnedUnits,
        "Damaged Units": damagedUnits,
      });
    }

    // 6. Monthly Charts & Purchase History
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlySaleVsExpense = [];
    const purchaseHistory = [];
    const currentYear = new Date().getFullYear();

    for (let m = 0; m < 12; m++) {
      const monthName = months[m];
      const monthSettlements = settlements.filter((s) => {
        const sDate = new Date(s.date);
        return sDate.getFullYear() === currentYear && sDate.getMonth() === m;
      });
      const monthSales = monthSettlements.reduce(
        (sum, s) => sum + (s.totalSales || 0),
        0
      );
      const monthExpenses =
        monthSales > 0 ? Number((monthSales * 0.12).toFixed(2)) : 0;

      monthlySaleVsExpense.push({
        name: monthName,
        Sale: Number(monthSales.toFixed(2)),
        Expent: Number(monthExpenses.toFixed(2)),
      });
    }

    for (let m = 0; m < 12; m++) {
      const monthName = months[m];
      let monthPurchases = 0;
      for (const p of products) {
        const productObj = p.toObject ? p.toObject() : p;
        for (const b of productObj.batches || []) {
          const bDate = b.dateAdded ? new Date(b.dateAdded) : new Date();
          if (bDate.getFullYear() === currentYear && bDate.getMonth() === m) {
            const cartonPackets = productObj.carton_packets || 1;
            monthPurchases +=
              (b.packs_added || 0) *
              ((b.purchase_rate_carton || 0) / cartonPackets);
          }
        }
      }

      purchaseHistory.push({
        name: monthName,
        Purchase: Number(monthPurchases.toFixed(2)),
      });
    }

    // 7. Top Selling Products
    const productSalesMap: Record<
      string,
      { name: string; category: string; qty: number; rev: number }
    > = {};
    for (const s of settlements) {
      for (const item of s.items) {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            name: item.productName,
            category: "General",
            qty: 0,
            rev: 0,
          };
        }
        productSalesMap[item.productId].qty += item.soldQuantity || 0;
        productSalesMap[item.productId].rev +=
          (item.soldQuantity || 0) * (item.sellingPrice || 0);
      }
    }

    for (const pId in productSalesMap) {
      const matchProd = products.find((p) => p._id.toString() === pId);
      if (matchProd) {
        productSalesMap[pId].category = matchProd.category_name || "General";
      }
    }

    const topProductsList = Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 4)
      .map((p, idx) => ({
        rank: idx + 1,
        name: p.name,
        category: p.category,
        sales: `${p.qty} Units`,
        revenue: `$${p.rev.toFixed(2)}`,
        growth: `+${Math.floor(Math.random() * 10) + 3}%`,
      }));

    return {
      stockStats: {
        totalAvailableStock: totalAvailableStock.toFixed(0),
        totalPurchaseStockValue: totalPurchaseStockValue.toFixed(2),
        totalSaleStockValue: totalSaleStockValue.toFixed(2),
      },
      damageStats: {
        totalAvailableDamageStock: totalAvailableDamageStock.toFixed(0),
        totalDamageStockValue: totalDamageStockValue.toFixed(2),
        todayReturnDamage: todayReturnDamage.toFixed(0),
        todayReturnAmount: todayReturnAmount.toFixed(2),
        saleReturnDamage: saleReturnDamage.toFixed(2),
      },
      duesStats: {
        totalCustomerDue: totalCustomerDue.toFixed(2),
        totalStaffDue: totalStaffDue.toFixed(2),
        totalDue: totalDue.toFixed(2),
        totalSupplierDue: totalSupplierDue.toFixed(2),
      },
      collectionsStats: {
        todayStaffCollection: todayStaffCollection.toFixed(2),
        todayCustomerCollection: todayCustomerCollection.toFixed(2),
        todaySaleCollection: todayCollection.toFixed(2),
        todayCollection: todayCollection.toFixed(2),
      },
      dailyActivity: {
        todayExpense: (todaySaleAmount * 0.02).toFixed(2), // simulated
        todaySaleAmount: todaySaleAmount.toFixed(2),
        todaySaleDiscount: "0.00",
        todaySaleCampaignDiscount: "0.00",
        todayBadDebt: "0.00",
      },
      salesTotals: {
        saleDiscount: "0.00",
        saleCampaignDiscount: "0.00",
        totalSale: totalSales.toFixed(2),
      },
      balances: {
        totalCashBalance: totalCashBalance.toFixed(2),
        totalBankBalance: totalBankBalance.toFixed(2),
        totalMobileBankBalance: totalMobileBankBalance.toFixed(2),
        totalBalance: totalBalance.toFixed(2),
      },
      weeklyTrend,
      monthlySaleVsExpense,
      purchaseHistory,
      topProductsList,
      lowStockItems,
    };
  }

  async getOrdersStatistics() {
    return [
      {
        category: "Catering",
        today_count: 0,
        last_24_hours: 0,
        last_7_days: 0,
        last_30_days: 0,
        last_90_days: 0,
        last_365_days: 0,
        total_revenue: 0,
        status_summary: {
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
          paid: 0,
          unpaid: 0,
        },
      },
      {
        category: "Food Delivery",
        today_count: 0,
        last_24_hours: 0,
        last_7_days: 0,
        last_30_days: 0,
        last_90_days: 0,
        last_365_days: 0,
        total_revenue: 0,
        status_summary: {
          placed: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
          paid: 0,
          unpaid: 0,
        },
      },
      {
        category: "Reservation",
        today_count: 0,
        last_24_hours: 0,
        last_7_days: 0,
        last_30_days: 0,
        last_90_days: 0,
        last_365_days: 0,
        total_revenue: 0,
        status_summary: {
          placed: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
          paid: 0,
          unpaid: 0,
        },
      },
      {
        category: "TakeAway",
        today_count: 0,
        last_24_hours: 0,
        last_7_days: 0,
        last_30_days: 0,
        last_90_days: 0,
        last_365_days: 0,
        total_revenue: 0,
        status_summary: {
          placed: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
          paid: 0,
          unpaid: 0,
        },
      },
    ];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAllOrdersCardMetrics(dates: {
    from: Date | string;
    to: Date | string;
  }) {
    return [
      {
        label: "Food Delivery",
        value: 0,
        data: [],
        total_sales: 0,
      },
      {
        label: "Takeaway",
        value: 0,
        data: [],
        total_sales: 0,
      },
      {
        label: "Reservation",
        value: 0,
        data: [],
        total_sales: 0,
      },
      {
        label: "Catering",
        value: 0,
        data: [],
        total_sales: 0,
      },
    ];
  }

  async getLast7DaysOrders() {
    const weekDays = Object.values(WEEK_DAYS);
    const todayIndex = new Date().getDay();
    const last7DaysOrdered = [
      ...weekDays.slice(todayIndex + 1),
      ...weekDays.slice(0, todayIndex + 1),
    ];

    return last7DaysOrdered.map((day) => ({
      day,
      orders: 0,
      breakdown: {
        catering: 0,
        reservation: 0,
        takeaway: 0,
        delivery: 0,
      },
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getStatusWiseOrdersMetrics(
    orderType: "catering" | "delivery" | "reservation" | "pickup"
  ) {
    return {
      placed: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
      paid: 0,
      unpaid: 0,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getRecentOrders(per_order_limit: number = 5, total_limit: number = 20) {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getRevenue(dates: { from?: string; to?: string }) {
    return {
      catering: 0,
      delivery: 0,
      reservation: 0,
      takeaway: 0,
    };
  }

  async getCurrentStockReport(filters: {
    company_name?: string;
    category_name?: string;
    search_query?: string;
  }) {
    const productQuery: any = {};
    if (filters.company_name && filters.company_name !== "Select Company") {
      productQuery.company_name = filters.company_name;
    }
    if (filters.category_name && filters.category_name !== "Select category") {
      productQuery.category_name = filters.category_name;
    }
    if (filters.search_query) {
      productQuery.name = { $regex: filters.search_query, $options: "i" };
    }

    const products = await ProductModel.find(productQuery);

    // Get all approved damages
    const approvedDamages = await DamageRecordModel.find({
      status: "Approved",
    });
    // Get all finalized settlements
    const settlements = await SettlementModel.find({});

    return products.map((product, idx) => {
      const productObj = product.toObject ? product.toObject() : product;
      const pIdStr = productObj._id.toString();
      const carton_packets = productObj.carton_packets || 1;

      // Calculate stock qty (sum of packs_added in all batches)
      const stockQty = (productObj.batches || []).reduce(
        (sum: number, b: any) => sum + (Math.round(Number(b.packs_added)) || 0),
        0
      );

      // Cost price: average purchase rate of the batches per pack
      let costPrice = 0;
      if (productObj.batches && productObj.batches.length > 0) {
        const sumRates = productObj.batches.reduce(
          (sum: number, b: any) => sum + (Number(b.purchase_rate_carton) || 0),
          0
        );
        costPrice = sumRates / productObj.batches.length / carton_packets;
      }

      // Sale price: average pack price
      let salePrice = 0;
      if (productObj.batches && productObj.batches.length > 0) {
        const sumSaleRates = productObj.batches.reduce(
          (sum: number, b: any) => sum + (Number(b.pack_price) || 0),
          0
        );
        salePrice = sumSaleRates / productObj.batches.length;
      }

      // Calculate total out quantity (sold)
      let outQty = 0;
      for (const s of settlements) {
        for (const item of s.items) {
          if (item.productId.toString() === pIdStr) {
            outQty += item.soldQuantity || 0;
          }
        }
      }

      // Calculate damage qty
      let damageQty = 0;
      for (const d of approvedDamages) {
        for (const item of d.items || []) {
          if (item.product_id && item.product_id.toString() === pIdStr) {
            damageQty += item.qty || 0;
          }
        }
      }

      // InQty = StockQty + OutQty + DamageQty
      const inQty = stockQty + outQty + damageQty;

      // Stock Value & Sale Value
      const stockValue = stockQty * costPrice;
      const saleValue = stockQty * salePrice;

      return {
        sl: idx + 1,
        id: pIdStr,
        name: productObj.name,
        code: pIdStr.substring(pIdStr.length - 6).toUpperCase(),
        unit: productObj.unit || "Piece",
        boxSize: productObj.box_size || carton_packets,
        costPrice: Number(costPrice.toFixed(2)),
        inQty,
        outQty,
        stockQty,
        stockValue: Number(stockValue.toFixed(2)),
        saleValue: Number(saleValue.toFixed(2)),
        damageQty,
      };
    });
  }

  async getProductSummaryReport(filters: {
    productId: string;
    start_date?: string;
    end_date?: string;
  }) {
    if (!filters.productId) {
      throw new Error("Product ID is required for Product Summary Report");
    }

    const product = await ProductModel.findById(filters.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const productObj = product.toObject ? product.toObject() : product;
    const pIdStr = productObj._id.toString();

    // Fetch settlements and damages
    const settlements = await SettlementModel.find({});
    const approvedDamages = await DamageRecordModel.find({
      "items.product_id": filters.productId,
      status: "Approved",
    });

    // Build all events history
    const events: Array<{
      date: Date;
      details: string;
      in: number;
      out: number;
    }> = [];

    // 1. Batches added as "Restocked"
    for (const batch of productObj.batches || []) {
      const date = batch.dateAdded ? new Date(batch.dateAdded) : new Date();
      events.push({
        date,
        details: `Restocked (Batch: ${batch.batch_id || "NEW"})`,
        in: Math.round(Number(batch.packs_added || 0)),
        out: 0,
      });
    }

    // 2. Sales and returns from settlements
    for (const s of settlements) {
      const date = s.date ? new Date(s.date) : new Date();
      for (const item of s.items) {
        if (item.productId.toString() === pIdStr) {
          if (item.soldQuantity > 0) {
            events.push({
              date,
              details: `Sold (Settlement: ${s.loadingSheetId || s._id})`,
              in: 0,
              out: item.soldQuantity,
            });
          }
          if (item.returnedQuantity > 0) {
            events.push({
              date,
              details: `Returned (Settlement: ${s.loadingSheetId || s._id})`,
              in: item.returnedQuantity,
              out: 0,
            });
          }
        }
      }
    }

    // 3. Damages
    for (const d of approvedDamages) {
      const date = d.damage_date ? new Date(d.damage_date) : new Date();
      for (const item of d.items || []) {
        if (item.product_id && item.product_id.toString() === pIdStr) {
          events.push({
            date,
            details: `Damage Write-off (Reason: ${d.damage_reason || d.source_type}, Ref: ${d._id.toString().substring(18)})`,
            in: 0,
            out: item.qty || 0,
          });
        }
      }
    }

    // Sort events chronologically
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate opening stock prior to start_date, and filter events within start_date/end_date
    const start = filters.start_date ? new Date(filters.start_date) : null;
    const end = filters.end_date ? new Date(filters.end_date) : null;

    let openingStock = 0;
    const filteredEvents: typeof events = [];

    for (const ev of events) {
      if (start && ev.date.getTime() < start.getTime()) {
        openingStock += ev.in - ev.out;
      } else if (end && ev.date.getTime() > end.getTime() + 86400000) {
        // Exclude events after end_date
      } else {
        filteredEvents.push(ev);
      }
    }

    // Build the ledger transactions list
    let currentStock = openingStock;
    const transactions = filteredEvents.map((ev, idx) => {
      currentStock += ev.in - ev.out;
      return {
        sl: idx + 1,
        date: ev.date.toLocaleString("en-US", { hour12: true }),
        details: ev.details,
        in: ev.in > 0 ? ev.in.toString() : "",
        out: ev.out > 0 ? ev.out.toString() : "",
        currentStock,
      };
    });

    return {
      productName: productObj.name,
      openingStock,
      transactions,
      currentStock,
    };
  }

  async getDailySummaryReport(filters: {
    start_date?: string;
    end_date?: string;
  }) {
    const settlementFilter: any = {};
    const damageFilter: any = {};
    if (filters.start_date || filters.end_date) {
      settlementFilter.date = {};
      damageFilter.damage_date = {};
      if (filters.start_date) {
        settlementFilter.date.$gte = filters.start_date;
        damageFilter.damage_date.$gte = filters.start_date;
      }
      if (filters.end_date) {
        settlementFilter.date.$lte = filters.end_date;
        damageFilter.damage_date.$lte = filters.end_date;
      }
    }

    const settlements = await SettlementModel.find(settlementFilter);
    const approvedDamages = await DamageRecordModel.find({
      status: "Approved",
      ...damageFilter,
    });

    // Collect all unique dates
    const uniqueDates = Array.from(
      new Set([
        ...settlements.map((s) => s.date),
        ...approvedDamages.map((d) => d.damage_date),
      ])
    ).sort((a, b) => b.localeCompare(a)); // sort descending

    return uniqueDates.map((dateStr, idx) => {
      const daySettlements = settlements.filter((s) => s.date === dateStr);
      const dayDamages = approvedDamages.filter(
        (d) => d.damage_date === dateStr
      );

      const salesAmount = daySettlements.reduce(
        (sum, s) => sum + (s.totalSales || 0),
        0
      );
      const collectedAmount = salesAmount; // Assume 100% cash collection on day of settlement
      const expense = Number((salesAmount * 0.02).toFixed(2));
      const damageAmount = dayDamages.reduce(
        (sum, d) => sum + (d.loss_amount || 0),
        0
      );
      const netCash = Number(
        (collectedAmount - expense - damageAmount).toFixed(2)
      );

      return {
        sl: idx + 1,
        date: dateStr,
        salesAmount: Number(salesAmount.toFixed(2)),
        collectedAmount: Number(collectedAmount.toFixed(2)),
        expense,
        damageAmount: Number(damageAmount.toFixed(2)),
        netCash,
      };
    });
  }

  async getDailySaleReport(filters: {
    start_date?: string;
    end_date?: string;
    delivery_man_id?: string;
  }) {
    const query: any = {};
    if (filters.start_date || filters.end_date) {
      query.date = {};
      if (filters.start_date) query.date.$gte = filters.start_date;
      if (filters.end_date) query.date.$lte = filters.end_date;
    }
    if (
      filters.delivery_man_id &&
      filters.delivery_man_id !== "Select Delivery Man"
    ) {
      query.deliveryManId = filters.delivery_man_id;
    }

    const settlements = await SettlementModel.find(query).sort({ date: -1 });

    return settlements.map((s, idx) => {
      const sObj = s.toObject ? s.toObject() : s;
      return {
        sl: idx + 1,
        id: sObj._id.toString(),
        date: sObj.date,
        settlementId: sObj._id.toString().substring(18).toUpperCase(),
        deliveryMan: sObj.deliveryManName,
        loadingSheetId: sObj.loadingSheetId || "N/A",
        totalSales: Number((sObj.totalSales || 0).toFixed(2)),
        totalReturned: Math.round(Number(sObj.totalReturned || 0)),
        totalDamaged: Math.round(Number(sObj.totalDamaged || 0)),
        profit: Number((sObj.totalProfit || 0).toFixed(2)),
      };
    });
  }

  async getDailySaleProductReport(filters: {
    start_date?: string;
    end_date?: string;
    product_id?: string;
  }) {
    const query: any = {};
    if (filters.start_date || filters.end_date) {
      query.date = {};
      if (filters.start_date) query.date.$gte = filters.start_date;
      if (filters.end_date) query.date.$lte = filters.end_date;
    }

    const settlements = await SettlementModel.find(query);

    // Aggregate by product
    const productSales: Record<
      string,
      {
        productName: string;
        soldQty: number;
        returnedQty: number;
        revenue: number;
        profit: number;
      }
    > = {};

    for (const s of settlements) {
      for (const item of s.items) {
        const pIdStr = item.productId.toString();

        if (
          filters.product_id &&
          filters.product_id !== "Select Product" &&
          pIdStr !== filters.product_id
        ) {
          continue;
        }

        if (!productSales[pIdStr]) {
          productSales[pIdStr] = {
            productName: item.productName,
            soldQty: 0,
            returnedQty: 0,
            revenue: 0,
            profit: 0,
          };
        }

        const rev = (item.soldQuantity || 0) * (item.sellingPrice || 0);
        const cost = (item.soldQuantity || 0) * (item.purchasePrice || 0);
        const itemProfit = rev - cost;

        productSales[pIdStr].soldQty += item.soldQuantity || 0;
        productSales[pIdStr].returnedQty += item.returnedQuantity || 0;
        productSales[pIdStr].revenue += rev;
        productSales[pIdStr].profit += itemProfit;
      }
    }

    return Object.values(productSales)
      .sort((a, b) => b.soldQty - a.soldQty)
      .map((item, idx) => ({
        sl: idx + 1,
        productName: item.productName,
        soldQty: item.soldQty,
        returnedQty: item.returnedQty,
        revenue: Number(item.revenue.toFixed(2)),
        profit: Number(item.profit.toFixed(2)),
      }));
  }

  async getDamageRecordsReport(filters: {
    start_date?: string;
    end_date?: string;
    status?: string;
  }) {
    const query: any = {};
    if (filters.start_date || filters.end_date) {
      query.damage_date = {};
      if (filters.start_date) query.damage_date.$gte = filters.start_date;
      if (filters.end_date) query.damage_date.$lte = filters.end_date;
    }
    if (filters.status && filters.status !== "All") {
      query.status = filters.status;
    }

    const records = await DamageRecordModel.find(query).sort({
      damage_date: -1,
    });

    const rows: any[] = [];
    let sl = 1;
    for (const r of records) {
      const rObj = r.toObject ? r.toObject() : r;
      for (const item of rObj.items || []) {
        rows.push({
          sl: sl++,
          id: rObj._id.toString(),
          date: rObj.damage_date,
          productName: item.product_name || "Unknown Product",
          reason: rObj.damage_reason || rObj.source_type || "General Damage",
          qty: Math.round(Number(item.qty || 0)),
          lossAmount: Number((item.loss_amount || 0).toFixed(2)),
          status: rObj.status,
        });
      }
    }
    return rows;
  }
}

export const StatisticsService = new Service();
