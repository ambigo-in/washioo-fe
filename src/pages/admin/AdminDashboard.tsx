import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    axiosInstance.get("/services/admin/all-bookings").then((res) => {
      setBookings(res.data.bookings);
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 border">Booking Ref</th>
            <th className="p-3 border">Customer</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Price</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="p-3 border">{booking.booking_reference}</td>
              <td className="p-3 border">{booking.customer_name}</td>
              <td className="p-3 border">{booking.booking_status}</td>
              <td className="p-3 border">₹{booking.estimated_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
