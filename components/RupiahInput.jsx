'use client'

export default function RupiahInput({ 
  name, 
  value, 
  onChange, 
  placeholder = "0",
  required = false,
  className = ""
}) {
  
  const formatRupiah = (value) => {
    if (!value) return ''
    const number = value.toString().replace(/[^0-9]/g, '')
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleChange = (e) => {
    // Remove all non-numeric characters
    const numericValue = e.target.value.replace(/[^0-9]/g, '')
    
    // Call parent onChange with numeric value only
    onChange({
      target: {
        name,
        value: numericValue // This is already pure number string
      }
    })
  }

  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
        Rp
      </span>
      <input
        type="text"
        name={name}
        value={formatRupiah(value)}
        onChange={handleChange}
        className={`w-full text-gray-900 pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        placeholder={placeholder}
        required={required}
      />
    </div>
  )
}