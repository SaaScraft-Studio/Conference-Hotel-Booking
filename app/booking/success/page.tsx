"use client"

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleCheck as CheckCircle, Mail, Phone, MapPin, Calendar, Chrome as Home } from 'lucide-react';

export default function BookingSuccessPage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const paymentRequestId = searchParams.get('payment_request_id');

    if (paymentId && paymentRequestId) {
      verifyPayment(paymentId, paymentRequestId);
    } else {
      setVerificationStatus('failed');
    }
  }, [searchParams]);

  const verifyPayment = async (paymentId: string, paymentRequestId: string) => {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: paymentId,
          payment_request_id: paymentRequestId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setVerificationStatus('success');
        setBookingDetails({
          paymentId,
          amount: result.payment.amount,
          bookingId: `HRP${Date.now()}`,
          customerName: result.payment.buyer_name,
          customerEmail: result.payment.buyer_email,
        });
      } else {
        setVerificationStatus('failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setVerificationStatus('failed');
    }
  };

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your booking...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-800">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-4">We couldn't verify your payment. Please contact support if money was deducted.</p>
            <Button onClick={() => router.push('/booking')} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16" />
            </div>
            <CardTitle className="text-3xl">Booking Confirmed!</CardTitle>
            <p className="text-green-100 mt-2">Thank you for choosing Hyatt Regency Pune & Residences</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Booking Details */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Booking Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Booking ID</p>
                    <p className="font-semibold">{bookingDetails?.bookingId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment ID</p>
                    <p className="font-semibold">{bookingDetails?.paymentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Guest Name</p>
                    <p className="font-semibold">{bookingDetails?.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount Paid</p>
                    <p className="font-semibold text-green-600">₹{bookingDetails?.amount}</p>
                  </div>
                </div>
              </div>

              {/* Hotel Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Hotel Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Home className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-semibold">Hyatt Regency Pune & Residences</p>
                      <p className="text-sm text-gray-600">5-Star Luxury Hotel</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm">Weikfield IT City, Nagar Rd, Ramwadi, Waghere</p>
                      <p className="text-sm text-gray-600">Pune, Maharashtra 411014</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <p className="text-sm">+91 20 6645 1234</p>
                  </div>
                </div>
              </div>

              {/* Email Confirmation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Confirmation Email Sent</p>
                    <p className="text-sm text-blue-600">A detailed confirmation has been sent to {bookingDetails?.customerEmail}</p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">What's Next?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>You will receive a confirmation email with all details</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Please carry a valid ID proof during check-in</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>For any queries, contact our customer support</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Homepage
                </Button>
                <Button
                  onClick={() => window.print()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-700"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Confirmation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}