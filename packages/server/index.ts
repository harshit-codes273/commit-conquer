<<<<<<< HEAD
// packages/server/index.ts
//
// Express REST API server — wires all modules into HTTP endpoints.
//
// ─── Setup ────────────────────────────────────────────────────────────────────
//   1. Copy this file to: packages/server/index.ts
//   2. Add to root package.json scripts:
//        "server": "ts-node packages/server/index.ts"
//        "server:dev": "nodemon --exec ts-node packages/server/index.ts"
//   3. Install deps (once):
//        npm install express cors helmet morgan dotenv
//        npm install -D @types/express @types/cors @types/morgan ts-node nodemon
//   4. Create packages/server/.env (see ENV VARS section below)
//   5. Run: npm run server:dev
//
// ─── ENV VARS (.env) ──────────────────────────────────────────────────────────
//   PORT=4000
//   CORS_ORIGIN=http://localhost:5173
//   ADMIN_SECRET=admin_dev_secret      ← used by admin-only routes
//   NODE_ENV=development
//
// ─── Base URL ─────────────────────────────────────────────────────────────────
//   Storefront: http://localhost:4000/api/v1/store/
//   Admin:      http://localhost:4000/api/v1/admin/   (requires X-Admin-Secret header)
//
// ─── Integration with existing files ─────────────────────────────────────────
//   All imports below pull directly from your existing module services.
//   Nothing in the service files needs to change.
=======

>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761

import express, {
  type Request,
  type Response,
  type NextFunction,
  type RequestHandler,
} from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, ".env") });


// ─── Env Validation ───────────────────────────────────────────────────────────
const REQUIRED_ENV_VARS = ["STRIPE_KEY", "DB_URL"];
const missingVars = REQUIRED_ENV_VARS.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error(`
  ❌ ERROR: Missing required environment variables:
     ${missingVars.join(", ")}

     The server cannot start without these. Please check your .env file.
  `);
  process.exit(1);
}



import { ProductService, ServiceError } from "../modules/products/product.service.ts";
import { AuthService }     from "../modules/auth/auth.service.ts";
import { CartService }     from "../modules/cart/cart.service.ts";
import { OrderService }    from "../modules/orders/order.service.ts";
import { PaymentService }  from "../modules/payments/payment.service.ts";
import { InventoryService } from "../modules/inventory/inventory.service.ts";
import { DiscountService } from "../modules/discounts/discount.service.ts";
import { ShippingService } from "../modules/shipping/shipping.service.ts";
import { eventBus, EVENT } from "../core/event-bus.ts";



const app  = express();
const PORT = parseInt(process.env.PORT ?? "4000", 10);



app.use(helmet());
app.use(cors({
  origin:      process.env.CORS_ORIGIN ?? "http://localhost:5173",
  credentials: true,
  methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Admin-Secret", "X-Cart-Id"],
}));
app.use(express.json({ limit: "2mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));



declare global {
  namespace Express {
    interface Request {
      customer?: ReturnType<typeof AuthService.validateToken>;
    }
  }
}

const authenticate: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json(err("UNAUTHORIZED", "Missing or malformed Authorization header"));
    return;
  }
  try {
    req.customer = AuthService.validateToken(header.slice(7));
    next();
  } catch (e) {
    handleErr(e, res);
  }
};


const softAuthenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      req.customer = AuthService.validateToken(header.slice(7));
    } catch {
      
    }
  }
  next();
};


const adminOnly: RequestHandler = (req, res, next) => {
  const secret = req.headers["x-admin-secret"];
  if (secret !== process.env.ADMIN_SECRET && process.env.NODE_ENV !== "development") {
    res.status(403).json(err("FORBIDDEN", "Admin access required"));
    return;
  }
  next();
};



function err(code: string, message: string) {
  return { error: { code, message } };
}

function handleErr(e: unknown, res: Response) {
  if (e instanceof ServiceError) {
    const status = STATUS_MAP[e.code] ?? 400;
    res.status(status).json(err(e.code, e.message));
    return;
  }
  console.error("[Server] Unexpected error:", e);
  res.status(500).json(err("INTERNAL_ERROR", "An unexpected error occurred"));
}

// Map ServiceError codes → HTTP status codes
const STATUS_MAP: Record<string, number> = {
  PRODUCT_NOT_FOUND:    404,
  VARIANT_NOT_FOUND:    404,
  CART_NOT_FOUND:       404,
  ORDER_NOT_FOUND:      404,
  CUSTOMER_NOT_FOUND:   404,
  ITEM_NOT_FOUND:       404,
  INVALID_CREDENTIALS:  401,
  INVALID_TOKEN:        401,
  TOKEN_EXPIRED:        401,
  UNAUTHORIZED:         401,
  FORBIDDEN:            403,
  INSUFFICIENT_STOCK:   409,
  EMAIL_EXISTS:         409,
  VALIDATION_ERROR:     422,
  WEAK_PASSWORD:        422,
  EMPTY_CART:           422,
  MISSING_EMAIL:        422,
  MISSING_ADDRESS:      422,
  UPDATE_FAILED:        500,
  DELETE_FAILED:        500,
  INTERNAL_ERROR:       500,
};



app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: "1.0.0-hackathon",
  });
});

<<<<<<< HEAD
// ══════════════════════════════════════════════════════════════════════════════
// STORE ROUTES  /api/v1/store/*
// Public-facing storefront endpoints
// ══════════════════════════════════════════════════════════════════════════════

const store = express.Router();
app.use("/api/v1/store", store);
=======
const store = express.Router();
app.use("/api/v1/store", store);


>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761


<<<<<<< HEAD
// GET /api/v1/store/products
// Query: offset, limit, category, search, sort, status
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.get("/products", (req, res) => {
  try {
    const result = ProductService.list({
      offset:   parseInt(String(req.query.offset ?? "0"), 10),
      limit:    parseInt(String(req.query.limit  ?? "12"), 10),
      status:   (req.query.status as "published") ?? "published",
      category: req.query.category as string,
      search:   req.query.search   as string,
      sort:     req.query.sort     as "newest" | "price_asc" | "price_desc",
    });
    res.json(result);
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// GET /api/v1/store/products/:id
=======

>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.get("/products/:id", (req, res) => {
  try {
    const product = ProductService.getById(req.params.id);
    res.json({ product });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// GET /api/v1/store/products/handle/:handle
// Used by [handle]/page.tsx
=======


>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.get("/products/handle/:handle", (req, res) => {
  try {
    const product = ProductService.getByHandle(req.params.handle);
    res.json({ product });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// GET /api/v1/store/products/categories
=======

>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.get("/categories", (_req, res) => {
  try {
    res.json({ categories: ProductService.categories() });
  } catch (e) { handleErr(e, res); }
});


<<<<<<< HEAD
// POST /api/v1/store/auth/register
// Body: { email, password, first_name, last_name, phone? }
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.post("/auth/register", async (req, res) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// POST /api/v1/store/auth/login
// Body: { email, password }
=======

>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.post("/auth/login", async (req, res) => {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// POST /api/v1/store/auth/logout
// Header: Authorization: Bearer <token>
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.post("/auth/logout", authenticate, async (req, res) => {
  try {
    const token = req.headers.authorization!.slice(7);
    await AuthService.logout(token);
    res.json({ success: true });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// GET /api/v1/store/auth/me
// Header: Authorization: Bearer <token>
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.get("/auth/me", authenticate, (req, res) => {
  res.json({ customer: req.customer });
});

<<<<<<< HEAD
// PATCH /api/v1/store/auth/me
// Body: { first_name?, last_name?, phone? }
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.patch("/auth/me", authenticate, async (req, res) => {
  try {
    const updated = await AuthService.updateProfile(req.customer!.id, req.body);
    res.json({ customer: updated });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// POST /api/v1/store/auth/reset-password/request
// Body: { email }
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.post("/auth/reset-password/request", async (req, res) => {
  try {
    const result = await AuthService.requestPasswordReset(req.body.email);
    res.json(result);
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// POST /api/v1/store/auth/reset-password/confirm
// Body: { reset_token, new_password }
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.post("/auth/reset-password/confirm", async (req, res) => {
  try {
    await AuthService.confirmPasswordReset(req.body.reset_token, req.body.new_password);
    res.json({ success: true });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// POST /api/v1/store/auth/google
// Body: { credential: google_id_token }
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.post("/auth/google", async (req, res) => {
  try {
    const result = await AuthService.googleLogin(req.body.credential);
    res.json(result);
  } catch (e) { handleErr(e, res); }
});


<<<<<<< HEAD
// POST /api/v1/store/carts
// Body: { email? }
// Returns the new cart. Store cart.id in frontend (localStorage / cookie).
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.post("/carts", softAuthenticate, async (req, res) => {
  try {
    const cart = await CartService.create(req.body.email ?? req.customer?.email);
    res.status(201).json({ cart });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// GET /api/v1/store/carts/:id
=======

>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.get("/carts/:id", (req, res) => {
  try {
    const cart = CartService.get(req.params.id);
    res.json({ cart });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// POST /api/v1/store/carts/:id/items
// Body: { product_id, variant_id, quantity? }
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.post("/carts/:id/items", async (req, res) => {
  try {
    const { product_id, variant_id, quantity = 1 } = req.body;
    const cart = await CartService.addItem(req.params.id, product_id, variant_id, quantity);
    res.json({ cart });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// DELETE /api/v1/store/carts/:id/items/:lineId
=======

>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.delete("/carts/:id/items/:lineId", async (req, res) => {
  try {
    const cart = await CartService.removeItem(req.params.id, req.params.lineId);
    res.json({ cart });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// PATCH /api/v1/store/carts/:id/items/:lineId
// Body: { quantity }
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.patch("/carts/:id/items/:lineId", async (req, res) => {
  try {
    const cart = await CartService.updateQuantity(
      req.params.id,
      req.params.lineId,
      req.body.quantity,
    );
    res.json({ cart });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// POST /api/v1/store/carts/:id/discount
// Body: { code }
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.post("/carts/:id/discount", async (req, res) => {
  try {
    const cart = await CartService.applyDiscount(req.params.id, req.body.code);
    res.json({ cart });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// DELETE /api/v1/store/carts/:id/discount
=======

>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.delete("/carts/:id/discount", async (req, res) => {
  try {
    const cart = await CartService.removeDiscount(req.params.id);
    res.json({ cart });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// PATCH /api/v1/store/carts/:id/email
// Body: { email }
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.patch("/carts/:id/email", async (req, res) => {
  try {
    const cart = await CartService.setEmail(req.params.id, req.body.email);
    res.json({ cart });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// PATCH /api/v1/store/carts/:id/shipping-address
// Body: Address object
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.patch("/carts/:id/shipping-address", async (req, res) => {
  try {
    const cart = await CartService.setShippingAddress(req.params.id, req.body);
    res.json({ cart });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// PATCH /api/v1/store/carts/:id/billing-address
=======

>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.patch("/carts/:id/billing-address", async (req, res) => {
  try {
    const cart = await CartService.setBillingAddress(req.params.id, req.body);
    res.json({ cart });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// GET /api/v1/store/carts/:id/summary
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.get("/carts/:id/summary", (req, res) => {
  try {
    const summary = CartService.summary(req.params.id);
    res.json(summary);
  } catch (e) { handleErr(e, res); }
});


<<<<<<< HEAD
// GET /api/v1/store/shipping-options
// Query: cart_id (optional, for cart-specific rates)
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.get("/shipping-options", async (req, res) => {
  try {
    const options = await ShippingService.listOptions();
    res.json({ shipping_options: options });
  } catch (e) { handleErr(e, res); }
});


<<<<<<< HEAD
// POST /api/v1/store/orders
// Body: { cart_id, payment_provider? }
// Converts a completed cart into an order
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.post("/orders", softAuthenticate, async (req, res) => {
  try {
    const order = await OrderService.place(req.body);
    res.status(201).json({ order });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// GET /api/v1/store/orders/:id
// Requires auth — customers can only see their own orders
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.get("/orders/:id", authenticate, (req, res) => {
  try {
  const order = OrderService.getById(String(req.params.id));
    
    if (order.customer_id && order.customer_id !== req.customer!.id) {
      res.status(403).json(err("FORBIDDEN", "Access denied"));
      return;
    }
    res.json({ order });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// GET /api/v1/store/customers/me/orders
// List the logged-in customer's orders
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.get("/customers/me/orders", authenticate, (req, res) => {
  try {
    const result = OrderService.list({ customer_id: req.customer!.id });
    res.json(result);
  } catch (e) { handleErr(e, res); }
});


<<<<<<< HEAD
// POST /api/v1/store/payment/initiate
// Body: { order_id, amount, currency?, provider?, customer_email? }
// Returns payment session with Stripe client_secret (if using Stripe)
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.post("/payment/initiate", async (req, res) => {
  try {
    const session = await PaymentService.initiate(req.body);
    res.status(201).json({ payment_session: session });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// POST /api/v1/store/payment/capture
// Body: { session_id, order_id }
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.post("/payment/capture", async (req, res) => {
  try {
    const session = await PaymentService.capture(req.body);
    res.json({ payment_session: session });
  } catch (e) { handleErr(e, res); }
});


<<<<<<< HEAD
// GET /api/v1/store/inventory/:variantId
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
store.get("/inventory/:variantId", (req, res) => {
  try {
    const item = InventoryService.getByVariant(req.params.variantId);
    res.json({ inventory: item });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// ══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES  /api/v1/admin/*
// All admin routes require the X-Admin-Secret header.
// ══════════════════════════════════════════════════════════════════════════════

const admin = express.Router();
admin.use(adminOnly);
app.use("/api/v1/admin", admin);
=======
const admin = express.Router();
admin.use(adminOnly);
app.use("/api/v1/admin", admin);


>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761


<<<<<<< HEAD
// GET /api/v1/admin/stats
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.get("/stats", (_req, res) => {
  try {
    const products = ProductService.stats();
    const orders   = OrderService.stats();
    res.json({ products, orders });
  } catch (e) { handleErr(e, res); }
});


<<<<<<< HEAD
// GET /api/v1/admin/products
// Query: offset, limit, status (all|published|draft), category, search, sort
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.get("/products", (req, res) => {
  try {
    const result = ProductService.list({
      offset:   parseInt(String(req.query.offset ?? "0"), 10),
      limit:    parseInt(String(req.query.limit  ?? "12"), 10),
      status:   (req.query.status as "all") ?? "all",
      category: req.query.category as string,
      search:   req.query.search   as string,
      sort:     req.query.sort     as "newest",
    });
    res.json(result);
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// GET /api/v1/admin/products/:id
=======

>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.get("/products/:id", (req, res) => {
  try {
    res.json({ product: ProductService.getById(req.params.id) });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// POST /api/v1/admin/products
// Body: CreateProductInput
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.post("/products", async (req, res) => {
  try {
    const product = await ProductService.create(req.body);
    res.status(201).json({ product });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// PATCH /api/v1/admin/products/:id
// Body: UpdateProductInput (partial)
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.patch("/products/:id", async (req, res) => {
  try {
    const product = await ProductService.update(req.params.id, req.body);
    res.json({ product });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// DELETE /api/v1/admin/products/:id
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.delete("/products/:id", async (req, res) => {
  try {
    const result = await ProductService.delete(req.params.id);
    res.json(result);
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// DELETE /api/v1/admin/products  (bulk)
// Body: { ids: string[] }
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.delete("/products", async (req, res) => {
  try {
    const result = await ProductService.bulkDelete(req.body.ids);
    res.json(result);
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// POST /api/v1/admin/products/:id/publish
=======

>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.post("/products/:id/publish", async (req, res) => {
  try {
    const product = await ProductService.publish(req.params.id);
    res.json({ product });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// POST /api/v1/admin/products/:id/unpublish
=======

>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.post("/products/:id/unpublish", async (req, res) => {
  try {
    const product = await ProductService.unpublish(req.params.id);
    res.json({ product });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// PATCH /api/v1/admin/products/:id/inventory
// Body: { variant_id, delta }  (delta can be negative to decrement)
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.patch("/products/:id/inventory", async (req, res) => {
  try {
    const { variant_id, delta } = req.body;
    await ProductService.adjustInventory(req.params.id, variant_id, delta);
    res.json({ success: true });
  } catch (e) { handleErr(e, res); }
});


<<<<<<< HEAD
// GET /api/v1/admin/orders
// Query: offset, limit, status, search, sort
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.get("/orders", (req, res) => {
  try {
    const result = OrderService.list({
      offset: parseInt(String(req.query.offset ?? "0"), 10),
      limit:  parseInt(String(req.query.limit  ?? "20"), 10),
      status: req.query.status as "all",
      search: req.query.search as string,
      sort:   req.query.sort   as "newest",
    });
    res.json(result);
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// GET /api/v1/admin/orders/:id
=======

>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.get("/orders/:id", (req, res) => {
  try {
    res.json({ order: OrderService.getById(req.params.id) });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// POST /api/v1/admin/orders/:id/fulfill
=======

>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.post("/orders/:id/fulfill", async (req, res) => {
  try {
    const order = await OrderService.fulfill(req.params.id);
    res.json({ order });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// POST /api/v1/admin/orders/:id/cancel
=======

>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.post("/orders/:id/cancel", async (req, res) => {
  try {
    const order = await OrderService.cancel(req.params.id);
    res.json({ order });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// POST /api/v1/admin/orders/:id/refund
// Body: { amount, reason? }
=======


>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.post("/orders/:id/refund", async (req, res) => {
  try {
    const order = await OrderService.refund({
      order_id: req.params.id,
      amount:   req.body.amount,
      reason:   req.body.reason,
    });
    res.json({ order });
  } catch (e) { handleErr(e, res); }
});


<<<<<<< HEAD
// GET /api/v1/admin/customers/:id
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.get("/customers/:id", (req, res) => {
  try {
    res.json({ customer: AuthService.getById(req.params.id) });
  } catch (e) { handleErr(e, res); }
});


<<<<<<< HEAD
// GET /api/v1/admin/discounts
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.get("/discounts", async (req, res) => {
  try {
    const result = await DiscountService.list();
    res.json({ discounts: result });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// POST /api/v1/admin/discounts
// Body: { code, type, value, min_subtotal?, max_uses?, expires_at? }
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.post("/discounts", async (req, res) => {
  try {
    const discount = await DiscountService.create(req.body);
    res.status(201).json({ discount });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// DELETE /api/v1/admin/discounts/:id
=======

>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.delete("/discounts/:id", async (req, res) => {
  try {
    await DiscountService.delete(req.params.id);
    res.json({ deleted: req.params.id });
  } catch (e) { handleErr(e, res); }
});


<<<<<<< HEAD
// GET /api/v1/admin/inventory
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.get("/inventory", async (req, res) => {
  try {
    const items = await InventoryService.listAll();
    res.json({ inventory: items });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// PATCH /api/v1/admin/inventory/:variantId
// Body: { stocked_quantity }
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.patch("/inventory/:variantId", async (req, res) => {
  try {
    const item = await InventoryService.setStock(
      req.params.variantId,
      req.body.stocked_quantity,
    );
    res.json({ inventory: item });
  } catch (e) { handleErr(e, res); }
});


<<<<<<< HEAD
// GET /api/v1/admin/shipping-options
=======
>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.get("/shipping-options", async (req, res) => {
  try {
    const options = await ShippingService.listOptions();
    res.json({ shipping_options: options });
  } catch (e) { handleErr(e, res); }
});

<<<<<<< HEAD
// POST /api/v1/admin/shipping-options
=======

>>>>>>> d62d5290330e41a6f40d13e41110ad21d1db1761
admin.post("/shipping-options", async (req, res) => {
  try {
    const option = await ShippingService.createOption(req.body);
    res.status(201).json({ shipping_option: option });
  } catch (e) { handleErr(e, res); }
});
if (process.env.NODE_ENV !== "production") {
  // Subscribe to every event and log it
  const ALL_EVENTS = Object.values(EVENT);
  for (const event of ALL_EVENTS) {
    eventBus.on(event, (payload) => {
      console.log(`[EventBus] ${event}`, JSON.stringify(payload, null, 2));
    });
  }
}


app.use((_req, res) => {
  res.status(404).json(err("NOT_FOUND", "Route not found"));
});


app.use((e: unknown, _req: Request, res: Response, _next: NextFunction) => {
  handleErr(e, res);
});

app.listen(PORT, () => {
  console.log(`
  ┌──────────────────────────────────────────┐
  │   commit&conquer API                     │
  │                                          │
  │   Store:  http://localhost:${PORT}/api/v1/store │
  │   Admin:  http://localhost:${PORT}/api/v1/admin │
  │   Health: http://localhost:${PORT}/health     │
  │                                          │
  │   ENV: ${process.env.NODE_ENV ?? "development"}                     │
  └──────────────────────────────────────────┘
  `);
});

export default app;