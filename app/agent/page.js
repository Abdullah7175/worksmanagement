"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { MessageCircleWarning, Activity, CheckCheck, Clock } from "lucide-react"
import { LineChartWithValues } from "@/components/lineChart"
import { PieChartWithValues } from "@/components/pieChart"
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

const statusLabels = {
  1: { label: "Pending", icon: <Clock className="text-yellow-600" /> },
  2: { label: "In Process", icon: <Activity className="text-blue-600" /> },
  3: { label: "Completed", icon: <CheckCheck className="text-green-600" /> },
};

export default function AgentDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, inProcess: 0 });
    const [subtypeData, setSubtypeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!session?.user?.id) return;
        setLoading(true);
        fetch(`/api/requests?creator_id=${session.user.id}&creator_type=agent&limit=1000`)
            .then(res => res.json())
            .then(({ data }) => {
                if (!Array.isArray(data)) throw new Error("Invalid data");
                const total = data.length;
                let completed = 0, pending = 0, inProcess = 0;
                const subtypeCounts = {};
                data.forEach(req => {
                    // Status: 1 = Pending, 2 = In Process, 3 = Completed
                    if (req.status_id === 3) completed++;
                    else if (req.status_id === 2) inProcess++;
                    else pending++;
                    // Pie chart: count by complaint_subtype
                    if (req.complaint_subtype) {
                        subtypeCounts[req.complaint_subtype] = (subtypeCounts[req.complaint_subtype] || 0) + 1;
                    }
                });
                setStats({ total, completed, pending, inProcess });
                setSubtypeData(Object.entries(subtypeCounts).map(([name, value]) => ({ name, value })));
                setLoading(false);
            })
            .catch(e => {
                setError(e.message);
                setLoading(false);
            });
    }, [session?.user?.id]);

    if (loading) {
        return <div className="flex items-center justify-center h-96 text-lg">Loading dashboard...</div>;
    }
    if (error) {
        return <div className="flex items-center justify-center h-96 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="flex flex-col lg:flex-row w-full gap-5">
                <Card className="w-full lg:w-1/4 bg-slate-50 border-2 shadow-md flex items-center p-6">
                    <MessageCircleWarning className="text-indigo-700 mr-4" />
                    <div>
                        <p className="text-md font-medium leading-none">Total Requests</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                </Card>
                <Card className="w-full lg:w-1/4 bg-slate-50 border-2 shadow-md flex items-center p-6">
                    <Clock className="text-yellow-600 mr-4" />
                    <div>
                        <p className="text-md font-medium leading-none">Pending</p>
                        <p className="text-2xl font-bold">{stats.pending}</p>
                    </div>
                </Card>
                <Card className="w-full lg:w-1/4 bg-slate-50 border-2 shadow-md flex items-center p-6">
                    <Activity className="text-blue-600 mr-4" />
                    <div>
                        <p className="text-md font-medium leading-none">In Process</p>
                        <p className="text-2xl font-bold">{stats.inProcess}</p>
                    </div>
                </Card>
                <Card className="w-full lg:w-1/4 bg-slate-50 border-2 shadow-md flex items-center p-6">
                    <CheckCheck className="text-green-600 mr-4" />
                    <div>
                        <p className="text-md font-medium leading-none">Completed</p>
                        <p className="text-2xl font-bold">{stats.completed}</p>
                    </div>
                </Card>
            </div>

            <div className="flex flex-col lg:flex-row w-full gap-8 mt-10">
                <div className="w-full xl:w-1/2 bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Complaint Subtype Distribution</h2>
                    {subtypeData.length > 0 ? (
                        <PieChartWithValues data={subtypeData} />
                    ) : (
                        <div className="text-gray-500">No data available</div>
                    )}
                </div>
            </div>
        </div>
    )
}