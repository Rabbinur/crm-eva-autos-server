import { envConfig } from "@/config/index";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";

class Service {
  private readonly bucketName = envConfig.aws.bucket;
  private readonly region = envConfig.aws.region;
  private readonly accessKeyId = envConfig.aws.access_key_id;
  private readonly secretAccessKey = envConfig.aws.secret_access_key;
  private readonly upload_base = envConfig.aws.file_load_base;
  private readonly rootFolder = "zsi-restaurant";

  private s3Client = new S3Client({
    region: this.region,
    credentials: {
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
    },
  });

  private getPublicUrl(key: string) {
    return `${this.upload_base}/${key}`;
  }

  private async uploadFileToS3(
    file: Express.Multer.File,
    folder: string
  ): Promise<string> {
    const fileExt = path.extname(file.originalname).toLowerCase();
    const fileName = `${Date.now()}-${randomUUID()}${fileExt}`;
    const key = `${this.rootFolder}/${folder}/${fileName}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
    return this.getPublicUrl(key);
  }

  async uploadSingleFile(
    file: Express.Multer.File,
    folder: string
  ): Promise<string> {
    return await this.uploadFileToS3(file, folder);
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string
  ): Promise<string[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFileToS3(file, folder)
    );
    return await Promise.all(uploadPromises);
  }

  private async deleteFileFromS3(key: string): Promise<void> {
    console.log(`[AWS S3] Deleting file with key: ${key}`);
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
      console.log(`[AWS S3] Successfully Deleted file with key: ${key}`);
    } catch (error: any) {
      console.error(`[AWS S3] Error deleting file: ${key}`, error?.message);
    }
  }

  private async deleteMultipleFilesFromS3(keys: string[]): Promise<void> {
    console.log(`[AWS S3] Deleting files with keys: ${keys.join(", ")}`);
    try {
      const command = new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
          Quiet: false,
        },
      });
      await this.s3Client.send(command);
      console.log(
        `[AWS S3] Successfully Deleted files with keys: ${keys.join(", ")}`
      );
    } catch (error: any) {
      console.error(
        `[AWS S3] Error deleting files: ${keys.join(", ")}`,
        error?.message
      );
    }
  }

  private extractS3KeyFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      if (!parsedUrl.href.startsWith(this.upload_base)) {
        throw new Error("Invalid S3 URL: does not match base URL");
      }

      return parsedUrl.pathname
        .replace(/^\//, "")
        .replace(this.upload_base.replace(/^https?:\/\//, "") + "/", "");
    } catch {
      throw new Error(`Invalid URL: ${url}`);
    }
  }

  async deleteSingleFile(url: string) {
    const key = this.extractS3KeyFromUrl(url);
    await this.deleteFileFromS3(key);
  }

  async deleteMultipleFiles(urls: string[]) {
    const keys = urls.map((url) => this.extractS3KeyFromUrl(url));
    await this.deleteMultipleFilesFromS3(keys);
  }

  async uploadMenuCategoryImage(file: Express.Multer.File): Promise<string> {
    const folder = "menu-categories";
    return await this.uploadFileToS3(file, folder);
  }

  async uploadMenuItemFiles(
    thumbnail: Express.Multer.File,
    slider_images: Express.Multer.File[]
  ): Promise<{ thumbnail: string; slider_images: string[] }> {
    const folder = "menu-items";

    const thumbnailUrl = await this.uploadFileToS3(thumbnail, folder);

    const sliderUrls: string[] = [];
    for (const image of slider_images) {
      const url = await this.uploadFileToS3(image, folder);
      sliderUrls.push(url);
    }

    return {
      thumbnail: thumbnailUrl,
      slider_images: sliderUrls,
    };
  }

  async uploadRestaurantLogo(logo: Express.Multer.File) {
    return await this.uploadSingleFile(logo, "assets");
  }

  async uploadRestaurantBanner(banner: Express.Multer.File) {
    return await this.uploadSingleFile(banner, "assets");
  }
}

export const AWSFileUploader = new Service();
