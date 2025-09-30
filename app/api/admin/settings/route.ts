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
    const settings = db.collection("settings");

    const result = await settings.findOne({ type: "system" });

    return NextResponse.json({
      success: true,
      settings: result?.data || null,
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = isAuthenticated(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const settingsData = await request.json();

    const client = await clientPromise;
    const db = client.db("hotel_bookings");
    const settings = db.collection("settings");

    await settings.updateOne(
      { type: "system" },
      {
        $set: {
          type: "system",
          data: settingsData,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
