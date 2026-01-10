"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Newspaper,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  TrendingUp,
  Filter,
  FileText,
  Globe,
  Archive,
  Upload,
  Image as ImageIcon,
  X,
  LayoutGrid,
  List,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import Swal from "sweetalert2";

export default function AdminNewsPage() {
  const [news, setNews] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [viewMode, setViewMode] = useState("list"); // list or grid
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    image: "",
    category: "",
    author: "",
    status: "DRAFT",
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const predefinedCategories = [
    "Teknologi",
    "Karir",
    "Tips",
    "Lifestyle",
    "Gaji",
    "Portfolio",
    "Interview",
    "Industri",
    "Umum",
  ];

  useEffect(() => {
    fetchNews();
  }, [search, statusFilter, categoryFilter, sortOrder]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      params.append("sort", sortOrder);

      const response = await fetch(`/api/admin/news?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setNews(data.news || []);
        setStats(data.stats || null);
        setCategories(data.categories || []);
      } else {
        setNews([]);
        setStats(null);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setNews([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      PUBLISHED: "bg-green-100 text-green-700",
      DRAFT: "bg-yellow-100 text-yellow-700",
      ARCHIVED: "bg-gray-100 text-gray-700",
    };
    const labels = {
      PUBLISHED: "Dipublikasi",
      DRAFT: "Draft",
      ARCHIVED: "Diarsipkan",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const handleOpenDrawer = (newsItem = null) => {
    if (newsItem) {
      setEditingNews(newsItem);
      setFormData({
        title: newsItem.title,
        excerpt: newsItem.excerpt || "",
        content: newsItem.content,
        image: newsItem.image || "",
        category: newsItem.category,
        author: newsItem.author,
        status: newsItem.status,
      });
    } else {
      setEditingNews(null);
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        image: "",
        category: "",
        author: "",
        status: "DRAFT",
      });
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingNews(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      image: "",
      category: "",
      author: "",
      status: "DRAFT",
    });
  };


  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Format gambar tidak valid. Gunakan JPG, PNG, GIF, atau WebP",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ukuran gambar maksimal 5MB",
      });
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("type", "admin-doc");
      uploadFormData.append("bucket", "news-images");
      uploadFormData.append("folder", "news");

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.url) {
        setFormData({ ...formData, image: data.url });
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Gambar berhasil diupload",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error(data.error || "Upload gagal");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengupload gambar",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.category || !formData.author) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Judul, konten, kategori, dan penulis wajib diisi",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = editingNews
        ? `/api/admin/news/${editingNews.id}`
        : "/api/admin/news";
      const method = editingNews ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: editingNews ? "Berita berhasil diperbarui" : "Berita berhasil dibuat",
          timer: 1500,
          showConfirmButton: false,
        });
        handleCloseDrawer();
        fetchNews();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Terjadi kesalahan",
        });
      }
    } catch (error) {
      console.error("Error saving news:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Terjadi kesalahan saat menyimpan berita",
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Berita?",
      text: "Berita yang dihapus tidak dapat dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/admin/news/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Berita berhasil dihapus",
          });
          fetchNews();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.error || "Gagal menghapus berita",
          });
        }
      } catch (error) {
        console.error("Error deleting news:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Terjadi kesalahan saat menghapus berita",
        });
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/news/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: `Status berita berhasil diubah`,
        });
        fetchNews();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Gagal mengubah status",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Berita</h1>
          <p className="text-gray-500 mt-1">
            Kelola berita dan artikel untuk ditampilkan di website
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-lg p-1 border border-gray-200 flex">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-gray-100 text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-gray-100 text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => handleOpenDrawer()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#03587f] text-white rounded-lg hover:bg-[#024666] transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah Berita</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Newspaper className="w-6 h-6" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm font-medium text-gray-500 mt-1">Total Berita</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Globe className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">{stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}%</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.published}</p>
              <p className="text-sm font-medium text-gray-500 mt-1">Dipublikasi</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.draft}</p>
              <p className="text-sm font-medium text-gray-500 mt-1">Draft</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                <Archive className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.archived}</p>
              <p className="text-sm font-medium text-gray-500 mt-1">Diarsipkan</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari judul, penulis, atau konten..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#03587f] focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-[#03587f] outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="published">Dipublikasi</option>
              <option value="draft">Draft</option>
              <option value="archived">Diarsipkan</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-[#03587f] outline-none cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {[...new Set([...predefinedCategories, ...categories])].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-[#03587f] outline-none cursor-pointer"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="most_viewed">Populer</option>
              <option value="title_asc">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#03587f] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-medium">Memuat data berita...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <Newspaper className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Belum ada berita</h3>
            <p className="text-gray-500 mt-1 max-w-sm text-center">
              Belum ada berita yang ditemukan. Mulai dengan membuat berita baru.
            </p>
            <button
              onClick={() => handleOpenDrawer()}
              className="mt-6 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Buat Berita Baru
            </button>
          </div>
        ) : viewMode === "list" ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Berita
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Info
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Metrik
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {news.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4 max-w-md">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt=""
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-[#03587f] transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {item.excerpt || "Tidak ada ringkasan"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Tag className="w-3.5 h-3.5" />
                            <span>{item.category}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-3.5 h-3.5" />
                            <span>{item.author}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {getStatusBadge(item.status)}
                          {item.status === "PUBLISHED" && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              Live
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                          <Eye className="w-4 h-4" />
                          <span className="font-medium">{item.viewCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.status === "DRAFT" && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, "PUBLISHED")}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors tooltip"
                              title="Publikasikan"
                            >
                              <Globe className="w-4 h-4" />
                            </button>
                          )}
                          {item.status === "PUBLISHED" && (
                            <Link
                              href={`/news/${item.slug}`}
                              target="_blank"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Lihat Website"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}
                          <button
                            onClick={() => handleOpenDrawer(item)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
              >
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-lg">
                      {item.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 h-12 group-hover:text-[#03587f] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">
                    {item.excerpt || item.content.substring(0, 100) + "..."}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenDrawer(item)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer Form (Replaces Modal) */}
      {/* Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={handleCloseDrawer}
        />
      )}
      
      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] lg:w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {editingNews ? "Edit Berita" : "Buat Berita Baru"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Isi informasi berita di bawah ini
              </p>
            </div>
            <button
              onClick={handleCloseDrawer}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <form id="newsForm" onSubmit={handleSubmit} className="space-y-6">
              {/* Media Section */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-900">
                  Media & Cover
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-[#03587f]/50 transition-colors bg-gray-50/50">
                  {formData.image ? (
                    <div className="relative group">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                         <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 bg-white/90 text-gray-900 rounded-full hover:bg-white"
                         >
                            <Edit2 className="w-4 h-4" />
                         </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: "" })}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-50 text-[#03587f] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Upload gambar cover
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Format JPG, PNG, WEBP (Max 5MB)
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="text-sm px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 shadow-sm"
                      >
                        {uploading ? "Mengupload..." : "Pilih File"}
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {!formData.image && (
                     <div className="mt-4 pt-4 border-t border-gray-200">
                        <input
                           type="url"
                           value={formData.image}
                           onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                           placeholder="Atau tempel URL gambar disini"
                           className="w-full text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03587f]/20 focus:border-[#03587f]"
                        />
                     </div>
                  )}
                </div>
              </div>

              {/* Main Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#03587f]/20 focus:border-[#03587f] outline-none transition-all placeholder:text-gray-400 font-medium"
                    placeholder="Contoh: Lowongan Kerja BUMN 2024 Dibuka"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Kategori
                     </label>
                     <select
                       value={formData.category}
                       onChange={(e) =>
                         setFormData({ ...formData, category: e.target.value })
                       }
                       className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#03587f]/20 focus:border-[#03587f] outline-none bg-white cursor-pointer"
                       required
                     >
                       <option value="">Pilih Kategori</option>
                       {predefinedCategories.map((cat) => (
                         <option key={cat} value={cat}>
                           {cat}
                         </option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Penulis
                     </label>
                     <input
                       type="text"
                       value={formData.author}
                       onChange={(e) =>
                         setFormData({ ...formData, author: e.target.value })
                       }
                       className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#03587f]/20 focus:border-[#03587f] outline-none"
                       placeholder="Nama penulis"
                       required
                     />
                   </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                       Ringkasan (Excerpt)
                    </label>
                    <textarea
                       value={formData.excerpt}
                       onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                       rows={2}
                       className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#03587f]/20 focus:border-[#03587f] outline-none resize-none"
                       placeholder="Ringkasan singkat untuk ditampilkan di kartu berita..."
                    />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                       <span>Konten Utama</span>
                       <span className="text-xs text-gray-400 font-normal">Markdown Supported</span>
                    </label>
                    <textarea
                       value={formData.content}
                       onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                       rows={15}
                       className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#03587f]/20 focus:border-[#03587f] outline-none font-mono text-sm leading-relaxed"
                       placeholder="Tulis konten berita lengkap disini..."
                       required
                    />
                 </div>
              </div>

              {/* Settings Section */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                 <label className="block text-sm font-medium text-gray-900 mb-2">
                    Pengaturan Publikasi
                 </label>
                 <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#03587f]/20 focus:border-[#03587f] outline-none cursor-pointer"
                 >
                    <option value="DRAFT">Simpan sebagai Draft</option>
                    <option value="PUBLISHED">Langsung Publikasikan</option>
                    <option value="ARCHIVED">Arsipkan Berita</option>
                 </select>
                 <p className="text-xs text-gray-500 mt-2">
                    {formData.status === 'PUBLISHED' 
                       ? 'Berita akan langsung muncul di halaman publik.' 
                       : formData.status === 'DRAFT' 
                          ? 'Berita tidak akan muncul di publik sampai dipublikasikan.'
                          : 'Berita disembunyikan dari publik.'}
                 </p>
              </div>
            </form>
          </div>

          {/* Drawer Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-3 justify-end">
            <button
              onClick={handleCloseDrawer}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
            >
              Batal
            </button>
            <button
              onClick={() => document.getElementById('newsForm').requestSubmit()}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#03587f] rounded-lg hover:bg-[#024666] transition-colors shadow-sm flex items-center gap-2"
            >
              {editingNews ? "Simpan Perubahan" : "Terbitkan Berita"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
