import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET all bookings (for admin purposes)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const bookingId = searchParams.get("bookingId");

    const client = await clientPromise;
    const db = client.db("hotel_bookings");
    const bookings = db.collection("bookings");

    let query = {};

    if (email) {
      query = { email };
    } else if (bookingId) {
      query = { bookingId };
    }

    const result = await bookings.find(query).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      bookings: result,
    });
  } catch (error) {
    console.error("Bookings fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
