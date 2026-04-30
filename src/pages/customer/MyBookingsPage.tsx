import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    axiosInstance.get("/services/my-bookings").then((res) => {
      setBookings(res.data.bookings);
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="border rounded-xl p-5 shadow">
            <p>
              <strong>Reference:</strong> {booking.booking_reference}
            </p>
            <p>
              <strong>Status:</strong> {booking.booking_status}
            </p>
            <p>
              <strong>Price:</strong> ₹{booking.estimated_price}
            </p>
            <p>
              <strong>Date:</strong> {booking.scheduled_date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookingsPage;