export interface ImagePreset {
  id: string;
  category: string;
  title: string;
  url: string;
}

export const ARTWORK_GALLERY: Record<string, string[]> = {
  Technical: [
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
  ],
  Hackathon: [
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
  ],
  Workshop: [
    "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
  ],
  Cultural: [
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
  ],
  Sports: [
    "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80",
  ],
  Seminar: [
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1544531585-9847b68c8c86?auto=format&fit=crop&w=1200&q=80",
  ],
  Academic: [
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
  ],
  Social: [
    "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
  ],
  General: [
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
  ],
};

export const EVENT_IMAGE_PRESETS: ImagePreset[] = [
  {
    id: "tech-1",
    category: "Technical",
    title: "AI & Machine Learning",
    url: ARTWORK_GALLERY.Technical[0],
  },
  {
    id: "tech-2",
    category: "Technical",
    title: "Coding & Software",
    url: ARTWORK_GALLERY.Technical[1],
  },
  {
    id: "hackathon-1",
    category: "Hackathon",
    title: "Hackathon Night",
    url: ARTWORK_GALLERY.Hackathon[0],
  },
  {
    id: "workshop-1",
    category: "Workshop",
    title: "Tech Workshop",
    url: ARTWORK_GALLERY.Workshop[0],
  },
  {
    id: "cultural-1",
    category: "Cultural",
    title: "Music Fest & Concert",
    url: ARTWORK_GALLERY.Cultural[0],
  },
  {
    id: "sports-1",
    category: "Sports",
    title: "Cricket & Field Sports",
    url: ARTWORK_GALLERY.Sports[0],
  },
  {
    id: "seminar-1",
    category: "Seminar",
    title: "Conference & Keynote",
    url: ARTWORK_GALLERY.Seminar[0],
  },
];

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  technical: ARTWORK_GALLERY.Technical[0],
  tech: ARTWORK_GALLERY.Technical[0],
  hackathon: ARTWORK_GALLERY.Hackathon[0],
  workshop: ARTWORK_GALLERY.Workshop[0],
  seminar: ARTWORK_GALLERY.Seminar[0],
  cultural: ARTWORK_GALLERY.Cultural[0],
  sports: ARTWORK_GALLERY.Sports[0],
  academic: ARTWORK_GALLERY.Academic[0],
  social: ARTWORK_GALLERY.Social[0],
  general: ARTWORK_GALLERY.General[0],
};

export function getEventImage(category?: string, imageUrl?: string | null): string {
  if (imageUrl && imageUrl.trim().length > 0 && !imageUrl.startsWith("placeholder")) {
    return imageUrl;
  }
  const key = category?.toLowerCase().trim() || "general";
  return DEFAULT_CATEGORY_IMAGES[key] || DEFAULT_CATEGORY_IMAGES.general;
}

export function getEventImageUrl(imageUrl?: string | null, category: string = "general"): string {
  return getEventImage(category, imageUrl);
}
