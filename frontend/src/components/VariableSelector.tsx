import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function VariableSelector() {
  const fileMeta = useStore((s) => s.fileMeta)
  const selectedVariables = useStore((s) => s.selectedVariables)
  const toggleVariable = useStore((s) => s.toggleVariable)
  const [search, setSearch] = useState('')

  const filteredVariables = useMemo(() => {
    if (!fileMeta) return []
    const q = search.toLowerCase()
    return fileMeta.variables.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        (v.long_name && v.long_name.toLowerCase().includes(q))
    )
  }, [fileMeta, search])

  if (!fileMeta) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-400">
        请先选择一个文件
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-gray-200">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索变量..."
            className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredVariables.map((v) => {
          const isSelected = selectedVariables.includes(v.name)
          return (
            <button
              key={v.name}
              onClick={() => toggleVariable(v.name)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
                isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleVariable(v.name)}
                className="w-3.5 h-3.5 accent-blue-600 shrink-0"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-gray-800 truncate">{v.name}</div>
                <div className="text-xs text-gray-400 truncate">
                  {v.dimensions.length > 0 && (
                    <span>[{v.dimensions.join(', ')}]</span>
                  )}
                  {v.units && <span className="ml-1">({v.units})</span>}
                </div>
              </div>
            </button>
          )
        })}

        {filteredVariables.length === 0 && (
          <div className="flex items-center justify-center py-4 text-xs text-gray-400">
            无匹配变量
          </div>
        )}
      </div>
    </div>
  )
}
