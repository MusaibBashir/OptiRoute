"use client"

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

interface ILPSolverProps {
  nodes: Node[]
  edges: Edge[]
  inputWalkDistance: number
  setInputWalkDistance: (distance: number) => void
  optimalStops: number[]
  solution: Solution | null
  onSolve: () => void
  onClearSolution: () => void
}

const ILPSolver = ({
  nodes,
  edges,
  inputWalkDistance,
  setInputWalkDistance,
  optimalStops,
  solution,
  onSolve,
  onClearSolution,
}: ILPSolverProps) => {
  return (
    <div className="space-y-4">
      {/* Parameters Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
          Parameters
        </h2>
        <label className="block text-xs font-medium text-slate-700 mb-2">Max Walking Distance</label>
        <input
          type="number"
          value={inputWalkDistance}
          onChange={(e) => setInputWalkDistance(Math.max(1, Number(e.target.value)))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="text-xs text-slate-500 mt-2">Meters - adjust before solving</p>
      </div>

      {/* Solve Button */}
      <button
        onClick={onSolve}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition font-semibold shadow-md hover:shadow-lg"
      >
        Solve ILP
      </button>

      {/* Solution Results */}
      {solution && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 shadow-sm p-5">
          <h3 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
            <span className="text-lg">Results</span>
          </h3>
          <div className="mb-4">
            <p className="text-3xl font-bold text-emerald-600">{solution.numStops}</p>
            <p className="text-xs text-emerald-700 mt-1">Bus stops required</p>
            <p className={`text-xs mt-2 font-medium ${solution.allCovered ? "text-emerald-700" : "text-amber-700"}`}>
              {solution.allCovered ? "All hostels covered" : "Some hostels unreachable"}
            </p>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
            {optimalStops.map((stopId) => (
              <div key={stopId} className="bg-white p-2.5 rounded-lg border border-emerald-100">
                <p className="font-semibold text-sm text-slate-900">{nodes.find((n) => n.id === stopId)?.name}</p>
                <p className="text-xs text-slate-600 mt-1">Covers: {solution.coverage[stopId]?.join(", ")}</p>
              </div>
            ))}
          </div>
          <button
            onClick={onClearSolution}
            className="w-full bg-slate-200 text-slate-700 py-2.5 rounded-lg hover:bg-slate-300 transition text-sm font-medium"
          >
            Clear Solution
          </button>
        </div>
      )}
    </div>
  )
}

export default ILPSolver
