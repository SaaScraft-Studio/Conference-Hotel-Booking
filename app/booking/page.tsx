"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  MapPin,
  Calendar,
  Users,
  Shield,
  CreditCard,
  Star,
} from "lucide-react";
import { indianStates } from "@/lib/indian-states";
import { roomTypes, calculateBookingAmount } from "@/lib/room-pricing";
import { BookingFormData } from "@/types/booking";
import { useSearchParams } from "next/navigation";
import { hotels } from "@/data/hotels"; // make sure this is imported


const bookingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  state: z.string().min(1, "Please select a state"),
  companyName: z.string().optional(),
  gst: z.string().optional(),
  checkinDate: z.string().min(1, "Check-in date is required"),
  checkoutDate: z.string().min(1, "Check-out date is required"),
  roomType: z.enum(["single", "double"]),
  agreeToPolicy: z
    .boolean()
    .refine((val) => val === true, "You must agree to the booking policy"),
});

export default function BookingPage() {
  const [checkinDate, setCheckinDate] = useState<Date>();
  const [checkoutDate, setCheckoutDate] = useState<Date>();
  const [roomType, setRoomType] = useState<"single" | "double">("single");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const hotelId = searchParams.get("hotel"); // from query ?hotel=hotelId
  const hotel = hotels.find((h) => h.id === hotelId);


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      roomType: "single",
    },
  });

  const watchedValues = watch();

  const totalAmount = React.useMemo(() => {
    if (checkinDate && checkoutDate && roomType) {
      return calculateBookingAmount(
        checkinDate.toISOString().split("T")[0],
        checkoutDate.toISOString().split("T")[0],
        roomType
      );
    }
    return roomTypes[roomType].price;
  }, [checkinDate, checkoutDate, roomType]);

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          checkinDate: checkinDate?.toISOString().split("T")[0],
          checkoutDate: checkoutDate?.toISOString().split("T")[0],
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to payment URL
        window.location.href = result.paymentUrl;
      } else {
        alert("Payment creation failed: " + result.error);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCheckoutDisabled = (date: Date) => {
    if (!checkinDate) return false;
    return date <= checkinDate;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Banner */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg')] bg-cover bg-center mix-blend-overlay opacity-30"></div>

        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">
              {hotel?.name || "Hotel Name"}
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Experience luxury and comfort in{" "}
              {hotel?.location || "the selected location"}
            </p>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span className="text-sm">{hotel?.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                {Array.from({ length: hotel?.stars || 0 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="text-sm ml-1">{hotel?.stars}-Star Luxury</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Images and Map */}
      <div className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Left: Hotel Image */}
          <Card className="overflow-hidden shadow-2xl">
            <div
              className="h-64 bg-cover bg-center"
              style={{ backgroundImage: `url(${hotel?.image})` }}
            ></div>
          </Card>

          {/* Right: Map */}
          <Card className="overflow-hidden shadow-2xl">
            <div className="h-64 relative">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  hotel?.location || ""
                )}&output=embed`}
                className="w-full h-full"
                loading="lazy"
                title="Hotel Map"
              ></iframe>
            </div>
          </Card>
        </div>

        {/* Booking Form */}
        <Card className="shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
            <CardTitle className="text-2xl flex items-center space-x-2">
              <Calendar className="h-6 w-6" />
              <span>Book Your Stay</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input id="middleName" {...register("middleName")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile *</Label>
                  <Input
                    id="mobile"
                    {...register("mobile")}
                    className={errors.mobile ? "border-red-500" : ""}
                  />
                  {errors.mobile && (
                    <p className="text-red-500 text-sm">
                      {errors.mobile.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select onValueChange={(value) => setValue("state", value)}>
                    <SelectTrigger
                      className={errors.state ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && (
                    <p className="text-red-500 text-sm">
                      {errors.state.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" {...register("companyName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gst">GST Number (Optional)</Label>
                  <Input
                    id="gst"
                    {...register("gst")}
                    placeholder="Enter GST number if applicable"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  {...register("address")}
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Booking Details */}
              <div className="border-t pt-8">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                  Booking Details
                </h3>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label>Check-in Date *</Label>
                    <DatePicker
                      date={checkinDate}
                      setDate={(date) => {
                        setCheckinDate(date);
                        setValue(
                          "checkinDate",
                          date?.toISOString().split("T")[0] || ""
                        );
                      }}
                      placeholder="Select check-in date"
                      disabled={(date) => date < new Date()}
                    />
                    {errors.checkinDate && (
                      <p className="text-red-500 text-sm">
                        {errors.checkinDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Check-out Date *</Label>
                    <DatePicker
                      date={checkoutDate}
                      setDate={(date) => {
                        setCheckoutDate(date);
                        setValue(
                          "checkoutDate",
                          date?.toISOString().split("T")[0] || ""
                        );
                      }}
                      placeholder="Select check-out date"
                      disabled={isCheckoutDisabled}
                    />
                    {errors.checkoutDate && (
                      <p className="text-red-500 text-sm">
                        {errors.checkoutDate.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Room Selection */}
                <div className="space-y-4">
                  <Label>Room Type *</Label>
                  <RadioGroup
                    defaultValue="single"
                    onValueChange={(value: "single" | "double") => {
                      setRoomType(value);
                      setValue("roomType", value);
                    }}
                    className="grid md:grid-cols-2 gap-4"
                  >
                    {Object.entries(roomTypes).map(([key, room]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <RadioGroupItem value={key} id={key} />
                        <Label
                          htmlFor={key}
                          className="flex-1 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{room.name}</div>
                              <div className="text-sm text-gray-500">
                                {room.description}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                ₹{room.price}
                              </div>
                              <div className="text-sm text-gray-500">
                                per night
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.roomType && (
                    <p className="text-red-500 text-sm">
                      {errors.roomType.message}
                    </p>
                  )}
                </div>

                {/* Inventory Info */}
                {/* <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">30 rooms available</span>
                  </div>
                </div> */}
              </div>

              {/* Booking Policy */}
              <div className="border-t pt-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-4">Booking Policy</h4>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li>• Check-in time: 2:00 PM</li>
                    <li>• Check-out time: 12:00 PM</li>
                    <li>
                      • Cancellation allowed up to 24 hours before check-in
                    </li>
                    <li>• Valid ID proof required at check-in</li>
                    <li>• Pet policy: Pets allowed with prior approval</li>
                  </ul>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeToPolicy"
                      onCheckedChange={(checked) =>
                        setValue("agreeToPolicy", checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="agreeToPolicy"
                      className="text-sm cursor-pointer"
                    >
                      I have read and agree to the booking policy *
                    </Label>
                  </div>
                  {errors.agreeToPolicy && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.agreeToPolicy.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">Total Amount</h3>
                    <p className="opacity-90">
                      {checkinDate && checkoutDate
                        ? `${Math.ceil(
                            (checkoutDate.getTime() - checkinDate.getTime()) /
                              (1000 * 60 * 60 * 24)
                          )} night(s) × ₹${roomTypes[roomType].price}`
                        : "Select dates for calculation"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">₹{totalAmount}</div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay Now - ₹{totalAmount}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
