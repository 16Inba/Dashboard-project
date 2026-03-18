import Order from "../models/Order.js";

export async function createOrder(req, res) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      product,
      quantity,
      unitPrice,
      status,
      createdBy,
    } = req.body;

    const required = [
      firstName,
      lastName,
      email,
      phone,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      product,
      quantity,
      unitPrice,
      status,
      createdBy,
    ];

    if (required.some((field) => field === undefined || field === "")) {
      return res.status(400).json({ message: "Please fill the field" });
    }

    const order = await Order.create({
      firstName,
      lastName,
      email,
      phone,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      product,
      quantity,
      unitPrice,
      totalAmount: Number(quantity) * Number(unitPrice),
      status,
      createdBy,
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
}

export async function getOrders(req, res) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
}

export async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    if (!id) return res.status(400).json({ message: "Missing order id" });
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    const updateFields = { ...data, totalAmount: Number(data.quantity) * Number(data.unitPrice) };
    const updated = await Order.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update order", error: error.message });
  }
}

export async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Missing order id" });
    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete order", error: error.message });
  }
}
