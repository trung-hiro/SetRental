import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClothingSetSchema, insertOrderSchema, insertOrderItemSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validated = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validated);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, validated);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to delete category" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Clothing Sets routes
  app.get("/api/clothing-sets", async (req, res) => {
    try {
      const sets = await storage.getClothingSets();
      res.json(sets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clothing sets" });
    }
  });

  app.get("/api/clothing-sets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const set = await storage.getClothingSet(id);
      if (!set) {
        return res.status(404).json({ message: "Clothing set not found" });
      }
      res.json(set);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clothing set" });
    }
  });

  app.post("/api/clothing-sets", upload.single('image'), async (req, res) => {
    try {
      console.log("Request body:", req.body);
      console.log("Request file:", req.file);
      console.log("Body keys:", Object.keys(req.body));
      console.log("Body values:", Object.values(req.body));
      
      const data = {
        ...req.body,
        quantity: parseInt(req.body.quantity),
        pricePerDay: req.body.pricePerDay ? parseFloat(req.body.pricePerDay).toString() : "0",
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null
      };

      console.log("Data to validate:", data);
      const validated = insertClothingSetSchema.parse(data);
      console.log("Validated data:", validated);
      
      const set = await storage.createClothingSet(validated);
      res.status(201).json(set);
    } catch (error) {
      console.log("Error:", error);
      if (error instanceof z.ZodError) {
        console.log("Zod validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create clothing set" });
    }
  });

  app.put("/api/clothing-sets/:id", upload.single('image'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = {
        ...req.body,
        quantity: req.body.quantity ? parseInt(req.body.quantity) : undefined,
        pricePerDay: req.body.pricePerDay ? parseFloat(req.body.pricePerDay) : undefined,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined
      };

      // Remove undefined values
      Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

      const validated = insertClothingSetSchema.partial().parse(data);
      const set = await storage.updateClothingSet(id, validated);
      
      if (!set) {
        return res.status(404).json({ message: "Clothing set not found" });
      }
      
      res.json(set);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update clothing set" });
    }
  });

  app.delete("/api/clothing-sets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteClothingSet(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Clothing set not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete clothing set" });
    }
  });

  // Check availability
  app.post("/api/clothing-sets/:id/check-availability", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { startDate, endDate, quantity } = req.body;
      
      if (!startDate || !endDate || !quantity) {
        return res.status(400).json({ message: "Start date, end date, and quantity are required" });
      }
      
      const availableQuantity = await storage.getAvailableQuantity(
        id, 
        new Date(startDate), 
        new Date(endDate)
      );
      
      res.json({ 
        available: availableQuantity >= quantity,
        availableQuantity,
        requestedQuantity: quantity
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      console.log("Order request body:", req.body);
      const { order, items } = req.body;
      
      if (!order || !items || !Array.isArray(items)) {
        return res.status(400).json({ message: "Order and items are required" });
      }

      console.log("Order data:", order);
      console.log("Items data:", items);

      // Validate order data
      const validatedOrder = insertOrderSchema.parse({
        ...order,
        startDate: new Date(order.startDate),
        endDate: new Date(order.endDate),
        totalAmount: order.totalAmount.toString()
      });

      // Validate items data
      const validatedItems = items.map(item => 
        insertOrderItemSchema.parse({
          clothingSetId: item.clothingSetId,
          quantity: parseInt(item.quantity) || 1,
          pricePerDay: item.pricePerDay.toString()
        })
      );

      // Check availability for all items
      for (const item of validatedItems) {
        const availableQuantity = await storage.getAvailableQuantity(
          item.clothingSetId,
          validatedOrder.startDate,
          validatedOrder.endDate
        );
        
        if (availableQuantity < (item.quantity || 1)) {
          return res.status(400).json({ 
            message: `Insufficient inventory for clothing set ID ${item.clothingSetId}. Available: ${availableQuantity}, Requested: ${item.quantity || 1}` 
          });
        }
      }

      const createdOrder = await storage.createOrder(validatedOrder, validatedItems);
      res.status(201).json(createdOrder);
    } catch (error) {
      console.log("Order creation error:", error);
      if (error instanceof z.ZodError) {
        console.log("Order validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const validStatuses = ['upcoming', 'shipped', 'active', 'returned', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Calendar events
  app.get("/api/calendar/events", async (req, res) => {
    try {
      const { year, month } = req.query;
      const orders = await storage.getOrders();
      
      let filteredOrders = orders;
      if (year && month) {
        const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
        const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);
        
        filteredOrders = orders.filter(order => {
          const orderStart = new Date(order.startDate);
          const orderEnd = new Date(order.endDate);
          return (orderStart <= endDate && orderEnd >= startDate);
        });
      }
      
      const events: any[] = [];
      
      filteredOrders.forEach(order => {
        // Only show events for non-cancelled orders
        if (order.status === 'cancelled') return;
        
        const startDate = new Date(order.startDate);
        const endDate = new Date(order.endDate);
        
        // Create event for each day in the rental period
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          events.push({
            id: `${order.id}-${date.toISOString().split('T')[0]}`,
            orderId: order.id,
            title: order.items.map(item => item.clothingSet.name).join(', '),
            customer: order.customerName,
            phone: order.customerPhone,
            date: new Date(date).toISOString().split('T')[0],
            startDate: order.startDate,
            endDate: order.endDate,
            status: order.status,
            items: order.items.map(item => ({
              name: item.clothingSet.name,
              category: item.clothingSet.category,
              quantity: item.quantity
            }))
          });
        }
      });
      
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  // Check availability for booking
  app.post("/api/availability/check", async (req: Request, res: Response) => {
    try {
      const { clothingSetId, startDate, endDate } = req.body;
      
      if (!clothingSetId || !startDate || !endDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const availableQuantity = await storage.getAvailableQuantity(
        parseInt(clothingSetId), 
        new Date(startDate), 
        new Date(endDate)
      );
      
      const clothingSet = await storage.getClothingSet(parseInt(clothingSetId));
      if (!clothingSet) {
        return res.status(404).json({ message: "Clothing set not found" });
      }

      res.json({
        available: availableQuantity > 0,
        availableQuantity,
        totalQuantity: clothingSet.quantity
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
