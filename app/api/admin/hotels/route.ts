import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { Hotel } from "@/types/admin";

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
    const hotels = db.collection("hotels");

    const result = await hotels.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      hotels: result,
    });
  } catch (error) {
    console.error("Hotels fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = isAuthenticated(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const hotelData: Partial<Hotel> = await request.json();

    const client = await clientPromise;
    const db = client.db("hotel_bookings");
    const hotels = db.collection("hotels");

    // Remove or convert _id if it's a string
    const { _id, ...hotelDataWithoutId } = hotelData;
    const newHotel = {
      ...hotelDataWithoutId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await hotels.insertOne(newHotel);

    return NextResponse.json({
      success: true,
      hotelId: result.insertedId,
    });
  } catch (error) {
    console.error("Hotel creation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
