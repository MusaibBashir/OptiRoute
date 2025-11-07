"use client"

import type React from "react"

import { useRef } from "react"
import { Move, Link2, PlusCircle } from "lucide-react"

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

interface GraphCanvasProps {
  nodes: Node[]
  edges: Edge[]
  mode: string
  setMode: (mode: string) => void
  newNodeName: string
  setNewNodeName: (name: string) => void
  selectedNode: number | null
  setSelectedNode: (id: number | null) => void
  edgeStart: number | null
  setEdgeStart: (id: number | null) => void
  optimalStops: number[]
  maxWalkDistance: number
  onAddNode: (x: number, y: number) => void
  onAddEdge: (fromId: number, toId: number) => void
  onNodeClick: (nodeId: number) => void
  onUpdateNodePosition: (nodeId: number, x: number, y: number) => void
}

const GraphCanvas = ({
  nodes,
  edges,
  mode,
  setMode,
  newNodeName,
  setNewNodeName,
  selectedNode,
  setSelectedNode,
  edgeStart,
  setEdgeStart,
  optimalStops,
  maxWalkDistance,
  onAddNode,
  onAddEdge,
  onNodeClick,
  onUpdateNodePosition,
}: GraphCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef<number | null>(null)

  const handleSvgClick = (e: React.MouseEvent) => {
    if (mode === "add-node") {
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return

      const svgElement = svgRef.current
      if (!svgElement) return

      const viewBox = svgElement.viewBox.baseVal
      const svgWidth = viewBox.width
      const svgHeight = viewBox.height

      const x = ((e.clientX - rect.left) / rect.width) * svgWidth
      const y = ((e.clientY - rect.top) / rect.height) * svgHeight

      if (x >= 10 && x <= svgWidth - 10 && y >= 10 && y <= svgHeight - 10) {
        onAddNode(Math.round(x), Math.round(y))
      }
    }
  }

  const handleNodeClick = (nodeId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (mode === "select") {
      setSelectedNode(selectedNode === nodeId ? null : nodeId)
    } else if (mode === "add-edge") {
      if (edgeStart === null) {
        setEdgeStart(nodeId)
      } else {
        onAddEdge(edgeStart, nodeId)
        setEdgeStart(null)
      }
    } else if (mode === "move") {
      dragging.current = nodeId
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging.current && mode === "move") {
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return

      const svgElement = svgRef.current
      if (!svgElement) return

      const viewBox = svgElement.viewBox.baseVal
      const svgWidth = viewBox.width
      const svgHeight = viewBox.baseVal.height

      let x = ((e.clientX - rect.left) / rect.width) * svgWidth
      let y = ((e.clientY - rect.top) / rect.height) * svgHeight

      // Clamp to viewBox bounds with padding
      x = Math.max(10, Math.min(svgWidth - 10, x))
      y = Math.max(10, Math.min(svgHeight - 10, y))

      onUpdateNodePosition(dragging.current, Math.round(x), Math.round(y))
    }
  }

  const handleMouseUp = () => {
    dragging.current = null
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          Campus Graph Network
        </h2>
      </div>

      {/* Tools */}
      <div className="border-b border-slate-200 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setMode("select")
              setEdgeStart(null)
            }}
            className={`p-2.5 rounded-lg transition text-sm font-medium ${mode === "select" ? "bg-emerald-600 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            Select
          </button>
          <button
            onClick={() => {
              setMode("move")
              setEdgeStart(null)
            }}
            className={`p-2.5 rounded-lg transition text-sm font-medium flex items-center justify-center gap-1 ${mode === "move" ? "bg-emerald-600 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            <Move size={16} /> Move
          </button>
          <button
            onClick={() => {
              setMode("add-edge")
              setEdgeStart(null)
            }}
            className={`p-2.5 rounded-lg transition text-sm font-medium flex items-center justify-center gap-1 ${mode === "add-edge" ? "bg-emerald-600 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            <Link2 size={16} /> Edge
          </button>
          <button
            onClick={() => {
              setMode("add-node")
              setEdgeStart(null)
            }}
            className={`p-2.5 rounded-lg transition text-sm font-medium flex items-center justify-center gap-1 ${mode === "add-node" ? "bg-emerald-600 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            <PlusCircle size={16} /> Node
          </button>
        </div>

        {mode === "add-node" && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <input
              type="text"
              placeholder="Node name"
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-slate-500 mt-2">Click on canvas to place node</p>
          </div>
        )}

        {mode === "add-edge" && edgeStart && (
          <p className="text-xs text-emerald-600 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <strong>{nodes.find((n) => n.id === edgeStart)?.name}</strong> selected. Click another node to connect.
          </p>
        )}
      </div>

      {/* Canvas */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-0">
        <svg
          ref={svgRef}
          width="100%"
          height="600"
          viewBox="0 0 800 600"
          onClick={handleSvgClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="cursor-crosshair"
        >
          {/* Grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="800" height="600" fill="url(#grid)" />

          {/* Edges */}
          {edges.map((edge) => {
            const from = nodes.find((n) => n.id === edge.from)
            const to = nodes.find((n) => n.id === edge.to)
            if (!from || !to) return null

            const midX = (from.x + to.x) / 2
            const midY = (from.y + to.y) / 2

            return (
              <g key={edge.id}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#cbd5e1" strokeWidth="2" />
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#64748b"
                  style={{ userSelect: "none" }}
                >
                  {edge.distance}
                </text>
              </g>
            )
          })}

          {/* Walking range visualization */}
          {optimalStops.map((stopId) => {
            const stop = nodes.find((n) => n.id === stopId)
            if (!stop) return null
            return (
              <circle
                key={`range-${stopId}`}
                cx={stop.x}
                cy={stop.y}
                r={maxWalkDistance}
                fill="#10b981"
                fillOpacity="0.08"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isOptimalStop = optimalStops.includes(node.id)
            const isSelected = selectedNode === node.id
            const nodeColor = node.color || "#06b6d4"

            return (
              <g key={node.id} onClick={(e) => handleNodeClick(node.id, e)} style={{ cursor: "pointer" }}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isOptimalStop ? 22 : 16}
                  fill={isOptimalStop ? "#10b981" : nodeColor}
                  stroke={isSelected ? "#f59e0b" : isOptimalStop ? "#059669" : "#0891b2"}
                  strokeWidth={isSelected ? 4 : 2}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dy="0.3em"
                  className="text-xs font-bold"
                  fill="white"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {node.name}
                </text>
                {isOptimalStop && (
                  <text
                    x={node.x}
                    y={node.y - 32}
                    textAnchor="middle"
                    className="text-xs font-bold"
                    fill="#059669"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    BUS STOP
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export default GraphCanvas
