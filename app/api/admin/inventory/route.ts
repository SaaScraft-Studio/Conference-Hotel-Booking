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
    const inventory = db.collection("inventory");

    // Check if inventory collection exists, if not create sample data
    const count = await inventory.countDocuments();

    if (count === 0) {
      // Create sample inventory data
      const sampleInventory = [
        {
          hotelName: "Hyatt Regency Pune & Residences",
          roomType: "Single Occupancy",
          totalRooms: 50,
          availableRooms: 30,
          bookedRooms: 15,
          maintenanceRooms: 5,
          price: 100,
          lastUpdated: new Date(),
        },
        {
          hotelName: "Hyatt Regency Pune & Residences",
          roomType: "Double Occupancy",
          totalRooms: 40,
          availableRooms: 25,
          bookedRooms: 12,
          maintenanceRooms: 3,
          price: 150,
          lastUpdated: new Date(),
        },
      ];

      await inventory.insertMany(sampleInventory);
    }

    const result = await inventory
      .find({})
      .sort({ hotelName: 1, roomType: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      inventory: result,
    });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
