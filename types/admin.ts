export interface AdminUser {
  _id?: string;
  username: string;
  password: string;
  role: "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface Hotel {
  _id?: string;
  name: string;
  imageUrl: string;
  mapLink: string;
  starRating: number;
  address: string;
  distances: {
    railwayStation: string;
    airport: string;
    venue: string;
  };
  roomTypes: RoomType[];
  policies: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomType {
  type: string;
  occupancy: "single" | "double";
  maxGuests: number;
  price: number;
  description?: string;
}

export interface AdminStats {
  totalBookings: number;
  totalRevenue: number;
  totalHotels: number;
  pendingBookings: number;
  completedBookings: number;
  failedPayments: number;
}
