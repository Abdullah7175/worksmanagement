"use client";

import { useEffect, useRef, useState, useMemo  } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  GiPositionMarker 
} from 'react-icons/gi';
import { renderToStaticMarkup } from 'react-dom/server';

const MapComponent = () => {
  const mapRef = useRef(null);
  const markersRef = useRef(L.layerGroup());
  const [selectedStatus, setSelectedStatus] = useState("All");
  const demoProjects = useMemo(() => [
  // const demoProjects = [
    
    {
      id: 1,
      name: "Water Line Fix - Korangi",
      latitude: 24.851,
      longitude: 67.060,
      status: "In Progress",
      contractor: "AquaFix Ltd.",
      startDate: "2025-04-01",
      endDate: "2025-05-10",
      issueType: "Water Leakage",
    },
    {
      id: 2,
      name: "Sewerage Blockage - Saddar",
      latitude: 24.860,
      longitude: 67.020,
      status: "Completed",
      contractor: "DrainTech Pvt.",
      startDate: "2025-03-15",
      endDate: "2025-04-10",
      issueType: "Sewerage Overflow",
    },
    {
      id: 3,
      name: "New Water Connection - Gulshan",
      latitude: 24.915,
      longitude: 67.090,
      status: "Pending",
      contractor: "City Infra",
      startDate: "2025-05-15",
      endDate: "2025-06-01",
      issueType: "New Connection",
    },
    {
      id: 4,
      name: "Manhole Repair - Lyari",
      latitude: 24.850,
      longitude: 66.990,
      status: "Not Started",
      contractor: "Urban Works",
      startDate: "2025-06-01",
      endDate: "2025-06-20",
      issueType: "Manhole Repair",
    },
    {
      id: 5,
      name: "Drainage System Upgrade - North Nazimabad",
      latitude: 24.930,
      longitude: 67.035,
      status: "In Progress",
      contractor: "DrainWorks Co.",
      startDate: "2025-04-20",
      endDate: "2025-05-30",
      issueType: "Drainage Upgrade",
    },
    {
      id: 6,
      name: "Pipeline Replacement - Malir",
      latitude: 24.850,
      longitude: 67.210,
      status: "Completed",
      contractor: "MegaPipe Solutions",
      startDate: "2025-02-01",
      endDate: "2025-03-10",
      issueType: "Pipeline Replacement",
    },
    {
      id: 7,
      name: "Sewer Cleaning - Garden East",
      latitude: 24.865,
      longitude: 67.025,
      status: "Pending",
      contractor: "CleanFlow Pvt.",
      startDate: "2025-05-20",
      endDate: "2025-06-05",
      issueType: "Sewer Cleaning",
    },
    {
      id: 8,
      name: "Stormwater Drain Maintenance - Clifton",
      latitude: 24.807,
      longitude: 67.030,
      status: "Not Started",
      contractor: "EcoDrains",
      startDate: "2025-06-10",
      endDate: "2025-06-30",
      issueType: "Drain Maintenance",
    },
    {
      id: 9,
      name: "Underground Sewer Repair - Nazimabad",
      latitude: 24.920,
      longitude: 67.050,
      status: "In Progress",
      contractor: "SubTerra Services",
      startDate: "2025-04-25",
      endDate: "2025-05-25",
      issueType: "Underground Sewer Repair",
    },
    {
      id: 10,
      name: "Water Tank Cleaning - PECHS",
      latitude: 24.873,
      longitude: 67.063,
      status: "Completed",
      contractor: "FreshTank Co.",
      startDate: "2025-03-10",
      endDate: "2025-03-15",
      issueType: "Tank Cleaning",
    },
    {
      id: 11,
      name: "Emergency Leak Fix - DHA Phase 6",
      latitude: 24.8075,
      longitude: 67.086,
      status: "Pending",
      contractor: "QuickFix Plumbers",
      startDate: "2025-05-05",
      endDate: "2025-05-07",
      issueType: "Emergency Repair",
    },
    {
      id: 12,
      name: "Manhole Lid Replacement - Orangi Town",
      latitude: 24.938,
      longitude: 66.990,
      status: "Not Started",
      contractor: "SecureCity Ltd.",
      startDate: "2025-06-01",
      endDate: "2025-06-03",
      issueType: "Safety Replacement",
    },
  // ];
  ], []);

  const getIconByStatus = (status) => {
    let icon;

    switch (status) {
      case "Completed":
        icon = <GiPositionMarker  color="green" size={32} />;
        break;
      case "In Progress":
        icon = <GiPositionMarker  color="Yellow" size={32} />;
        break;
      case "Pending":
        icon = <GiPositionMarker  color="Red" size={32} />;
        break;
      case "Not Started":
        icon = <GiPositionMarker  color="Black" size={32} />;
        break;
      default:
        icon = <GiPositionMarker  color="gray" size={32} />;
    }

    return L.divIcon({
      html: renderToStaticMarkup(icon),
      className: 'custom-icon',
      iconSize: [32, 32],
    });
  };

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('karachiMap').setView([24.866, 67.0255], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      markersRef.current.addTo(mapRef.current);
    }

    markersRef.current.clearLayers();

    // const visibleStatuses =
    //   selectedStatus === "In Progress & Pending"
    //     ? ["In Progress", "Pending", "Not Started"]
    //     : ["Completed"];

    const visibleStatuses =
  selectedStatus === "All" ? ["In Progress", "Pending", "Completed", "Not Started"] : [selectedStatus];


    demoProjects
    .filter((project) => visibleStatuses.includes(project.status))
    .forEach((project) => {
      const { latitude, longitude, name, status, contractor, startDate, endDate, issueType } = project;

      if (!isNaN(latitude) && !isNaN(longitude)) {
        const marker = L.marker([latitude, longitude], {
          icon: getIconByStatus(status),
        });

        const popupContent = `
          <div style="font-family: sans-serif; line-height: 1.5; max-width: 300px;">
            <h3 style="margin-bottom: 10px; color: #2c3e50;">${name}</h3>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Issue Type:</strong> ${issueType}</p>
            <p><strong>Contractor:</strong> ${contractor}</p>
            <p><strong>Start Date:</strong> ${startDate}</p>
            <p><strong>End Date:</strong> ${endDate}</p>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current.addLayer(marker);
      }
    });
  }, [selectedStatus,demoProjects]);

  return (
    // <div className="relative h-[500px]">
    //   <div
    //     id="karachiMap"
    //     className="h-full w-full rounded shadow"
    //   ></div>
    // </div>
    <div className="relative">
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Status:
      </label>
      {/* <select
        className="border rounded px-3 py-2 shadow"
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
      >
        <option value="In Progress & Pending">In Progress & Pending</option>
        <option value="Completed">Completed</option>
      </select> */}
      <select
        className="border rounded px-3 py-2 shadow"
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
      >
        <option value="All">All</option>
        <option value="In Progress">In Progress</option>
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
        <option value="Not Started">Not Started</option>
      </select>
    </div>

    <div id="karachiMap" className="h-[500px] w-full rounded shadow" />
  </div>
  );
};

export default MapComponent;
