export type TabKey = "home" | "customer" | "products" | "quote" | "mine";

export type Product = {
  id: string;
  name: string;
  duration: string;
  audience: string[];
  priceRange: string;
  hotels: string;
  vehicle: string;
  activities: string[];
  altitudeRisk: string;
  score: number;
  notFor: string[];
  route: string;
  reason: string;
};

export type Customer = {
  id: string;
  name: string;
  memberLevel: string;
  memberCardNo: string;
  memberPhone: string;
  city: string;
  family: string;
  gmv: string;
  lastTrip: string;
  status: string;
  tags: string[];
  summary: string;
  orders: Array<{ year: string; tripDate: string; product: string; amount: string; feedback: string }>;
};

export type RouterResult = {
  intent: string;
  subIntent: string;
  entities: Record<string, string | number | boolean | string[]>;
  response: string;
  workflowSteps: string[];
  cards: Array<Record<string, unknown>>;
};
