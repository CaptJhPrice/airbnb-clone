"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Star, Image as ImageIcon } from "lucide-react";
import type { ListingImage } from "@/lib/types";

interface MultiPhotoManagerProps {
  images: Array<{ url: string; alt_text?: string; is_primary?: boolean; order?: number }>;
  onChange: (images: Array<{ url: string; alt_text?: string; is_primary?: boolean; order?: number }>) => void;
}

export function MultiPhotoManager({ images, onChange }: MultiPhotoManagerProps) {
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");

  const handleAddPhoto = () => {
    if (!newUrl.trim()) return;
    const isFirst = images.length === 0;
    const updated = [
      ...images,
      {
        url: newUrl.trim(),
        alt_text: newAlt.trim() || undefined,
        is_primary: isFirst,
        order: images.length,
      },
    ];
    onChange(updated);
    setNewUrl("");
    setNewAlt("");
  };

  const handleRemovePhoto = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    // If we deleted the primary image, make the first one primary if available
    if (images[index]?.is_primary && updated.length > 0) {
      updated[0] = { ...updated[0], is_primary: true };
    }
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-900">
          Listing Photo Gallery ({images.length})
        </label>
        <span className="text-xs text-slate-500">Provide image URLs (e.g. Unsplash, Pexels)</span>
      </div>

      {/* Add New Photo Form */}
      <div className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="url"
            placeholder="Image URL (https://...)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-rose-500 focus:border-rose-500 bg-white"
          />
        </div>
        <input
          type="text"
          placeholder="Alt text (optional)"
          value={newAlt}
          onChange={(e) => setNewAlt(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 text-sm border rounded-lg focus:ring-rose-500 focus:border-rose-500 bg-white"
        />
        <button
          type="button"
          onClick={handleAddPhoto}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition flex items-center justify-center gap-1 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>

      {/* Photo Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div
              key={index}
              className={`group relative aspect-video rounded-xl overflow-hidden border-2 bg-slate-100 ${
                img.is_primary ? "border-rose-500 ring-2 ring-rose-300" : "border-slate-200"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt_text || `Photo ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              
              {/* Badge for Primary */}
              {img.is_primary && (
                <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  Cover Photo
                </span>
              )}

              {/* Hover Overlay Controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="p-1.5 bg-white/90 text-slate-800 rounded-full hover:bg-white transition text-xs flex items-center gap-1 font-medium"
                    title="Make Cover Photo"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="p-1.5 bg-rose-600/90 text-white rounded-full hover:bg-rose-600 transition"
                  title="Remove Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
          No photos added yet. Add image URLs above to create your photo gallery.
        </div>
      )}
    </div>
  );
}
