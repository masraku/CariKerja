import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";

// Load .env manual
try {
  const envPath = path.resolve(process.cwd(), ".env");
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...values] = line.split("=");
    const value = values.join("=");
    if (key && value) {
      let val = value.trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key.trim()] = val;
    }
  });
} catch (e) {
  console.error("Failed to load .env:", e);
}

const redis = Redis.fromEnv();

async function checkRedis() {
  try {
    console.log("Checking Redis connection...");
    const isMaintenance = await redis.get("system:maintenance");
    console.log("Maintenance Key Value:", isMaintenance);
    console.log("Type:", typeof isMaintenance);
    
    if (isMaintenance) {
        console.log("✅ Maintenance mode is SET in Redis.");
    } else {
        console.log("❌ Maintenance mode is NOT set (or null/undefined).");
    }
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
}

checkRedis();
