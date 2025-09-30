import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("hotel_bookings");
    const admins = db.collection("admins");

    // Change these credentials for your first admin
    const username = "admin";
    const password = "admin123"; // ❗ change this before deploying
    const role = "superadmin";

    // Check if already exists
    const existing = await admins.findOne({ username });
    if (existing) {
      return NextResponse.json({
        success: false,
        message: "Admin already exists. Remove this seed route!",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new admin
    const result = await admins.insertOne({
      username,
      password: hashedPassword,
      role,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      id: result.insertedId,
      username,
      password, // just to confirm what you set (plaintext only here)
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed admin" },
      { status: 500 }
    );
  }
}
