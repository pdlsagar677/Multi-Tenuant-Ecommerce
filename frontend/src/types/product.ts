export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  sku: string;
  quantity: number;
  isActive: boolean;
  createdAt: string;
}

export interface ICreateProductRequest {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images?: string[];
  category: string;
  sku?: string;
  quantity: number;
}