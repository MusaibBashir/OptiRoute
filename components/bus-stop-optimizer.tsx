"use client"

import type React from "react"

import { useState } from "react"
import { Info, Zap, Trash2, Download, Upload } from "lucide-react"
import GraphCanvas from "./graph-canvas"
import ILPSolver from "./ilp-solver"
import NodesPanel from "./nodes-panel"
import logo from "./logo.png"

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
    {
      "id": 1,
      "name": "RP",
      "x": 514,
      "y": 506,
      "type": "hostel",
      "color": "#06b6d4"
    },
    {
      "id": 2,
      "name": "RK",
      "x": 513,
      "y": 404,
      "type": "hostel",
      "color": "#06b6d4"
    },
    {
      "id": 3,
      "name": "MS",
      "x": 509,
      "y": 319,
      "type": "hostel",
      "color": "#06b6d4"
    },
    {
      "id": 4,
      "name": "VS",
      "x": 390,
      "y": 250,
      "type": "hostel",
      "color": "#06b6d4"
    },
    {
      "id": 5,
      "name": "BCR",
      "x": 367,
      "y": 428,
      "type": "hostel",
      "color": "#06b6d4"
    },
    {
      "id": 6,
      "name": "LLR",
      "x": 578,
      "y": 210,
      "type": "hostel",
      "color": "#06b6d4"
    },
    {
      "id": 7,
      "name": "MMM",
      "x": 573,
      "y": 148,
      "type": "hostel",
      "color": "#06b6d4"
    },
    {
      "id": 8,
      "name": "LBS",
      "x": 519,
      "y": 87,
      "type": "hostel",
      "color": "#06b6d4"
    },
    {
      "id": 9,
      "name": "Patel",
      "x": 384,
      "y": 100,
      "type": "hostel",
      "color": "#06b6d4"
    },
    {
      "id": 10,
      "name": "Azad",
      "x": 229,
      "y": 78,
      "type": "hostel",
      "color": "#06b6d4"
    },
    {
      "id": 11,
      "name": "Nehru",
      "x": 334,
      "y": 46,
      "type": "hostel",
      "color": "#06b6d4"
    },
    {
      "id": 12,
      "name": "SNVH",
      "x": 107,
      "y": 186,
      "type": "hostel",
      "color": "#06b6d4"
    },
    {
      "id": 13,
      "name": "MT",
      "x": 154,
      "y": 322,
      "type": "hostel",
      "color": "#06b6d4"
    },
    {
      "id": 14,
      "name": "SNIG",
      "x": 227,
      "y": 379,
      "type": "hostel",
      "color": "#06b6d4"
    },
    {
      "id": 15,
      "name": "Nalanda",
      "x": 97,
      "y": 534,
      "type": "hostel",
      "color": "#a71616"
    },
  ])

  const [edges, setEdges] = useState<Edge[]>([
    {
      "id": 1,
      "from": 1,
      "to": 2,
      "distance": 102
    },
    {
      "id": 2,
      "from": 1,
      "to": 5,
      "distance": 166
    },
    {
      "id": 3,
      "from": 5,
      "to": 14,
      "distance": 148
    },
    {
      "id": 4,
      "from": 5,
      "to": 4,
      "distance": 179
    },
    {
      "id": 5,
      "from": 2,
      "to": 3,
      "distance": 85
    },
    {
      "id": 6,
      "from": 3,
      "to": 6,
      "distance": 129
    },
    {
      "id": 7,
      "from": 4,
      "to": 6,
      "distance": 192
    },
    {
      "id": 8,
      "from": 6,
      "to": 7,
      "distance": 62
    },
    {
      "id": 9,
      "from": 7,
      "to": 8,
      "distance": 81
    },
    {
      "id": 10,
      "from": 8,
      "to": 9,
      "distance": 136
    },
    {
      "id": 11,
      "from": 9,
      "to": 11,
      "distance": 74
    },
    {
      "id": 12,
      "from": 11,
      "to": 10,
      "distance": 110
    },
    {
      "id": 13,
      "from": 10,
      "to": 9,
      "distance": 157
    },
    {
      "id": 14,
      "from": 4,
      "to": 12,
      "distance": 290
    },
    {
      "id": 15,
      "from": 6,
      "to": 12,
      "distance": 472
    },
    {
      "id": 16,
      "from": 10,
      "to": 12,
      "distance": 163
    },
    {
      "id": 17,
      "from": 12,
      "to": 13,
      "distance": 144
    },
    {
      "id": 18,
      "from": 13,
      "to": 14,
      "distance": 93
    },
    {
      "id": 19,
      "from": 14,
      "to": 15,
      "distance": 202
    },
    {
      "id": 20,
      "from": 5,
      "to": 15,
      "distance": 290
    },
    {
      "id": 21,
      "from": 1,
      "to": 15,
      "distance": 418
    },
    {
      "id": 22,
      "from": 12,
      "to": 15,
      "distance": 348
    },
    {
      "id": 23,
      "from": 13,
      "to": 15,
      "distance": 220
    },
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

  const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.nodes && data.edges) {
          setNodes(data.nodes)
          setEdges(data.edges)
          if (data.maxWalkDistance) {
            setMaxWalkDistance(data.maxWalkDistance)
            setInputWalkDistance(data.maxWalkDistance)
          }
          if (data.solution) {
            setSolution(data.solution)
            // Extract optimal stops from solution coverage
            const optimalStopsFromSolution = Object.keys(data.solution.coverage).map((id) => Number.parseInt(id))
            setOptimalStops(optimalStopsFromSolution)
          } else {
            setOptimalStops([])
            setSolution(null)
          }
          setSelectedNode(null)
          setNewNodeName("")
        }
      } catch (error) {
        alert("Error loading JSON file. Please ensure it has the correct format.")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                <img
                  src={logo.src}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">OptiRoute</h1>
                <p className="text-xs text-slate-500">Project by: Musaib, Maadhav, Mayank, Kshitij</p>
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
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">Load Network</h3>
              </div>
              <div className="p-4">
                <label className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition cursor-pointer font-semibold shadow-md hover:shadow-lg">
                  <Upload size={18} />
                  Upload JSON
                  <input type="file" accept=".json" onChange={handleJsonUpload} className="hidden" />
                </label>
                <p className="text-xs text-slate-500 text-center mt-3">Upload a network with nodes & edges</p>
              </div>
            </div>

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
              <p className="text-xs text-slate-500 mt-1">Submitted under Prof. Akhilesh Kumar</p>
            </div>
            <p className="text-xs text-slate-500">Optimize bus stop placements using OR, Graph Theory and Greedy Algorithms</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default BusStopOptimizer
