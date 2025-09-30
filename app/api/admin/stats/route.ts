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

    // Get booking stats
    const bookings = db.collection("bookings");
    const hotels = db.collection("hotels");

    const [
      totalBookings,
      completedBookings,
      pendingBookings,
      failedBookings,
      totalHotels,
      revenueResult,
    ] = await Promise.all([
      bookings.countDocuments(),
      bookings.countDocuments({ paymentStatus: "completed" }),
      bookings.countDocuments({ paymentStatus: "pending" }),
      bookings.countDocuments({ paymentStatus: "failed" }),
      hotels.countDocuments({ isActive: true }),
      bookings
        .aggregate([
          { $match: { paymentStatus: "completed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .toArray(),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const stats = {
      totalBookings,
      totalRevenue,
      totalHotels,
      pendingBookings,
      completedBookings,
      failedPayments: failedBookings,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
