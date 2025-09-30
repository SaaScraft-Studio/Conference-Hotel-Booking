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

    // Transform booking data to payment format
    const result = await bookings.find({}).sort({ createdAt: -1 }).toArray();

    const payments = result.map((booking) => ({
      _id: booking._id,
      paymentId: booking.paymentId || "N/A",
      bookingId: booking.bookingId,
      customerName: `${booking.firstName} ${booking.lastName}`,
      customerEmail: booking.email,
      amount: booking.amount,
      status: booking.paymentStatus,
      paymentMethod: "Instamojo",
      createdAt: booking.createdAt,
    }));

    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Admin payments fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
