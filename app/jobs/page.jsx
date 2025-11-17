'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Briefcase, DollarSign, Clock, Building2, Filter, X, ChevronDown, Star, Bookmark, BookmarkCheck, TrendingUp, Calendar, Users } from 'lucide-react'

const JobsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [savedJobs, setSavedJobs] = useState([])
  const [sortBy, setSortBy] = useState('latest')
  
  const [filters, setFilters] = useState({
    jobType: [],
    experience: [],
    salary: '',
    category: []
  })

  // Data dummy jobs (lebih lengkap)
  const allJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'Tech Innovate Indonesia',
      logo: '🚀',
      location: 'Jakarta',
      type: 'Full Time',
      salary: 'Rp 15.000.000 - 20.000.000',
      experience: '3-5 tahun',
      category: 'Teknologi',
      postedDate: '2024-11-12',
      applicants: 45,
      urgent: true,
      remote: true,
      description: 'Kami mencari Senior Frontend Developer yang berpengalaman untuk bergabung dengan tim engineering kami.',
      requirements: [
        'Min. 3 tahun pengalaman sebagai Frontend Developer',
        'Expert dalam React.js dan Next.js',
        'Menguasai TypeScript dan modern JavaScript',
        'Familiar dengan Tailwind CSS atau styled-components',
        'Pengalaman dengan state management (Redux, Zustand)',
        'Memahami konsep responsive design dan mobile-first'
      ],
      responsibilities: [
        'Mengembangkan dan maintain aplikasi web frontend',
        'Kolaborasi dengan tim designer dan backend',
        'Code review dan mentoring junior developer',
        'Optimasi performa aplikasi',
        'Implementasi best practices dan design patterns'
      ],
      benefits: [
        'Gaji kompetitif',
        'BPJS Kesehatan & Ketenagakerjaan',
        'Flexible working hours',
        'Remote working option',
        'Annual bonus',
        'Learning & development budget'
      ]
    },
    {
      id: 2,
      title: 'UI/UX Designer',
      company: 'Creative Studio Co',
      logo: '🎨',
      location: 'Bandung',
      type: 'Full Time',
      salary: 'Rp 10.000.000 - 15.000.000',
      experience: '2-4 tahun',
      category: 'Desain',
      postedDate: '2024-11-13',
      applicants: 67,
      urgent: false,
      remote: true,
      description: 'Join our creative team to design beautiful and intuitive user experiences.',
      requirements: [
        'Min. 2 tahun pengalaman UI/UX Design',
        'Expert dalam Figma dan Adobe XD',
        'Strong portfolio',
        'Memahami user research dan usability testing',
        'Familiar dengan design systems'
      ],
      responsibilities: [
        'Membuat wireframes dan prototypes',
        'Conduct user research',
        'Design user interfaces',
        'Collaborate dengan developers',
        'Maintain design system'
      ],
      benefits: [
        'Competitive salary',
        'Health insurance',
        'Creative workspace',
        'Latest design tools',
        'Team building activities'
      ]
    },
    {
      id: 3,
      title: 'Backend Engineer',
      company: 'DataCore Solutions',
      logo: '💻',
      location: 'Jakarta',
      type: 'Full Time',
      salary: 'Rp 12.000.000 - 18.000.000',
      experience: '3-5 tahun',
      category: 'Teknologi',
      postedDate: '2024-11-11',
      applicants: 52,
      urgent: true,
      remote: false,
      description: 'We are looking for talented Backend Engineers to build scalable systems.',
      requirements: [
        'Min. 3 tahun pengalaman Backend Development',
        'Expert dalam Node.js atau Python',
        'Strong database skills (PostgreSQL, MongoDB)',
        'Experience dengan microservices',
        'Familiar dengan cloud platforms (AWS/GCP)'
      ],
      responsibilities: [
        'Develop and maintain APIs',
        'Database design and optimization',
        'System architecture design',
        'Code review',
        'Performance monitoring'
      ],
      benefits: [
        'Competitive package',
        'Health & life insurance',
        'Professional development',
        'Modern tech stack',
        'Career growth'
      ]
    },
    {
      id: 4,
      title: 'Product Manager',
      company: 'Startup Growth',
      logo: '📊',
      location: 'Jakarta',
      type: 'Full Time',
      salary: 'Rp 18.000.000 - 25.000.000',
      experience: '4-6 tahun',
      category: 'Management',
      postedDate: '2024-11-10',
      applicants: 89,
      urgent: false,
      remote: false,
      description: 'Lead product development and strategy for our digital products.',
      requirements: [
        'Min. 4 tahun pengalaman Product Management',
        'Strong analytical skills',
        'Experience with agile methodologies',
        'Excellent communication skills',
        'Data-driven mindset'
      ],
      responsibilities: [
        'Define product roadmap',
        'Stakeholder management',
        'Market research',
        'Feature prioritization',
        'Team coordination'
      ],
      benefits: [
        'High salary package',
        'Stock options',
        'Health insurance',
        'Flexible schedule',
        'International exposure'
      ]
    },
    {
      id: 5,
      title: 'Mobile Developer',
      company: 'AppMakers Indonesia',
      logo: '📱',
      location: 'Surabaya',
      type: 'Full Time',
      salary: 'Rp 11.000.000 - 16.000.000',
      experience: '2-4 tahun',
      category: 'Teknologi',
      postedDate: '2024-11-14',
      applicants: 34,
      urgent: true,
      remote: true,
      description: 'Create amazing mobile experiences for iOS and Android platforms.',
      requirements: [
        'Min. 2 tahun pengalaman Mobile Development',
        'Expert dalam React Native atau Flutter',
        'Experience dengan native modules',
        'App store deployment experience',
        'Understanding of mobile UI/UX'
      ],
      responsibilities: [
        'Develop mobile applications',
        'API integration',
        'Performance optimization',
        'Bug fixing and testing',
        'App store management'
      ],
      benefits: [
        'Competitive salary',
        'Remote work',
        'Latest devices',
        'Training opportunities',
        'Team outings'
      ]
    },
    {
      id: 6,
      title: 'Digital Marketing Manager',
      company: 'Marketing Pro',
      logo: '📈',
      location: 'Jakarta',
      type: 'Full Time',
      salary: 'Rp 13.000.000 - 19.000.000',
      experience: '3-5 tahun',
      category: 'Marketing',
      postedDate: '2024-11-09',
      applicants: 71,
      urgent: false,
      remote: false,
      description: 'Lead digital marketing strategies and campaigns for our clients.',
      requirements: [
        'Min. 3 tahun pengalaman Digital Marketing',
        'Expert dalam SEO/SEM',
        'Social media marketing experience',
        'Data analytics skills',
        'Budget management experience'
      ],
      responsibilities: [
        'Develop marketing strategies',
        'Manage marketing campaigns',
        'Analyze campaign performance',
        'Team management',
        'Client communication'
      ],
      benefits: [
        'Attractive salary',
        'Performance bonus',
        'Health insurance',
        'Creative freedom',
        'Career advancement'
      ]
    },
    {
      id: 7,
      title: 'DevOps Engineer',
      company: 'Cloud Systems Inc',
      logo: '☁️',
      location: 'Yogyakarta',
      type: 'Full Time',
      salary: 'Rp 14.000.000 - 20.000.000',
      experience: '3-5 tahun',
      category: 'Teknologi',
      postedDate: '2024-11-08',
      applicants: 28,
      urgent: true,
      remote: true,
      description: 'Manage and optimize our cloud infrastructure and deployment pipelines.',
      requirements: [
        'Min. 3 tahun pengalaman DevOps',
        'Expert dalam AWS/GCP/Azure',
        'Strong Docker/Kubernetes skills',
        'CI/CD pipeline experience',
        'Infrastructure as Code (Terraform)'
      ],
      responsibilities: [
        'Infrastructure management',
        'Deployment automation',
        'Monitoring and logging',
        'Security implementation',
        'Performance optimization'
      ],
      benefits: [
        'High compensation',
        'Remote work option',
        'Certification support',
        'Latest tools',
        'Work-life balance'
      ]
    },
    {
      id: 8,
      title: 'Data Analyst',
      company: 'Analytics Hub',
      logo: '📊',
      location: 'Jakarta',
      type: 'Full Time',
      salary: 'Rp 10.000.000 - 14.000.000',
      experience: '2-3 tahun',
      category: 'Data',
      postedDate: '2024-11-13',
      applicants: 56,
      urgent: false,
      remote: false,
      description: 'Transform data into actionable insights for business decisions.',
      requirements: [
        'Min. 2 tahun pengalaman Data Analysis',
        'Expert dalam SQL',
        'Python/R for data analysis',
        'Data visualization tools (Tableau, PowerBI)',
        'Statistical analysis skills'
      ],
      responsibilities: [
        'Data analysis and reporting',
        'Create dashboards',
        'Statistical modeling',
        'Present insights to stakeholders',
        'Data quality assurance'
      ],
      benefits: [
        'Competitive salary',
        'Learning budget',
        'Health insurance',
        'Flexible hours',
        'Modern office'
      ]
    },
    {
      id: 9,
      title: 'Content Writer',
      company: 'Media Creative',
      logo: '✍️',
      location: 'Bali',
      type: 'Contract',
      salary: 'Rp 6.000.000 - 9.000.000',
      experience: '1-3 tahun',
      category: 'Marketing',
      postedDate: '2024-11-12',
      applicants: 43,
      urgent: false,
      remote: true,
      description: 'Create engaging content for various digital platforms.',
      requirements: [
        'Min. 1 tahun pengalaman Content Writing',
        'Excellent writing skills',
        'SEO knowledge',
        'Research skills',
        'Portfolio of published work'
      ],
      responsibilities: [
        'Write blog posts and articles',
        'Create social media content',
        'SEO optimization',
        'Content planning',
        'Proofreading and editing'
      ],
      benefits: [
        'Flexible schedule',
        'Remote work',
        'Creative freedom',
        'Performance bonus',
        'Collaborative team'
      ]
    },
    {
      id: 10,
      title: 'QA Engineer',
      company: 'Quality First',
      logo: '🔍',
      location: 'Bandung',
      type: 'Full Time',
      salary: 'Rp 9.000.000 - 13.000.000',
      experience: '2-4 tahun',
      category: 'Teknologi',
      postedDate: '2024-11-11',
      applicants: 31,
      urgent: true,
      remote: false,
      description: 'Ensure the quality of our software products through comprehensive testing.',
      requirements: [
        'Min. 2 tahun pengalaman QA',
        'Manual and automated testing',
        'Test automation tools (Selenium, Cypress)',
        'API testing experience',
        'Bug tracking systems'
      ],
      responsibilities: [
        'Create test plans',
        'Execute test cases',
        'Bug reporting',
        'Automation development',
        'Quality documentation'
      ],
      benefits: [
        'Good salary',
        'Health benefits',
        'Training programs',
        'Career growth',
        'Team activities'
      ]
    }
  ]

  const jobTypes = ['Full Time', 'Part Time', 'Contract', 'Freelance', 'Internship']
  const experienceLevels = ['0-1 tahun', '1-3 tahun', '3-5 tahun', '5+ tahun']
  const salaryRanges = [
    { label: 'Semua', value: '' },
    { label: '< Rp 5 Juta', value: '0-5' },
    { label: 'Rp 5 - 10 Juta', value: '5-10' },
    { label: 'Rp 10 - 15 Juta', value: '10-15' },
    { label: 'Rp 15 - 20 Juta', value: '15-20' },
    { label: '> Rp 20 Juta', value: '20+' }
  ]
  const categories = ['Teknologi', 'Desain', 'Marketing', 'Data', 'Management', 'Sales', 'HR']

  // Filter jobs
  const filteredJobs = allJobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesLocation = location === '' || 
      job.location.toLowerCase().includes(location.toLowerCase())
    
    const matchesType = filters.jobType.length === 0 || 
      filters.jobType.includes(job.type)
    
    const matchesExperience = filters.experience.length === 0 || 
      filters.experience.includes(job.experience)
    
    const matchesCategory = filters.category.length === 0 || 
      filters.category.includes(job.category)

    return matchesSearch && matchesLocation && matchesType && matchesExperience && matchesCategory
  })

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.postedDate) - new Date(a.postedDate)
    } else if (sortBy === 'salary') {
      const getSalary = (salaryStr) => {
        const match = salaryStr.match(/[\d.]+/)
        return match ? parseFloat(match[0].replace('.', '')) : 0
      }
      return getSalary(b.salary) - getSalary(a.salary)
    } else if (sortBy === 'popular') {
      return b.applicants - a.applicants
    }
    return 0
  })

  const handleFilterChange = (type, value) => {
    setFilters(prev => {
      const currentValues = prev[type]
      if (Array.isArray(currentValues)) {
        if (currentValues.includes(value)) {
          return { ...prev, [type]: currentValues.filter(v => v !== value) }
        } else {
          return { ...prev, [type]: [...currentValues, value] }
        }
      }
      return { ...prev, [type]: value }
    })
  }

  const clearFilters = () => {
    setFilters({
      jobType: [],
      experience: [],
      salary: '',
      category: []
    })
    setSearchQuery('')
    setLocation('')
  }

  const toggleSaveJob = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId))
    } else {
      setSavedJobs([...savedJobs, jobId])
    }
  }

  const getTimeSince = (date) => {
    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Hari ini'
    if (days === 1) return 'Kemarin'
    return `${days} hari yang lalu`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Temukan Pekerjaan Impian Anda</h1>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Posisi, skill, atau perusahaan..."
                    className="w-full pl-12 pr-4 py-3 text-gray-800 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Lokasi atau remote..."
                    className="w-full pl-12 pr-4 py-3 text-gray-800 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl">
                Cari
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-8 text-center">
            <div>
              <div className="text-2xl font-bold">{sortedJobs.length}</div>
              <div className="text-blue-200 text-sm">Lowongan Ditemukan</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{allJobs.length}</div>
              <div className="text-blue-200 text-sm">Total Lowongan</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{savedJobs.length}</div>
              <div className="text-blue-200 text-sm">Tersimpan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter
                </h3>
                {(filters.jobType.length > 0 || filters.experience.length > 0 || filters.category.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Job Type Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Tipe Pekerjaan</h4>
                <div className="space-y-2">
                  {jobTypes.map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.jobType.includes(type)}
                        onChange={() => handleFilterChange('jobType', type)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700 group-hover:text-blue-600 transition">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Pengalaman</h4>
                <div className="space-y-2">
                  {experienceLevels.map((level) => (
                    <label key={level} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.experience.includes(level)}
                        onChange={() => handleFilterChange('experience', level)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700 group-hover:text-blue-600 transition">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary Range Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Rentang Gaji</h4>
                <select
                  value={filters.salary}
                  onChange={(e) => handleFilterChange('salary', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {salaryRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Kategori</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.category.includes(cat)}
                        onChange={() => handleFilterChange('category', cat)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700 group-hover:text-blue-600 transition">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition"
          >
            <Filter className="w-6 h-6" />
          </button>

          {/* Jobs List */}
          <div className="flex-1">
            {/* Sort and View Options */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-600 font-medium">
                  {sortedJobs.length} lowongan ditemukan
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-sm">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="latest">Terbaru</option>
                  <option value="salary">Gaji Tertinggi</option>
                  <option value="popular">Terpopuler</option>
                </select>
              </div>
            </div>

            {/* Jobs Grid */}
            {sortedJobs.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak ada lowongan ditemukan</h3>
                <p className="text-gray-600 mb-6">Coba ubah filter atau kata kunci pencarian Anda</p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200"
                  >
                    <div className="flex items-start gap-4">
                      {/* Company Logo */}
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        {job.logo}
                      </div>

                      {/* Job Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition mb-1">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Building2 className="w-4 h-4" />
                              <span className="font-medium">{job.company}</span>
                            </div>
                          </div>

                          {/* Save Button */}
                          <button
                            onClick={() => toggleSaveJob(job.id)}
                            className={`p-2 rounded-lg transition ${
                              savedJobs.includes(job.id)
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {savedJobs.includes(job.id) ? (
                              <BookmarkCheck className="w-5 h-5" />
                            ) : (
                              <Bookmark className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        {/* Job Meta */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span>{job.type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{job.experience}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                            <DollarSign className="w-4 h-4" />
                            <span className="truncate">{job.salary.split(' - ')[0]}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {job.category}
                          </span>
                          {job.remote && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Remote
                            </span>
                          )}
                          {job.urgent && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium animate-pulse">
                              Urgent
                            </span>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{getTimeSince(job.postedDate)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{job.applicants} pelamar</span>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => setSelectedJob(job)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
                            >
                              Detail
                            </button>
                            <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium text-sm shadow-lg hover:shadow-xl">
                              Lamar Sekarang
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {sortedJobs.length > 0 && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    Previous
                  </button>
                  {[1, 2, 3, 4].map((page) => (
                    <button
                      key={page}
                      className={`px-4 py-2 rounded-lg transition ${
                        page === 1
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-3xl">
                    {selectedJob.logo}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedJob.title}</h2>
                    <p className="text-gray-600 font-medium">{selectedJob.company}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Lokasi</div>
                    <div className="font-semibold text-gray-900">{selectedJob.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Tipe</div>
                    <div className="font-semibold text-gray-900">{selectedJob.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Pengalaman</div>
                    <div className="font-semibold text-gray-900">{selectedJob.experience}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Gaji</div>
                    <div className="font-semibold text-green-600 text-sm">{selectedJob.salary}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-lg hover:shadow-xl">
                  Lamar Sekarang
                </button>
                <button
                  onClick={() => toggleSaveJob(selectedJob.id)}
                  className={`px-6 py-3 rounded-xl transition font-semibold ${
                    savedJobs.includes(selectedJob.id)
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {savedJobs.includes(selectedJob.id) ? 'Tersimpan' : 'Simpan'}
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Deskripsi Pekerjaan</h3>
                <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Persyaratan</h3>
                <ul className="space-y-3">
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Responsibilities */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tanggung Jawab</h3>
                <ul className="space-y-3">
                  {selectedJob.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Benefit & Fasilitas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedJob.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Tentang Perusahaan</h3>
                <p className="text-gray-700 mb-4">
                  {selectedJob.company} adalah perusahaan terkemuka di bidang {selectedJob.category} yang berkomitmen untuk memberikan solusi terbaik bagi klien kami.
                </p>
                <div className="flex gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>200-500 karyawan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Growing fast</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto" onClick={() => setShowFilters(false)}>
          <div className="bg-white min-h-screen p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Filter</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Same filter content as desktop */}
            <div className="space-y-6">
              {/* Job Type */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Tipe Pekerjaan</h4>
                <div className="space-y-2">
                  {jobTypes.map((type) => (
                    <label key={type} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={filters.jobType.includes(type)}
                        onChange={() => handleFilterChange('jobType', type)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Pengalaman</h4>
                <div className="space-y-2">
                  {experienceLevels.map((level) => (
                    <label key={level} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={filters.experience.includes(level)}
                        onChange={() => handleFilterChange('experience', level)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span>{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Kategori</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={filters.category.includes(cat)}
                        onChange={() => handleFilterChange('category', cat)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobsPage