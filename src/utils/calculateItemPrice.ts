import { IAddonOrderItem, IOrderItem } from "@/interfaces/common.interface";

export const calculateItemsPrice = (items: IOrderItem[] = []): number => {
  let total = 0;

  for (const item of items) {
    if (item.variants && item.variants.length > 0) {
      const variantsTotal = item.variants.reduce((sum, variant) => {
        return sum + variant.price * variant.quantity;
      }, 0);
      total += variantsTotal;
    } else {
      total += item.price * item.quantity;
    }
  }

  return total;
};

export const calculateAddonsPrice = (
  addons: IAddonOrderItem[] = []
): number => {
  if (addons.length > 0) {
    return addons.reduce((total, addon) => {
      return total + addon.price * addon.quantity;
    }, 0);
  }
  return 0;
};
