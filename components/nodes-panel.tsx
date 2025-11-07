"use client"

import { Trash2 } from "lucide-react"

interface Node {
  id: number
  name: string
  x: number
  y: number
  type: string
  color?: string
}

interface Edge {
  id: number
  from: number
  to: number
  distance: number
}

interface NodesPanelProps {
  nodes: Node[]
  edges: Edge[]
  onRemoveNode: (id: number) => void
  onUpdateNodeName: (id: number, name: string) => void
  onUpdateNodeColor: (id: number, color: string) => void
  onRemoveEdge: (id: number) => void
  onUpdateEdgeDistance: (id: number, distance: number) => void
}

const NodesPanel = ({
  nodes,
  edges,
  onRemoveNode,
  onUpdateNodeName,
  onUpdateNodeColor,
  onRemoveEdge,
  onUpdateEdgeDistance,
}: NodesPanelProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
            Edges ({edges.length})
          </h3>
        </div>
        <div className={`p-4 space-y-2 ${edges.length > 0 ? "max-h-96 overflow-y-auto" : ""}`}>
          {edges.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No edges yet</p>
          ) : (
            edges.map((edge) => {
              const from = nodes.find((n) => n.id === edge.from)
              const to = nodes.find((n) => n.id === edge.to)
              return (
                <div key={edge.id} className="bg-slate-50 p-3 rounded-lg text-sm border border-slate-200">
                  <div className="flex justify-between items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-slate-900">
                      {from?.name} ↔ {to?.name}
                    </span>
                    <button
                      onClick={() => onRemoveEdge(edge.id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
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
            })
          )}
        </div>
      </div>

      {/* Nodes section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-1 h-1 bg-cyan-500 rounded-full"></span>
            Nodes ({nodes.length})
          </h3>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto space-y-3">
          {nodes.map((node) => (
            <div key={node.id} className="bg-slate-50 p-3 rounded-lg text-sm border border-slate-200">
              <div className="flex gap-2 items-start mb-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={node.name}
                    onChange={(e) => onUpdateNodeName(node.id, e.target.value)}
                    className="w-full font-semibold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <button
                  onClick={() => onRemoveNode(node.id)}
                  className="text-red-500 hover:text-red-700 transition p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={node.color || "#06b6d4"}
                  onChange={(e) => onUpdateNodeColor(node.id, e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-slate-300"
                />
                <span className="text-xs text-slate-500">
                  ({Math.round(node.x)}, {Math.round(node.y)})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NodesPanel
