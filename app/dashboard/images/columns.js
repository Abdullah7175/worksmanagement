"use client"

import { MoreHorizontal, MapPin, Image as ImageIcon } from "lucide-react"
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
import Image from "next/image"

export const columns = [
  {
    accessorKey: "work_request_id",
    header: "Work Request ID",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "geo_tag",
    header: "Location",
    cell: ({ getValue }) => {
      const geoTag = getValue();
      return geoTag ? (
        <Button variant="outline" size="sm">
          <MapPin className="h-4 w-4 mr-2" />
          View Map
        </Button>
      ) : (
        <span className="text-gray-400">No location</span>
      );
    },
  },
  {
    accessorKey: "link",
    header: "Image",
    cell: ({ row }) => {
      const image = row.original;
      return (
        <div className="relative w-16 h-16">
          <Image
            src={image.link}
            alt={image.description || 'Work request image'}
            fill
            className="object-cover rounded-md"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Uploaded On",
    cell: ({ getValue }) => {
      const date = new Date(getValue());
      return date.toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const image = row.original;

      return (
        <div className="text-right">
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
                <Link href={`/dashboard/images/edit/${image.id}`}>Edit Image</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link className="text-red-700" href={`/dashboard/images/delete/${image.id}`}>
                  Delete Image
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]