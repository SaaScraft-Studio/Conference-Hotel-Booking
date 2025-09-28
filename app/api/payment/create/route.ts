import { NextRequest, NextResponse } from "next/server";
import { BookingFormData } from "@/types/booking";
import { calculateBookingAmount } from "@/lib/room-pricing";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingFormData = await request.json();

    const amount = calculateBookingAmount(
      bookingData.checkinDate,
      bookingData.checkoutDate,
      bookingData.roomType
    );

    // Generate booking ID
    const bookingId = `HRP${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 4)
      .toUpperCase()}`;

    const paymentData = {
      purpose: `Hotel Booking - Hyatt Regency Pune`,
      amount: amount.toString(),
      phone: bookingData.mobile,
      buyer_name: `${bookingData.firstName} ${bookingData.lastName}`,
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/success`,
      send_email: "true",
      email: bookingData.email,
      allow_repeated_payments: "false",
    };

    const response = await fetch(
      "https://www.instamojo.com/api/1.1/payment-requests/",
      {
        method: "POST",
        headers: {
          "X-Api-Key": process.env.INSTAMOJO_PRIVATE_API_KEY!,
          "X-Auth-Token": process.env.INSTAMOJO_PRIVATE_AUTH_TOKEN!,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(paymentData).toString(),
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      // Store booking data in MongoDB
      try {
        const client = await clientPromise;
        const db = client.db("hotel_bookings");
        const bookings = db.collection("bookings");

        const bookingRecord = {
          ...bookingData,
          bookingId,
          paymentRequestId: result.payment_request.id,
          amount,
          paymentStatus: "pending" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await bookings.insertOne(bookingRecord);
        console.log("Booking stored successfully:", bookingId);
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Continue with payment even if DB fails
      }
      return NextResponse.json({
        success: true,
        paymentUrl: result.payment_request.longurl,
        paymentRequestId: result.payment_request.id,
        bookingId,
        amount,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.message || "Payment creation failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
