export const Category = {
  RAM: "RAM",
  SSD: "SSD",
  CPU: "CPU",
  GPU: "GPU",
  MOTHERBOARD: "MOTHERBOARD",
} as const;

export type CategoryType = (typeof Category)[keyof typeof Category];

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: CategoryType;
  image: string;
  stock: number;
}
