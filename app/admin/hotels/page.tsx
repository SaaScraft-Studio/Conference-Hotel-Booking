"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MapPin,
  Star,
  CreditCard as Edit,
  Trash2,
  X,
  Save,
  Building,
} from "lucide-react";
import { Hotel, RoomType } from "@/types/admin";
import AdminLayout from "@/app/components/admin/AdminLayout";

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<Partial<Hotel>>({
    name: "",
    imageUrl: "",
    mapLink: "",
    starRating: 5,
    address: "",
    distances: {
      railwayStation: "",
      airport: "",
      venue: "",
    },
    roomTypes: [],
    policies: [""],
    isActive: true,
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchHotels();
  }, [router]);

  const fetchHotels = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch("/api/admin/hotels", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setHotels(result.hotels || []);
      }
    } catch (error) {
      console.error("Failed to fetch hotels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("admin-token");
      const url = editingHotel
        ? `/api/admin/hotels/${editingHotel._id}`
        : "/api/admin/hotels";
      const method = editingHotel ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchHotels();
        setShowForm(false);
        setEditingHotel(null);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save hotel:", error);
    }
  };

  const handleDelete = async (hotelId: string) => {
    if (!confirm("Are you sure you want to delete this hotel?")) return;

    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/hotels/${hotelId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchHotels();
      }
    } catch (error) {
      console.error("Failed to delete hotel:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      imageUrl: "",
      mapLink: "",
      starRating: 5,
      address: "",
      distances: {
        railwayStation: "",
        airport: "",
        venue: "",
      },
      roomTypes: [],
      policies: [""],
      isActive: true,
    });
  };

  const addRoomType = () => {
    setFormData({
      ...formData,
      roomTypes: [
        ...(formData.roomTypes || []),
        { type: "", occupancy: "single", maxGuests: 1, price: 0 },
      ],
    });
  };

  const updateRoomType = (index: number, field: keyof RoomType, value: any) => {
    const updatedRoomTypes = [...(formData.roomTypes || [])];
    updatedRoomTypes[index] = { ...updatedRoomTypes[index], [field]: value };
    setFormData({ ...formData, roomTypes: updatedRoomTypes });
  };

  const removeRoomType = (index: number) => {
    const updatedRoomTypes =
      formData.roomTypes?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, roomTypes: updatedRoomTypes });
  };

  const addPolicy = () => {
    setFormData({
      ...formData,
      policies: [...(formData.policies || []), ""],
    });
  };

  const updatePolicy = (index: number, value: string) => {
    const updatedPolicies = [...(formData.policies || [])];
    updatedPolicies[index] = value;
    setFormData({ ...formData, policies: updatedPolicies });
  };

  const removePolicy = (index: number) => {
    const updatedPolicies =
      formData.policies?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, policies: updatedPolicies });
  };

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hotels</h1>
            <p className="text-gray-600 mt-2">Manage your hotel properties</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingHotel(null);
              resetForm();
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Hotel
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search hotels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Hotels Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map((hotel) => (
              <Card
                key={hotel._id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${hotel.imageUrl})` }}
                >
                  <div className="h-full bg-black bg-opacity-40 flex items-end p-4">
                    <div className="text-white">
                      <div className="flex items-center space-x-1 mb-2">
                        {[...Array(hotel.starRating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <h3 className="text-lg font-semibold">{hotel.name}</h3>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start space-x-2 mb-3">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <p className="text-sm text-gray-600">{hotel.address}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Railway:</span>{" "}
                      {hotel.distances.railwayStation}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Airport:</span>{" "}
                      {hotel.distances.airport}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="font-medium">
                        {hotel.roomTypes.length}
                      </span>{" "}
                      room types
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingHotel(hotel);
                          setFormData(hotel);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(hotel._id!)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Sliding Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingHotel ? "Edit Hotel" : "Add New Hotel"}
                  </h2>
                  <Button variant="ghost" onClick={() => setShowForm(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Basic Information
                    </h3>

                    <div>
                      <Label htmlFor="name">Hotel Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="imageUrl">Hotel Image URL *</Label>
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, imageUrl: e.target.value })
                        }
                        placeholder="https://example.com/hotel-image.jpg"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="mapLink">Google Maps Link *</Label>
                      <Input
                        id="mapLink"
                        value={formData.mapLink}
                        onChange={(e) =>
                          setFormData({ ...formData, mapLink: e.target.value })
                        }
                        placeholder="https://maps.google.com/..."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="starRating">Star Rating</Label>
                      <Select
                        value={formData.starRating?.toString()}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            starRating: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <SelectItem key={rating} value={rating.toString()}>
                              {rating} Star{rating > 1 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Distances */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Distances
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="railwayStation">Railway Station</Label>
                        <Input
                          id="railwayStation"
                          value={formData.distances?.railwayStation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              distances: {
                                ...formData.distances!,
                                railwayStation: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g., 5 km"
                        />
                      </div>
                      <div>
                        <Label htmlFor="airport">Airport</Label>
                        <Input
                          id="airport"
                          value={formData.distances?.airport}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              distances: {
                                ...formData.distances!,
                                airport: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g., 15 km"
                        />
                      </div>
                      <div>
                        <Label htmlFor="venue">Venue</Label>
                        <Input
                          id="venue"
                          value={formData.distances?.venue}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              distances: {
                                ...formData.distances!,
                                venue: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g., 2 km"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Room Types */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Room Types
                      </h3>
                      <Button type="button" onClick={addRoomType} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Room Type
                      </Button>
                    </div>

                    {formData.roomTypes?.map((roomType, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Room Type {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRoomType(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Type Name</Label>
                            <Input
                              value={roomType.type}
                              onChange={(e) =>
                                updateRoomType(index, "type", e.target.value)
                              }
                              placeholder="e.g., Deluxe Room"
                            />
                          </div>
                          <div>
                            <Label>Occupancy</Label>
                            <Select
                              value={roomType.occupancy}
                              onValueChange={(value) =>
                                updateRoomType(index, "occupancy", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="double">Double</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Max Guests</Label>
                            <Input
                              type="number"
                              value={roomType.maxGuests}
                              onChange={(e) =>
                                updateRoomType(
                                  index,
                                  "maxGuests",
                                  parseInt(e.target.value)
                                )
                              }
                              min="1"
                            />
                          </div>
                          <div>
                            <Label>Price (₹)</Label>
                            <Input
                              type="number"
                              value={roomType.price}
                              onChange={(e) =>
                                updateRoomType(
                                  index,
                                  "price",
                                  parseInt(e.target.value)
                                )
                              }
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Policies */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Policies
                      </h3>
                      <Button type="button" onClick={addPolicy} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Policy
                      </Button>
                    </div>

                    {formData.policies?.map((policy, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          value={policy}
                          onChange={(e) => updatePolicy(index, e.target.value)}
                          placeholder="Enter policy text"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePolicy(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingHotel ? "Update Hotel" : "Create Hotel"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
