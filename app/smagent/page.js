"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Activity, CheckCheck, Clock } from "lucide-react";

const statusColors = {
  1: "text-yellow-600",
  2: "text-blue-600",
  3: "text-green-600",
};
const statusIcons = {
  1: <Clock className="w-5 h-5" />,
  2: <Activity className="w-5 h-5" />,
  3: <CheckCheck className="w-5 h-5" />,
};
const statusLabels = {
  1: "Pending",
  2: "In Process",
  3: "Completed",
};

export default function SmAgentDashboard() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    fetch(`/api/requests?assigned_smagent_id=${session.user.id}&limit=1000`)
      .then(res => res.json())
      .then(({ data }) => {
        if (!Array.isArray(data)) throw new Error("Invalid data");
        setRequests(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [session?.user?.id]);

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-lg">Loading assigned requests...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-96 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">Assigned Requests</h2>
      {requests.length === 0 ? (
        <div className="text-gray-500">No requests assigned to you yet.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => (
            <Card key={req.id} className="p-6 flex flex-col gap-2 bg-slate-50 border-2 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-semibold ${statusColors[req.status_id]}`}>{statusIcons[req.status_id]}</span>
                <span className={`font-semibold ${statusColors[req.status_id]}`}>{statusLabels[req.status_id] || "Unknown"}</span>
              </div>
              <div className="font-medium text-lg">{req.address || "No address"}</div>
              <div className="text-sm text-gray-600">Type: {req.complaint_type || "-"}</div>
              <div className="text-sm text-gray-600">Date: {req.request_date ? new Date(req.request_date).toLocaleDateString() : "-"}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}