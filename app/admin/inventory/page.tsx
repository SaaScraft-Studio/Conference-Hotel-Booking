"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Search,
  Plus,
  Minus,
  TriangleAlert as AlertTriangle,
  TrendingUp,
  Building,
} from "lucide-react";
import AdminLayout from "@/app/components/admin/AdminLayout";

interface InventoryItem {
  _id: string;
  hotelName: string;
  roomType: string;
  totalRooms: number;
  availableRooms: number;
  bookedRooms: number;
  maintenanceRooms: number;
  price: number;
  lastUpdated: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchInventory();
  }, [router]);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch("/api/admin/inventory", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setInventory(result.inventory || []);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRoomCount = async (
    itemId: string,
    field: string,
    change: number
  ) => {
    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/inventory/${itemId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ field, change }),
      });

      if (response.ok) {
        await fetchInventory();
      }
    } catch (error) {
      console.error("Failed to update inventory:", error);
    }
  };

  const getOccupancyRate = (item: InventoryItem) => {
    return Math.round((item.bookedRooms / item.totalRooms) * 100);
  };

  const getAvailabilityStatus = (item: InventoryItem) => {
    const availabilityRate = (item.availableRooms / item.totalRooms) * 100;
    if (availabilityRate < 20)
      return { status: "Low", color: "bg-red-100 text-red-800" };
    if (availabilityRate < 50)
      return { status: "Medium", color: "bg-yellow-100 text-yellow-800" };
    return { status: "High", color: "bg-green-100 text-green-800" };
  };

  const filteredInventory = inventory.filter(
    (item) =>
      item.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.roomType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRooms = inventory.reduce((sum, item) => sum + item.totalRooms, 0);
  const totalAvailable = inventory.reduce(
    (sum, item) => sum + item.availableRooms,
    0
  );
  const totalBooked = inventory.reduce(
    (sum, item) => sum + item.bookedRooms,
    0
  );
  const totalMaintenance = inventory.reduce(
    (sum, item) => sum + item.maintenanceRooms,
    0
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage room availability across all properties
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Rooms
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalRooms}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                  <Building className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">100%</span>
                <span className="text-sm text-gray-500 ml-1">capacity</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-green-600">
                    {totalAvailable}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-green-600">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span className="text-sm font-medium text-green-600">
                  {Math.round((totalAvailable / totalRooms) * 100)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">available</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Booked</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalBooked}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span className="text-sm font-medium text-blue-600">
                  {Math.round((totalBooked / totalRooms) * 100)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">occupancy</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Maintenance
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {totalMaintenance}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span className="text-sm font-medium text-orange-600">
                  {Math.round((totalMaintenance / totalRooms) * 100)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  under maintenance
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search hotels or room types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Inventory Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Room Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Hotel
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Room Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Total
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Available
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Booked
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Maintenance
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Occupancy
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => {
                      const availability = getAvailabilityStatus(item);
                      return (
                        <tr
                          key={item._id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium">{item.hotelName}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{item.roomType}</div>
                            <div className="text-sm text-gray-600">
                              ₹{item.price}/night
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold">
                              {item.totalRooms}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateRoomCount(
                                    item._id,
                                    "availableRooms",
                                    -1
                                  )
                                }
                                disabled={item.availableRooms <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-semibold w-8 text-center">
                                {item.availableRooms}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateRoomCount(item._id, "availableRooms", 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateRoomCount(item._id, "bookedRooms", -1)
                                }
                                disabled={item.bookedRooms <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-semibold w-8 text-center">
                                {item.bookedRooms}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateRoomCount(item._id, "bookedRooms", 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateRoomCount(
                                    item._id,
                                    "maintenanceRooms",
                                    -1
                                  )
                                }
                                disabled={item.maintenanceRooms <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-semibold w-8 text-center">
                                {item.maintenanceRooms}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateRoomCount(
                                    item._id,
                                    "maintenanceRooms",
                                    1
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${getOccupancyRate(item)}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">
                                {getOccupancyRate(item)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={availability.color}>
                              {availability.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredInventory.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No inventory found
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm
                        ? "Try adjusting your search criteria."
                        : "Inventory data will appear here once hotels are added."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
