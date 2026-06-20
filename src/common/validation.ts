import z from "zod";

export const orderItemValidationSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string().nonempty("Item ID is required"),
    name: z.string().nonempty("Item name is required"),
    quantity: z.number().int().optional(),
    price: z.number().optional(),
    variants: z.array(orderItemValidationSchema).optional().default([]),
  })
);

export const orderAddonValidationSchema = z.object({
  id: z.string().nonempty("Addon ID is required"),
  name: z.string().nonempty("Addon name is required"),
  quantity: z.number().int().nonnegative(),
  price: z.number().nonnegative(),
});

export const customerDeliveryAddressValidationSchema = z.object({
  body: z
    .object({
      label: z.string().optional(),
      street: z.string().optional(),
      area: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip_code: z.string().optional(),
      country: z.string().optional(),
      instructions: z.string().optional(),
      is_default: z.boolean().default(false),
      location: z
        .object({
          lat: z.number().optional(),
          lng: z.number().optional(),
        })
        .optional(),
    })
    .strict(),
});

export const updateCustomerDeliveryAddressValidationSchema = z.object({
  body: z
    .object({
      street: z.string().optional(),
      area: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip_code: z.string().optional(),
      country: z.string().optional(),
      instructions: z.string().optional(),
      is_default: z.boolean().default(false),
      location: z
        .object({
          lat: z.number().optional(),
          lng: z.number().optional(),
        })
        .optional(),
    })
    .strict(),
});
