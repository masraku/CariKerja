"use client";
import { useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

export default function CompanyGallery({
  gallery = [],
  companyId,
  onGalleryUpdate,
  disabled = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const handleUpload = async (e) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "company-gallery");
      formData.append("companyId", companyId);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        if (onGalleryUpdate) {
          onGalleryUpdate([...gallery, data.url]);
        }
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload photo");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDelete = async (photoUrl) => {
    if (disabled) return;
    if (!confirm("Remove this photo from gallery?")) return;

    setDeleting(photoUrl);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photoUrl, companyId }),
      });

      const data = await response.json();

      if (data.success) {
        if (onGalleryUpdate) {
          onGalleryUpdate(gallery.filter((url) => url !== photoUrl));
        }
      } else {
        throw new Error(data.error || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "Failed to delete photo");
    } finally {
      setDeleting(null);
    }
  };

  const canAddMore = gallery.length < 10;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Company Gallery
          </h3>
          <p className="text-sm text-gray-600">
            Upload documentations, office photos, team pictures, etc. (Max 10)
          </p>
        </div>
        <span className="text-sm text-gray-500">{gallery.length}/10</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Existing Photos */}
        {gallery.map((photoUrl) => (
          <div key={photoUrl} className="relative group aspect-square">
            <img
              src={photoUrl}
              alt="Gallery"
              className="w-full h-full object-cover rounded-lg border border-gray-200"
            />

            {/* Delete Button */}
            <button
              onClick={() => handleDelete(photoUrl)}
              disabled={deleting === photoUrl || disabled}
              className={`absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center shadow-lg disabled:opacity-50 ${
                disabled ? "hidden" : ""
              }`}
              type="button"
            >
              {deleting === photoUrl ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>

            {/* Deleting Overlay */}
            {deleting === photoUrl && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
        ))}

        {/* Upload Button */}
        {canAddMore && !disabled && (
          <label className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="text-sm text-gray-600">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition" />
                  <span className="text-sm text-gray-600 group-hover:text-blue-600 transition">
                    Add Photo
                  </span>
                </>
              )}
            </div>
          </label>
        )}
      </div>

      {gallery.length === 0 && !uploading && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            No photos yet. Start building your gallery!
          </p>
        </div>
      )}
    </div>
  );
}
