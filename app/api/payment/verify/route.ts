import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { payment_id, payment_request_id } = await request.json();

    const response = await fetch(
      `https://www.instamojo.com/api/1.1/payments/${payment_id}/`,
      {
        method: "GET",
        headers: {
          "X-Api-Key": process.env.INSTAMOJO_PRIVATE_API_KEY!,
          "X-Auth-Token": process.env.INSTAMOJO_PRIVATE_AUTH_TOKEN!,
        },
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      const payment = result.payment;

      if (payment.status === "Credit") {
        // Update booking status in MongoDB
        try {
          const client = await clientPromise;
          const db = client.db("hotel_bookings");
          const bookings = db.collection("bookings");

          const updateResult = await bookings.updateOne(
            { paymentRequestId: payment_request_id },
            {
              $set: {
                paymentId: payment_id,
                paymentStatus: "completed",
                updatedAt: new Date(),
              },
            }
          );

          console.log("Booking updated:", updateResult.modifiedCount);
        } catch (dbError) {
          console.error("Database update error:", dbError);
          // Continue with email even if DB update fails
        }

        // Payment successful - trigger email
        try {
          await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/email/send-confirmation`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: payment.buyer_email,
                name: payment.buyer_name,
                paymentId: payment_id,
                amount: payment.amount,
                bookingId: `HRP${Date.now()}`,
              }),
            }
          );
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
          // Don't fail the payment verification if email fails
        }

        return NextResponse.json({
          success: true,
          payment: payment,
          bookingConfirmed: true,
        });
      } else {
        // Update booking status to failed
        try {
          const client = await clientPromise;
          const db = client.db("hotel_bookings");
          const bookings = db.collection("bookings");

          await bookings.updateOne(
            { paymentRequestId: payment_request_id },
            {
              $set: {
                paymentStatus: "failed",
                updatedAt: new Date(),
              },
            }
          );
        } catch (dbError) {
          console.error("Database update error:", dbError);
        }

        return NextResponse.json({
          success: false,
          error: "Payment not completed",
        });
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
