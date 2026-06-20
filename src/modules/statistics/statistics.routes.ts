import { Router } from "express";
import { StatisticsController } from "./statistics.controller";

const router = Router();

router.get("/dashboard-summary", StatisticsController.getDashboardSummary);

router.get("/orders", StatisticsController.getOrdersStatistics);

router.get("/metrics", StatisticsController.getAllOrdersCardMetrics);

router.get("/last7days", StatisticsController.getLast7DaysOrders);

router.get(
  "/status-wise-metrics",
  StatisticsController.getStatusWiseOrdersMetrics
);

router.get("/revenue", StatisticsController.getRevenue);

router.get(
  "/reports/current-stock",
  StatisticsController.getCurrentStockReport
);

router.get(
  "/reports/product-summary",
  StatisticsController.getProductSummaryReport
);

router.get(
  "/reports/daily-summary",
  StatisticsController.getDailySummaryReport
);

router.get("/reports/daily-sale", StatisticsController.getDailySaleReport);

router.get(
  "/reports/daily-sale-products",
  StatisticsController.getDailySaleProductReport
);

router.get(
  "/reports/damage-records",
  StatisticsController.getDamageRecordsReport
);

export const StatisticsRoutes = router;
