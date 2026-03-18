import mongoose from "mongoose";

const DashboardConfigSchema = new mongoose.Schema(
  {
    widgets: { type: Array, default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("DashboardConfig", DashboardConfigSchema);
