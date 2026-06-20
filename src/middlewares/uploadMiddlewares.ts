import { NextFunction, Request, Response } from "express";
import { AWSFileUploader } from "../modules/aws/uploader";
import ApiError from "./error";
import { HttpStatusCode } from "../lib/httpStatus";
interface IBlogContent {
  title: string;
  description: string;
  images: string[];
}

class UploadMiddlewares {
  async uploadMenuCategoryImage(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.file) {
        throw new ApiError(
          HttpStatusCode.BAD_REQUEST,
          "Image file is required"
        );
      }
      const url = await AWSFileUploader.uploadMenuCategoryImage(req.file);
      req.body = {
        name: req.body.name,
        image: url,
        position: req.body.position ? parseInt(req.body.position, 10) : 0,
        is_available: req.body.is_available
          ? req.body.is_available === "true"
          : false,
      };
      next();
    } catch (error) {
      next(
        new ApiError(
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          "Image upload failed"
        )
      );
    }
  }

  async uploadUpdatedMenuCategoryImage(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let imageUrl: string | undefined;

      if (req.file) {
        // If new file is uploaded, upload it and use its URL
        imageUrl = await AWSFileUploader.uploadMenuCategoryImage(req.file);
        req.body.image = imageUrl;
      }

      if (req.body?.name) {
        req.body.name;
      }

      if (req.body?.position) {
        req.body.position = parseInt(req.body.position, 10);
      }

      if (req.body?.is_available) {
        req.body.is_available =
          req.body.is_available === "true" || req.body.is_available === true;
      }

      next();
    } catch (error) {
      next(
        new ApiError(
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          "Image upload failed"
        )
      );
    }
  }

  async uploadMenuItemFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as any;
      const thumbnail = files?.["thumbnail"]?.[0];
      const slider_images = files?.["slider_images"] as
        | Express.Multer.File[]
        | undefined;

      if (!thumbnail) {
        return res
          .status(400)
          .json({ success: false, message: "Thumbnail is required" });
      }

      const uploaded = await AWSFileUploader.uploadMenuItemFiles(
        thumbnail,
        slider_images || []
      );

      req.body.thumbnail = uploaded.thumbnail;
      req.body.slider_images = uploaded.slider_images;

      next();
    } catch (error: any) {
      next(
        new ApiError(
          error?.status ||
            error?.statusCode ||
            HttpStatusCode.INTERNAL_SERVER_ERROR,
          error?.message || "Failed to upload images"
        )
      );
    }
  }

  async uploadUpdatedMenuItemFiles(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const files = req.files as any;

      // Handle thumbnail (can be file or string)
      let finalThumbnail: string | undefined;

      const thumbnailFile = files?.["thumbnail"]?.[0];
      const thumbnailBody = req.body?.thumbnail;

      if (thumbnailFile) {
        // New thumbnail uploaded
        const uploaded = await AWSFileUploader.uploadSingleFile(
          thumbnailFile,
          "menu-items"
        );
        finalThumbnail = uploaded;
      } else if (
        typeof thumbnailBody === "string" &&
        thumbnailBody.startsWith("http")
      ) {
        // Existing thumbnail URL
        finalThumbnail = thumbnailBody;
      }

      // Handle slider_images (can be string[], file[], or mixed)
      const sliderImageFiles = files?.["slider_images"] || [];
      let sliderImageUrls: string[] = [];

      const sliderImagesFromBody = req.body?.slider_images;

      if (sliderImagesFromBody) {
        // Normalize to array
        const bodyImages = Array.isArray(sliderImagesFromBody)
          ? sliderImagesFromBody
          : [sliderImagesFromBody];

        for (const img of bodyImages) {
          if (typeof img === "string" && img.startsWith("http")) {
            sliderImageUrls.push(img);
          }
        }
      }

      // Upload new files if any
      if (sliderImageFiles.length > 0) {
        const uploaded = await AWSFileUploader.uploadMultipleFiles(
          sliderImageFiles,
          "menu-items"
        );
        sliderImageUrls = [...sliderImageUrls, ...uploaded];
      }

      // Set updated values to req.body
      req.body.thumbnail = finalThumbnail;
      req.body.slider_images = sliderImageUrls;

      next();
    } catch (error: any) {
      next(
        new ApiError(
          error?.status ||
            error?.statusCode ||
            HttpStatusCode.INTERNAL_SERVER_ERROR,
          error?.message || "Failed to upload images"
        )
      );
    }
  }

  async uploadRestaurantLogo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, "Logo file is required");
      }
      const url = await AWSFileUploader.uploadRestaurantLogo(req.file);
      req.body.logo = url;
      next();
    } catch (error: any) {
      next(
        new ApiError(
          error?.status ||
            error?.statusCode ||
            HttpStatusCode.INTERNAL_SERVER_ERROR,
          error?.message || "Logo upload failed"
        )
      );
    }
  }

  async uploadRestaurantBanner(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.file) {
        throw new ApiError(
          HttpStatusCode.BAD_REQUEST,
          "Banner file is required"
        );
      }
      const banner = await AWSFileUploader.uploadRestaurantBanner(req.file);
      req.body.banner = banner;
      next();
    } catch (error: any) {
      next(
        new ApiError(
          error?.status ||
            error?.statusCode ||
            HttpStatusCode.INTERNAL_SERVER_ERROR,
          error?.message || "Banner upload failed"
        )
      );
    }
  }

  async uploadBlogImages(req: Request, res: Response, next: NextFunction) {
    const folder = `blogs`;

    try {
      const filesArray = req.files as Express.Multer.File[];
      const body = req.body;

      if (!body.title) {
        throw new ApiError(
          HttpStatusCode.BAD_REQUEST,
          "Blog title is required."
        );
      }
      if (!body.category) {
        throw new ApiError(
          HttpStatusCode.BAD_REQUEST,
          "Blog category is required."
        );
      }

      if (!body.content) {
        throw new ApiError(
          HttpStatusCode.BAD_REQUEST,
          "Blog content is required."
        );
      }

      let rawContent;
      try {
        rawContent = JSON.parse(body.content);
      } catch {
        throw new ApiError(
          HttpStatusCode.BAD_REQUEST,
          "Blog content must be valid JSON."
        );
      }

      const files: Record<string, Express.Multer.File[]> = {};
      for (const file of filesArray) {
        if (!files[file.fieldname]) files[file.fieldname] = [];
        files[file.fieldname].push(file);
      }

      const coverImageFile = files.cover_image?.[0];
      if (!coverImageFile) {
        throw new ApiError(
          HttpStatusCode.BAD_REQUEST,
          "Cover image is required."
        );
      }

      const coverImageUrl = await AWSFileUploader.uploadSingleFile(
        coverImageFile,
        folder
      );

      const content: IBlogContent[] = [];

      for (let i = 0; i < rawContent.length; i++) {
        const section = rawContent[i];

        const sectionImageFiles = files[`images[${i}]`] || [];
        let imageUrls: string[] = [];

        if (sectionImageFiles.length > 0) {
          imageUrls = await AWSFileUploader.uploadMultipleFiles(
            sectionImageFiles,
            folder
          );
        }

        content.push({
          title: section.title,
          description: section.description,
          images: imageUrls,
        });
      }

      const tags = Array.isArray(body.tags)
        ? body.tags
        : typeof body.tags === "string"
          ? body.tags.split(",").map((tag: string) => tag.trim())
          : [];

      const blogPayload = {
        author: req.user?.id,
        category: body.category,
        title: body.title,
        tags,
        is_published: body.is_published !== "false",
        cover_image: coverImageUrl,
        content,
      };

      req.body = blogPayload;
      next();
    } catch (error: any) {
      next(
        new ApiError(
          error?.status ||
            error?.statusCode ||
            HttpStatusCode.INTERNAL_SERVER_ERROR,
          error?.message
        )
      );
    }
  }

  async uploadBlogUpdatedCoverImage(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const folder = `blogs`;
    try {
      if (req.file) {
        const url = await AWSFileUploader.uploadSingleFile(req.file, folder);
        req.body.cover_image = url;
      }

      if (req.body.tags) {
        const tags = Array.isArray(req.body.tags)
          ? req.body.tags
          : typeof req.body.tags === "string"
            ? req.body.tags.split(",").map((tag: string) => tag.trim())
            : [];
        req.body.tags = tags;
      }

      next();
    } catch (error: any) {
      next(
        new ApiError(
          error?.status ||
            error?.statusCode ||
            HttpStatusCode.INTERNAL_SERVER_ERROR,
          error?.message
        )
      );
    }
  }
}

export const uploadMiddlewares = new UploadMiddlewares();
