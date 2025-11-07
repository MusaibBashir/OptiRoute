"use client"

import { useState } from "react"
import { Info, Zap, Trash2, Download } from "lucide-react"
import GraphCanvas from "./graph-canvas"
import ILPSolver from "./ilp-solver"
import NodesPanel from "./nodes-panel"

interface Node {
  id: number
  name: string
  x: number
  y: number
  type: string
  color?: string // added optional color property
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

const BusStopOptimizer = () => {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 1, name: "RP", x: 100, y: 150, type: "hostel", color: "#06b6d4" },
    { id: 2, name: "RK", x: 250, y: 200, type: "hostel", color: "#06b6d4" },
    { id: 3, name: "AZAD", x: 400, y: 180, type: "hostel", color: "#06b6d4" },
    { id: 4, name: "SNIG", x: 550, y: 220, type: "hostel", color: "#06b6d4" },
    { id: 5, name: "LBS", x: 350, y: 350, type: "hostel", color: "#06b6d4" },
    { id: 6, name: "NALANDA", x: 500, y: 380, type: "hostel", color: "#06b6d4" },
  ])

  const [edges, setEdges] = useState<Edge[]>([
    { id: 1, from: 1, to: 2, distance: 170 },
    { id: 2, from: 2, to: 3, distance: 180 },
    { id: 3, from: 3, to: 4, distance: 160 },
    { id: 4, from: 3, to: 5, distance: 200 },
    { id: 5, from: 4, to: 6, distance: 190 },
    { id: 6, from: 5, to: 6, distance: 170 },
  ])

  const [maxWalkDistance, setMaxWalkDistance] = useState(200)
  const [inputWalkDistance, setInputWalkDistance] = useState(200)
  const [optimalStops, setOptimalStops] = useState<number[]>([])
  const [solution, setSolution] = useState<Solution | null>(null)
  const [mode, setMode] = useState("select")
  const [selectedNode, setSelectedNode] = useState<number | null>(null)
  const [edgeStart, setEdgeStart] = useState<number | null>(null)
  const [newNodeName, setNewNodeName] = useState("")
  const [showInfo, setShowInfo] = useState(false)

  const calculateDistance = (node1: Node, node2: Node) => {
    return Math.sqrt(Math.pow(node2.x - node1.x, 2) + Math.pow(node2.y - node1.y, 2))
  }

  const addNode = (x: number, y: number) => {
    if (!newNodeName || newNodeName.trim() === "") return
    if (typeof x !== "number" || typeof y !== "number" || isNaN(x) || isNaN(y)) return

    const newId = Math.max(...nodes.map((n) => n.id), 0) + 1
    setNodes([
      ...nodes,
      {
        id: newId,
        name: newNodeName.trim(),
        x: Math.round(x),
        y: Math.round(y),
        type: "hostel",
        color: "#06b6d4", // default cyan color for new nodes
      },
    ])
    setNewNodeName("")
    setMode("select")
    setOptimalStops([])
    setSolution(null)
  }

  const removeNode = (id: number) => {
    setNodes(nodes.filter((n) => n.id !== id))
    setEdges(edges.filter((e) => e.from !== id && e.to !== id))
    setSelectedNode(null)
    setOptimalStops([])
    setSolution(null)
  }

  const addEdge = (fromId: number, toId: number) => {
    if (fromId === toId) return
    const exists = edges.find((e) => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId))
    if (exists) return

    const node1 = nodes.find((n) => n.id === fromId)
    const node2 = nodes.find((n) => n.id === toId)
    if (!node1 || !node2) return

    const distance = Math.round(calculateDistance(node1, node2))
    const newId = Math.max(...edges.map((e) => e.id), 0) + 1

    setEdges([
      ...edges,
      {
        id: newId,
        from: fromId,
        to: toId,
        distance: distance,
      },
    ])
    setOptimalStops([])
    setSolution(null)
  }

  const removeEdge = (id: number) => {
    setEdges(edges.filter((e) => e.id !== id))
    setOptimalStops([])
    setSolution(null)
  }

  const updateEdgeDistance = (id: number, distance: number) => {
    setEdges(edges.map((e) => (e.id === id ? { ...e, distance: distance } : e)))
    setOptimalStops([])
    setSolution(null)
  }

  const updateNodePosition = (nodeId: number, x: number, y: number) => {
    setNodes(nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)))
  }

  const updateNodeColor = (id: number, color: string) => {
    setNodes(nodes.map((n) => (n.id === id ? { ...n, color } : n)))
  }

  const updateNodeName = (id: number, name: string) => {
    setNodes(nodes.map((n) => (n.id === id ? { ...n, name } : n)))
  }

  const solveSetCoverILP = () => {
    setMaxWalkDistance(inputWalkDistance)

    if (nodes.length === 0) return

    const adj: Record<number, Record<number, number>> = {}
    nodes.forEach((n) => (adj[n.id] = {}))
    edges.forEach((e) => {
      adj[e.from][e.to] = e.distance
      adj[e.to][e.from] = e.distance
    })

    const dist: Record<number, Record<number, number>> = {}
    nodes.forEach((n) => {
      dist[n.id] = {}
      nodes.forEach((m) => {
        dist[n.id][m.id] = n.id === m.id ? 0 : Number.POSITIVE_INFINITY
      })
    })
    edges.forEach((e) => {
      dist[e.from][e.to] = e.distance
      dist[e.to][e.from] = e.distance
    })

    nodes.forEach((k) => {
      nodes.forEach((i) => {
        nodes.forEach((j) => {
          if (dist[i.id][k.id] + dist[k.id][j.id] < dist[i.id][j.id]) {
            dist[i.id][j.id] = dist[i.id][k.id] + dist[k.id][j.id]
          }
        })
      })
    })

    const hostels = nodes.filter((n) => n.type === "hostel")
    const potentialStops = nodes
    const coverage: Record<number, number[]> = {}

    potentialStops.forEach((stop) => {
      coverage[stop.id] = []
      hostels.forEach((hostel) => {
        if (dist[stop.id][hostel.id] <= inputWalkDistance) {
          coverage[stop.id].push(hostel.id)
        }
      })
    })

    const uncovered = new Set(hostels.map((h) => h.id))
    const selectedStops: number[] = []
    const coverageInfo: Record<number, string[]> = {}

    while (uncovered.size > 0) {
      let bestStop: number | null = null
      let maxNewCoverage = 0
      let bestCovered: number[] = []

      potentialStops.forEach((stop) => {
        const newlyCovered = coverage[stop.id].filter((h) => uncovered.has(h))
        if (newlyCovered.length > maxNewCoverage) {
          maxNewCoverage = newlyCovered.length
          bestStop = stop.id
          bestCovered = newlyCovered
        }
      })

      if (bestStop === null) break

      selectedStops.push(bestStop)
      coverageInfo[bestStop] = coverage[bestStop].map((h) => nodes.find((n) => n.id === h)?.name || "")
      bestCovered.forEach((h) => uncovered.delete(h))
    }

    setOptimalStops(selectedStops)
    setSolution({
      numStops: selectedStops.length,
      coverage: coverageInfo,
      allCovered: uncovered.size === 0,
      algorithm: "ILP Set Cover (Greedy Approximation)",
    })
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">OR</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">OptiRoute</h1>
                <p className="text-xs text-slate-500">Bus Stop Optimization</p>
              </div>
            </div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600"
            >
              <Info size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Info Banner */}
      {showInfo && (
        <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-4">
              <Zap className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-emerald-900 mb-1">Operations Research Approach</h3>
                <p className="text-sm text-emerald-800 mb-1">
                  <strong>Problem:</strong> Minimum Set Cover — Select the minimum number of bus stops to cover all
                  hostels within the walking distance constraint.
                </p>
                <p className="text-sm text-emerald-800 mb-1">
                  <strong>Formulation:</strong> Minimize Σ(x_i) subject to: For each hostel j, Σ(a_ij × x_i) ≥ 1, where
                  x_i ∈ {"{0,1}"}
                </p>
                <p className="text-sm text-emerald-800">
                  <strong>Algorithm:</strong> Greedy approximation with O(log n) guarantee using Floyd-Warshall shortest
                  paths.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - ILP Solver only */}
          <div className="lg:col-span-2 space-y-6">
            <ILPSolver
              nodes={nodes}
              edges={edges}
              inputWalkDistance={inputWalkDistance}
              setInputWalkDistance={setInputWalkDistance}
              optimalStops={optimalStops}
              solution={solution}
              onSolve={solveSetCoverILP}
              onClearSolution={() => {
                setOptimalStops([])
                setSolution(null)
              }}
            />
          </div>

          {/* Center - Graph Canvas */}
          <div className="lg:col-span-7">
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              mode={mode}
              setMode={setMode}
              newNodeName={newNodeName}
              setNewNodeName={setNewNodeName}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              edgeStart={edgeStart}
              setEdgeStart={setEdgeStart}
              optimalStops={optimalStops}
              maxWalkDistance={maxWalkDistance}
              onAddNode={addNode}
              onAddEdge={addEdge}
              onNodeClick={(nodeId) => {
                if (mode === "select") {
                  setSelectedNode(selectedNode === nodeId ? null : nodeId)
                }
              }}
              onUpdateNodePosition={updateNodePosition}
            />
          </div>

          {/* Right Panel - Edges and Nodes combined */}
          <div className="lg:col-span-3 space-y-4">
            <NodesPanel
              nodes={nodes}
              edges={edges}
              onRemoveNode={removeNode}
              onUpdateNodeName={updateNodeName}
              onUpdateNodeColor={updateNodeColor}
              onRemoveEdge={removeEdge}
              onUpdateEdgeDistance={updateEdgeDistance}
            />

            {/* Export Button */}
            {solution && (
              <button
                onClick={() => {
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
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg"
              >
                <Download size={18} />
                Export Solution
              </button>
            )}

            {/* Selected Node Info */}
            {selectedNode && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm p-5">
                <h3 className="font-semibold text-amber-900 mb-3">Selected Node</h3>
                <p className="text-sm font-semibold text-slate-900 mb-3">
                  {nodes.find((n) => n.id === selectedNode)?.name}
                </p>
                <button
                  onClick={() => {
                    removeNode(selectedNode)
                  }}
                  className="w-full bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Trash2 size={16} />
                  Delete Node
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">OptiRoute</p>
              <p className="text-xs text-slate-500 mt-1">Powered by Operations Research</p>
            </div>
            <p className="text-xs text-slate-500">Optimize bus stop placements using Integer Linear Programming</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default BusStopOptimizer
