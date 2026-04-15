export const ROUTES = {
  home: "/",
  products: "/products",
  product: (slug: string) => `/products/${slug}`,
  category: (category: string) => `/products/category/${category}`,
};

export const CATEGORIES = {
  GPU: "GPU",
  CPU: "CPU",
} as const;
