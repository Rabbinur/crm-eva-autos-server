import { Request, Response } from "express";
import { ProductService } from "./product.service";
import BaseController from "@/shared/baseController";
import { HttpStatusCode } from "@/lib/httpStatus";
import pickQueries from "@/shared/pickQueries";
import { paginationFields } from "@/constants/paginationFields";

class Controller extends BaseController {
  createProduct = this.catchAsync(async (req: Request, res: Response) => {
    const data = await ProductService.createProduct(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Product created successfully",
      data,
    });
  });

  getAllProducts = this.catchAsync(async (req: Request, res: Response) => {
    const options = pickQueries(req.query, paginationFields);
    const search_query = req.query.search_query as string;
    const data = await ProductService.getAllProducts(options, search_query);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Products retrieved successfully",
      data,
    });
  });

  getProductById = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await ProductService.getProductById(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Product retrieved successfully",
      data,
    });
  });

  updateProduct = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await ProductService.updateProduct(id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Product updated successfully",
      data,
    });
  });

  deleteProduct = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    await ProductService.deleteProduct(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Product deleted successfully",
      data: null,
    });
  });

  addBatch = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await ProductService.addBatch(id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Batch added successfully",
      data,
    });
  });
}

export const ProductController = new Controller();
