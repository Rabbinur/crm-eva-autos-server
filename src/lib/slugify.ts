import slugify from "slugify";

/**
 * Slugify Service
 * ----------------
 * Provides utilities for generating clean, URL-friendly slugs
 * from text strings (e.g., blog titles, product names).
 */
class Service {
  /**
   * Default slugify configuration options.
   *
   * - `replacement`: Character used to replace spaces (default: "-")
   * - `remove`: Regex for removing unwanted characters
   * - `lower`: Converts result to lowercase
   * - `strict`: Strips special characters except the replacement
   * - `trim`: Removes leading/trailing replacement chars
   * - `locale`: Language locale (default: "en")
   */
  private readonly options = {
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: true,
    trim: true,
    locale: "en",
  };

  /**
   * Converts a given string into a URL-friendly slug.
   *
   * @param {string} text - The text to convert (e.g., "Hello World!").
   *
   * @example
   * ```ts
   * SlugifyService.generateSlug("Hello World!");
   * // "hello-world"
   *
   * SlugifyService.generateSlug("React & Node.js Project");
   * // "react-nodejs-project"
   * ```
   *
   * @returns {string} The generated slug (or an empty string if input is invalid).
   */
  public generateSlug(text: string): string {
    if (!text) return "";
    return slugify(text, this.options);
  }
}

/**
 * Exported singleton instance of the Slugify service.
 * Useful for creating slugs across the application consistently.
 */
export const SlugifyService = new Service();
