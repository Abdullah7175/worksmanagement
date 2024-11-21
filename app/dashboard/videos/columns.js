"use client"

import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import Link from "next/link"

export const columns = [
  {
    accessorKey: "id",
    header: "Case ID",
  },
  {
    accessorKey: "subject",
    header: "Subject",
  },
  {
    accessorKey: "video_link",
    header: "Video/Link",
    cell: ({ getValue }) => {
      const status_val = getValue();
      if(status_val == 1){
        return (
          <Badge variant="secondary">In Progress</Badge>
        )
      }
      return (
        <Badge variant="primary">Completed</Badge>
      )
    },
  
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const video = row.original

      return (
        <div className="text-right"> {/* Apply the style here */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Link href={`/dashboard/videos/edit/${video.video_id}`}>Edit Video</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
            <Link className="text-red-700" href={`/dashboard/videos/delete/${video.video_id}`}>Delete Video</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      )
    },
  },
]
