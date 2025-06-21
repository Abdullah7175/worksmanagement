"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ArrowUpDown , MapPin  } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Router from "next/router"

export const columns = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "request_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("request_date"))
      return format(date, "PPP")
    },
  },
  {
    accessorKey: "town_name",
    header: "Town",
  },
  {
    accessorKey: "complaint_type",
    header: "Complaint Type",
  },
  {
  accessorKey: "location", // dummy, not used in display
  header: "Location",
  cell: ({ row }) => {
    const lat = row.original.latitude;
    const lng = row.original.longitude;

    if (lat && lng) {
      return (
        <a 
          href={`https://www.google.com/maps?q=${lat},${lng}`} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm">
            <MapPin className="h-4 w-4 mr-2" />
            View Map
          </Button>
        </a>
      );
    }

    return <span className="text-gray-400">No location</span>;
  }
},
  {
    accessorKey: "status_name",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status_name")
      
      const variantMap = {
        "Pending": "secondary",
        "Assigned": "info",
        "In Progress": "warning",
        "Completed": "success",
        "Cancelled": "destructive",
      }

      return (
        <Badge variant={variantMap[status] || "default"}>
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const router = useRouter();
      
      return (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.open(`/agent/images/add`, '_blank')}
          >
            Add image
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/agent/videos/add`)}
          >
            Add Video
          </Button>
        </div>
      )
    },
  }
]

export function getAgentRequestColumns({ onAddImage, onAddVideo }) {
  return [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "request_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("request_date"))
        return format(date, "PPP")
      },
    },
    {
      accessorKey: "town_name",
      header: "Town",
    },
    {
      accessorKey: "complaint_type",
      header: "Complaint Type",
    },
    {
    accessorKey: "location", // dummy, not used in display
    header: "Location",
    cell: ({ row }) => {
      const lat = row.original.latitude;
      const lng = row.original.longitude;

      if (lat && lng) {
        return (
          <a 
            href={`https://www.google.com/maps?q=${lat},${lng}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              View Map
            </Button>
          </a>
        );
      }

      return <span className="text-gray-400">No location</span>;
    }
  },
   
    {
      accessorKey: "status_name",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status_name")
        
        const variantMap = {
          "Pending": "secondary",
          "Assigned": "info",
          "In Progress": "warning",
          "Completed": "success",
          "Cancelled": "destructive",
        }

        return (
          <Badge variant={variantMap[status] || "default"}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddImage(row.original.id)}
          >
            Add Image
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddVideo(row.original.id)}
          >
            Add Video
          </Button>
        </div>
      ),
    },
  ]
}