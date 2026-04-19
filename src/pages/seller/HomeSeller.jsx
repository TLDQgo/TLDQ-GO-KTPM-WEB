import React from "react";
import { Link } from "react-router-dom";
export default function HomeSeller() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Seller Dashboard
        </h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Products
            </h3>
            <p className="text-2xl font-bold text-blue-600">25</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Orders
            </h3>
            <p className="text-2xl font-bold text-green-600">150</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Revenue</h3>
            <p className="text-2xl font-bold text-purple-600">$12,500</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">
              Pending Orders
            </h3>
            <p className="text-2xl font-bold text-red-600">5</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Orders
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Order ID
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Customer
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-2 text-sm text-gray-900">#12345</td>
                  <td className="px-4 py-2 text-sm text-gray-900">John Doe</td>
                  <td className="px-4 py-2 text-sm text-gray-900">Product A</td>
                  <td className="px-4 py-2 text-sm text-green-600">
                    Completed
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">$50</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-sm text-gray-900">#12346</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    Jane Smith
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">Product B</td>
                  <td className="px-4 py-2 text-sm text-yellow-600">Pending</td>
                  <td className="px-4 py-2 text-sm text-gray-900">$75</td>
                </tr>
                {/* Add more rows as needed */}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/seller/them-san-pham" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center block">
              Add New Product
            </Link>
            <Link to="/seller/orders" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center block">
              View All Orders
            </Link>
            <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-center">
              Manage Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
