import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const auth = isAuthenticated(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("hotel_bookings");
    const bookings = db.collection("bookings");

    const result = await bookings.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      bookings: result,
    });
  } catch (error) {
    console.error("Admin bookings fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
