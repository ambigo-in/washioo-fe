import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const ServicesPage = () => {
  const [services, setServices] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get("/services/").then((res) => {
      setServices(res.data.services);
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Available Services</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="border rounded-2xl p-6 shadow hover:shadow-lg cursor-pointer"
          >
            <h2 className="text-2xl font-semibold">{service.service_name}</h2>
            <p className="text-gray-600 mt-2">{service.description}</p>
            <p className="text-blue-600 text-xl font-bold mt-4">
              ₹{service.base_price}
            </p>
            <button
              onClick={() => navigate(`/booking/${service.id}`)}
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded"
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;
