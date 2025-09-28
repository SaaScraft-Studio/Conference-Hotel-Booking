import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, name, paymentId, amount, bookingId } = await request.json();

    const emailData = {
      from: {
        address: process.env.ZEPTO_FROM!,
        name: "Hyatt Regency Pune"
      },
      to: [
        {
          email_address: {
            address: email,
            name: name
          }
        }
      ],
      subject: "Booking Confirmation - Hyatt Regency Pune & Residences",
      htmlbody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Booking Confirmed!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Hyatt Regency Pune & Residences</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9ff;">
            <h2 style="color: #333; margin-bottom: 20px;">Dear ${name},</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Thank you for choosing Hyatt Regency Pune & Residences. Your booking has been confirmed successfully.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #667eea; margin-top: 0;">Booking Details</h3>
              <p><strong>Booking ID:</strong> ${bookingId}</p>
              <p><strong>Payment ID:</strong> ${paymentId}</p>
              <p><strong>Amount Paid:</strong> ₹${amount}</p>
              <p><strong>Payment Status:</strong> <span style="color: #10b981;">Confirmed</span></p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #667eea; margin-top: 0;">Hotel Information</h3>
              <p><strong>Hotel:</strong> Hyatt Regency Pune & Residences</p>
              <p><strong>Address:</strong> Weikfield IT City, Nagar Rd, Ramwadi, Waghere, Pune, Maharashtra 411014</p>
              <p><strong>Phone:</strong> +91 20 6645 1234</p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Please keep this confirmation email for your records. If you have any questions, feel free to contact our customer service team.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #888; font-size: 14px;">
                Thank you for choosing Hyatt Regency Pune & Residences<br>
                We look forward to hosting you!
              </p>
            </div>
          </div>
        </div>
      `
    };

    const response = await fetch(`${process.env.ZEPTO_URL}/v1.1/email`, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-enczapikey ${process.env.ZEPTO_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Confirmation email sent successfully'
      });
    } else {
      console.error('ZeptoMail error:', result);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}