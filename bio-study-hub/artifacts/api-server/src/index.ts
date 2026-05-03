import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import mongoose from "mongoose";
import { setupBattleSocket } from "./socket/battleSocket";

const port = Number(process.env["PORT"] ?? "8080");

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env["PORT"]}"`);
}

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setupBattleSocket(io);

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
  connectMongo();
});

function connectMongo() {
  const url = process.env.MONGODB_URI || "";
  if (!url) {
    console.warn("MONGODB_URI not set — MongoDB not connected.");
    return;
  }

  mongoose.connection.on("error", (err) => {
    console.warn("MongoDB error:", err.message);
  });

  mongoose
    .connect(url, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    })
    .then(() => console.log("MongoDB Connected ✅"))
    .catch((err) => console.warn("MongoDB connection failed:", err.message));
}
