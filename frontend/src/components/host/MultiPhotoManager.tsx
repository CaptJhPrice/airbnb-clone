"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Star, Image as ImageIcon, Sparkles } from "lucide-react";

interface MultiPhotoManagerProps {
  images: Array<{ url: string; alt_text?: string; is_primary?: boolean; order?: number }>;
  onChange: (images: Array<{ url: string; alt_text?: string; is_primary?: boolean; order?: number }>) => void;
}

const samplePhotoTemplates = [
  { name: "Living Room", url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop" },
  { name: "Bedroom", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop" },
  { name: "Modern Kitchen", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop" },
  { name: "Private Pool", url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&auto=format&fit=crop" },
  { name: "Balcony Sunset", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop" },
];

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

  const handleAddPreset = (url: string, name: string) => {
    const isFirst = images.length === 0;
    const updated = [
      ...images,
      {
        url,
        alt_text: name,
        is_primary: isFirst,
        order: images.length,
      },
    ];
    onChange(updated);
  };

  const handleRemovePhoto = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
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
        <label className="block text-xs font-bold uppercase text-slate-900">
          Listing Photos ({images.length})
        </label>
        <span className="text-xs text-slate-500">Add URLs or click quick presets</span>
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
          placeholder="Alt text (e.g. Living room)"
          value={newAlt}
          onChange={(e) => setNewAlt(e.target.value)}
          className="w-full sm:w-40 px-3 py-2 text-sm border rounded-lg focus:ring-rose-500 focus:border-rose-500 bg-white"
        />
        <button
          type="button"
          onClick={handleAddPhoto}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition flex items-center justify-center gap-1 shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>

      {/* Quick Add Presets */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-rose-500" /> Quick Add Sample Photos:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {samplePhotoTemplates.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleAddPreset(preset.url, preset.name)}
              className="px-2.5 py-1 text-xs bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg text-slate-700 font-medium transition flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-rose-600" /> {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
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
              
              {img.is_primary && (
                <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  Cover
                </span>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1.5">
                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="p-1 bg-white text-slate-800 rounded-full hover:bg-white transition text-xs font-semibold"
                    title="Make Cover Photo"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition"
                  title="Remove Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
          No photos added yet. Add photo URLs or use quick add presets above.
        </div>
      )}
    </div>
  );
}
