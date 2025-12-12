'use client'

import Link from 'next/link'

export default function NewsPage() {
	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-3xl mx-auto px-4 py-16">
				<h1 className="text-3xl font-bold text-gray-900">Berita Terkini</h1>
				<p className="mt-3 text-gray-600">
					Halaman ini masih dalam pengembangan.
				</p>

				<div className="mt-8">
					<Link
						href="/"
						className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
					>
						Kembali ke Beranda
					</Link>
				</div>
			</div>
		</div>
	)
}
