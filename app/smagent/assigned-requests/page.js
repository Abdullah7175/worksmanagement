"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Activity, CheckCheck, Clock, Image as ImageIcon, Video } from "lucide-react";
import Link from "next/link";

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

export default function AssignedRequestsPage() {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Assigned Requests</h1>
        <p className="text-gray-600">
          All requests assigned to you for media upload
        </p>
      </div>

      {requests.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No requests assigned</h3>
            <p>You don't have any requests assigned to you yet.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => (
            <Card key={req.id} className="p-6 flex flex-col gap-3 bg-white border-2 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${statusColors[req.status_id]}`}>
                    {statusIcons[req.status_id]}
                  </span>
                  <span className={`font-semibold ${statusColors[req.status_id]}`}>
                    {statusLabels[req.status_id] || "Unknown"}
                  </span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  #{req.id}
                </span>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-1">{req.address || "No address"}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Type:</span> {req.complaint_type || "-"}
                </p>
                {req.complaint_subtype && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Subtype:</span> {req.complaint_subtype}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span> {req.request_date ? new Date(req.request_date).toLocaleDateString() : "-"}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <Link href={`/smagent/images/add?requestId=${req.id}`} className="flex-1">
                    <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Add Image
                    </button>
                  </Link>
                  <Link href={`/smagent/videos/add?requestId=${req.id}`} className="flex-1">
                    <button className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                      <Video className="w-4 h-4" />
                      Add Video
                    </button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 