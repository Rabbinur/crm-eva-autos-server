import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import BaseController from "@/shared/baseController";
import { HttpStatusCode } from "@/lib/httpStatus";
import pickQueries from "@/shared/pickQueries";
import { paginationFields } from "@/constants/paginationFields";

class Controller extends BaseController {
  createCategory = this.catchAsync(async (req: Request, res: Response) => {
    const data = await CategoryService.createCategory(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Category created successfully",
      data,
    });
  });

  getAllCategories = this.catchAsync(async (req: Request, res: Response) => {
    const options = pickQueries(req.query, paginationFields);
    const search_query = req.query.search_query as string;
    const company_name = req.query.company_name as string;
    const data = await CategoryService.getAllCategories(
      options,
      search_query,
      company_name
    );
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Categories retrieved successfully",
      data,
    });
  });

  getCategoryById = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await CategoryService.getCategoryById(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Category retrieved successfully",
      data,
    });
  });

  updateCategory = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await CategoryService.updateCategory(id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Category updated successfully",
      data,
    });
  });

  deleteCategory = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    await CategoryService.deleteCategory(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Category deleted successfully",
      data: null,
    });
  });
}

export const CategoryController = new Controller();
