export type Hotel = {
  _id: string;
  hotel_name: string;
  star_rating: number;
  main_image_url: string;
  map_link: string;
  address: string;
  distances: string[];
  checkin_start_date: string;
  checkin_end_date: string;
  checkout_start_date: string;
  checkout_end_date: string;
  room_types: {
    name: string;
    description: string;
    max_guests: number;
    price: number;
    total: number;
  }[];
  policies: string[];
};
