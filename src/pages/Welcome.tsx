import { Link } from "react-router-dom";
import { MapPin, Shield, Clock, Bus, Bell, Users, Route } from "lucide-react";
import { motion } from "framer-motion";

export default function Welcome() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl"
          >
            Intelligent Campus Transportation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Experience seamless campus mobility with real-time tracking, smart
            scheduling, and advanced safety features.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10"
          >
            <Link
              to="/live-tracking"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 inline-block shadow-lg hover:shadow-xl"
            >
              Track Your Bus
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            Advanced Features
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <MapPin className="w-12 h-12 text-indigo-600 mb-4" />,
                title: "Real-Time GPS Tracking",
                description:
                  "Monitor bus locations with precise GPS technology and live updates every 30 seconds.",
              },
              {
                icon: <Shield className="w-12 h-12 text-indigo-600 mb-4" />,
                title: "Enhanced Safety",
                description:
                  "Emergency response system, driver authentication, and route monitoring for maximum security.",
              },
              {
                icon: <Clock className="w-12 h-12 text-indigo-600 mb-4" />,
                title: "Smart Scheduling",
                description:
                  "AI-powered route optimization and dynamic scheduling for efficient campus transportation.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="p-8 rounded-xl bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 border border-gray-100"
              >
                <div className="flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Benefits Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-center text-white mb-12"
          >
            Key Benefits
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Bus className="w-12 h-12 text-white mx-auto mb-4" />,
                title: "Efficient Routes",
                description:
                  "Optimized paths reduce travel time and fuel consumption",
              },
              {
                icon: <Bell className="w-12 h-12 text-white mx-auto mb-4" />,
                title: "Instant Alerts",
                description:
                  "Real-time notifications for delays and schedule changes",
              },
              {
                icon: <Users className="w-12 h-12 text-white mx-auto mb-4" />,
                title: "User Analytics",
                description: "Data-driven insights for better service planning",
              },
              {
                icon: <Route className="w-12 h-12 text-white mx-auto mb-4" />,
                title: "Route Management",
                description:
                  "Easy-to-use interface for route planning and adjustments",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-indigo-800/40 backdrop-blur-sm p-8 rounded-xl text-center transform hover:scale-105 transition-all duration-300 hover:bg-indigo-800/50 border border-indigo-700/30"
              >
                {benefit.icon}
                <h3 className="text-xl font-semibold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-indigo-100">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-gray-900 mb-6"
          >
            Experience the Future of Campus Transportation
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            Join our network of educational institutions benefiting from smart
            transportation solutions.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center space-x-4"
          >
            <Link
              to="/live-tracking"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Tracking
            </Link>
            <Link
              to="/dashboard"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium border-2 border-indigo-600 hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View Dashboard
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
