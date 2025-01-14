const MemoryOptions = () => {
  const options = [
    { size: '8GB', price: 0 },
    { size: '16GB', price: 200 },
    { size: '24GB', price: 400 },
  ]

  return (
    <div
      className="rounded-2xl border border-black/[.08] dark:border-white/[.145] 
      bg-white dark:bg-gray-900 shadow-lg p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Memory Options
      </h2>
      <div className="space-y-4">
        {options.map(({ size, price }) => (
          <div
            key={size}
            className="flex items-center justify-between p-4 rounded-xl 
              border border-gray-200 dark:border-gray-700 hover:border-gray-300 
              dark:hover:border-gray-600 transition-colors cursor-pointer"
          >
            <span className="text-gray-900 dark:text-gray-100">
              {size} Unified Memory
            </span>
            <span className="text-gray-600 dark:text-gray-400">+${price}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MemoryOptions
