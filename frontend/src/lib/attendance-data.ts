export type AttendanceStatus = "Healthy" | "Attention" | "Offline";

export type AttendanceCenter = {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  attendance: number;
  status: AttendanceStatus;
  mapX: number;
  mapY: number;
};

export type AttendanceMedia = {
  id: string;
  title: string;
  type: "photo" | "video";
  src: string;
  poster?: string;
  locationName: string;
  centerId: string;
  city: string;
  description: string;
};

export const attendanceCenters: AttendanceCenter[] = [
  { id: "bhubaneswar", name: "Eastern Learning Hub", city: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245, attendance: 92, status: "Healthy", mapX: 260, mapY: 150 },
  { id: "delhi", name: "Delhi Skills Center", city: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.209, attendance: 88, status: "Healthy", mapX: 440, mapY: 125 },
  { id: "mumbai", name: "Mumbai Placement Lab", city: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777, attendance: 84, status: "Attention", mapX: 300, mapY: 340 },
  { id: "bengaluru", name: "Bengaluru AI Studio", city: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, attendance: 95, status: "Healthy", mapX: 610, mapY: 245 },
  { id: "hyderabad", name: "Hyderabad Innovation Room", city: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867, attendance: 79, status: "Attention", mapX: 565, mapY: 325 },
  { id: "kolkata", name: "Kolkata Career Center", city: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, attendance: 73, status: "Offline", mapX: 700, mapY: 210 },
];

export const attendanceMedia: AttendanceMedia[] = [
  {
    id: "bhubaneswar-photo",
    title: "Inauguration Gallery",
    type: "photo",
    src: "/gallery-inauguration.png",
    locationName: "Bhubaneswar Training Hall",
    centerId: "bhubaneswar",
    city: "Bhubaneswar",
    description: "Official inauguration photo pinned to the Bhubaneswar location.",
  },
  {
    id: "delhi-office-photo",
    title: "Admin Office",
    type: "photo",
    src: "/gallery-office.jpg",
    locationName: "New Delhi Admin Office",
    centerId: "delhi",
    city: "New Delhi",
    description: "Administrative coverage photo for the Delhi center.",
  },
  {
    id: "mumbai-students-photo",
    title: "Student Session",
    type: "photo",
    src: "/gallery-students.jpg",
    locationName: "Mumbai Placement Lab",
    centerId: "mumbai",
    city: "Mumbai",
    description: "Student training activity captured for the Mumbai location.",
  },
  {
    id: "bengaluru-youth-photo",
    title: "Youth Session",
    type: "photo",
    src: "/gallery-youth.jpg",
    locationName: "Bengaluru AI Studio",
    centerId: "bengaluru",
    city: "Bengaluru",
    description: "Youth engagement photo linked to the Bengaluru center.",
  },
  {
    id: "hyderabad-smart-lab-video",
    title: "Smart Lab Video",
    type: "video",
    src: "/attendance-media/smart-lab-background.mp4",
    locationName: "Hyderabad Innovation Room",
    centerId: "hyderabad",
    city: "Hyderabad",
    description: "Training lab video stored with the Hyderabad location name.",
  },
  {
    id: "kolkata-location-video",
    title: "Location Tracking Video",
    type: "video",
    src: "/attendance-media/location-demo.mp4",
    locationName: "Kolkata Career Center",
    centerId: "kolkata",
    city: "Kolkata",
    description: "Device location demo video attached to the Kolkata center.",
  },
  {
    id: "labour-photo",
    title: "Community Outreach",
    type: "photo",
    src: "/gallery-labour.jpg",
    locationName: "Hyderabad Outreach Site",
    centerId: "hyderabad",
    city: "Hyderabad",
    description: "Community capture associated with the Hyderabad region.",
  },
  {
    id: "activity-photo",
    title: "Activity Coverage",
    type: "photo",
    src: "/gallery-activity.png",
    locationName: "Bengaluru AI Studio",
    centerId: "bengaluru",
    city: "Bengaluru",
    description: "Program activity photo linked to the Bengaluru training hub.",
  },
  {
    id: "about-video",
    title: "About Us Video",
    type: "video",
    src: "/attendance-media/about-us-background.mp4",
    locationName: "Bhubaneswar Training Hall",
    centerId: "bhubaneswar",
    city: "Bhubaneswar",
    description: "Background video pinned to Bhubaneswar for the Nirmaan story.",
  },
];

export function getStatusColor(status: AttendanceStatus) {
  if (status === "Healthy") return "#16a34a";
  if (status === "Attention") return "#f59e0b";
  return "#dc2626";
}

export function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export function findNearestCenter(lat: number, lng: number) {
  return attendanceCenters.reduce(
    (closest, center) => {
      const distanceKm = calculateDistanceKm(lat, lng, center.lat, center.lng);
      if (!closest || distanceKm < closest.distanceKm) {
        return { center, distanceKm };
      }
      return closest;
    },
    null as null | { center: AttendanceCenter; distanceKm: number }
  );
}