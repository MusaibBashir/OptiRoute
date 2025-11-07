"use client"

import { Download, Trash2 } from "lucide-react"

interface Node {
  id: number
  name: string
  x: number
  y: number
  type: string
}

interface Edge {
  id: number
  from: number
  to: number
  distance: number
}

interface Solution {
  numStops: number
  coverage: Record<number, string[]>
  allCovered: boolean
  algorithm: string
}

interface ExportPanelProps {
  nodes: Node[]
  edges: Edge[]
  maxWalkDistance: number
  solution: Solution | null
  selectedNode: number | null
  onRemoveNode: (id: number) => void
  onRemoveEdge: (id: number) => void
  onUpdateEdgeDistance: (id: number, distance: number) => void
}

const ExportPanel = ({
  nodes,
  edges,
  maxWalkDistance,
  solution,
  selectedNode,
  onRemoveNode,
  onRemoveEdge,
  onUpdateEdgeDistance,
}: ExportPanelProps) => {
  const exportData = () => {
    const data = {
      nodes,
      edges,
      maxWalkDistance,
      solution,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bus-stop-or-solution.json"
    a.click()
  }

  return (
    <div className="space-y-4">
      {/* Export Button */}
      {solution && (
        <button
          onClick={exportData}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg"
        >
          <Download size={18} />
          Export Solution
        </button>
      )}

      {/* Nodes Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-1 h-1 bg-cyan-500 rounded-full"></span>
            Nodes ({nodes.length})
          </h3>
        </div>
        <div className="p-4 max-h-72 overflow-y-auto space-y-2">
          {nodes.map((node) => (
            <div key={node.id} className="bg-slate-50 p-3 rounded-lg text-sm border border-slate-200">
              <div className="flex justify-between items-start">
                <span className="font-semibold text-slate-900">{node.name}</span>
                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                  ({Math.round(node.x)}, {Math.round(node.y)})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edges Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
            Edges ({edges.length})
          </h3>
        </div>
        <div className="p-4 max-h-72 overflow-y-auto space-y-2">
          {edges.map((edge) => {
            const from = nodes.find((n) => n.id === edge.from)
            const to = nodes.find((n) => n.id === edge.to)
            return (
              <div key={edge.id} className="bg-slate-50 p-3 rounded-lg text-sm border border-slate-200">
                <div className="flex justify-between items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-slate-900">
                    {from?.name} ↔ {to?.name}
                  </span>
                  <button onClick={() => onRemoveEdge(edge.id)} className="text-red-500 hover:text-red-700 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  type="number"
                  value={edge.distance || 0}
                  onChange={(e) => onUpdateEdgeDistance(edge.id, Number.parseFloat(e.target.value))}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Node */}
      {selectedNode && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm p-5">
          <h3 className="font-semibold text-amber-900 mb-3">Selected Node</h3>
          <p className="text-sm font-semibold text-slate-900 mb-3">{nodes.find((n) => n.id === selectedNode)?.name}</p>
          <button
            onClick={() => {
              onRemoveNode(selectedNode)
            }}
            className="w-full bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Trash2 size={16} />
            Delete Node
          </button>
        </div>
      )}
    </div>
  )
}

export default ExportPanel
