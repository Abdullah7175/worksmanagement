"use client"

import { ChartPie } from 'lucide-react'
import { useState } from 'react'
import { LineChartWithValues } from "@/components/lineChart"
import { PieChartWithValues } from "@/components/pieChart"


const reportsData = [
  { id: 1, reportName: 'Annual Report', date: '2024-01-01', status: 'Completed' },
  { id: 2, reportName: 'Sales Summary', date: '2024-01-10', status: 'In Progress' },
  { id: 3, reportName: 'Inventory Overview', date: '2024-01-15', status: 'Completed' },
  { id: 4, reportName: 'Marketing Campaign', date: '2024-02-05', status: 'Pending' },
  { id: 5, reportName: 'Customer Feedback', date: '2024-02-10', status: 'Completed' },
]

const ReportsPage = () => {
  const [reports] = useState(reportsData)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white mx-auto mt-10 mb-5 shadow-sm border sm:rounded-lg p-6 max-w-7xl ">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Reports Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage or view you reports.</p>
          </div>
          <ChartPie className="w-8 h-8 text-blue-950" />
        </div>

        <div className="flex flex-col lg:flex-row w-full gap-8 mt-10">
                <div className="w-full xl:w-1/3">
                <PieChartWithValues />
                </div>
                <div className="w-full xl:w-1/3">
                    <PieChartWithValues />
                </div>
                <div className="w-full xl:w-1/3">
                    <PieChartWithValues />
                </div>
            </div>

        <div className="h-1"></div>
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.reportName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        report.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : report.status === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-indigo-600 hover:text-indigo-900">
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
