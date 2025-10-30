import React, { useEffect, useMemo, useState, useImperativeHandle, forwardRef, useCallback, useRef } from 'react'
import ReactFlow, { Background, Controls, useReactFlow } from 'reactflow'
import 'reactflow/dist/style.css'
import { toPng } from 'html-to-image'

// Utility to build nodes/edges with simple tree layout
function buildGraph(data) {
  const nodes = []
  const edges = []
  const pathToId = {}

  let idCounter = 0
  const genId = () => `n_${idCounter++}`

  // First compute subtree sizes to layout horizontally
  function measure(node) {
    if (node === null || typeof node !== 'object') return 1
    if (Array.isArray(node)) {
      if (node.length === 0) return 1
      return node.map(measure).reduce((a, b) => a + b, 0)
    }
    const keys = Object.keys(node)
    if (keys.length === 0) return 1
    return keys.map((k) => measure(node[k])).reduce((a, b) => a + b, 0)
  }

  const H_GAP = 200
  const V_GAP = 110

  function traverse(node, key, path, depth, xStart) {
    const type = node === null ? 'primitive' : Array.isArray(node) ? 'array' : typeof node === 'object' ? 'object' : 'primitive'

    const width = measure(node) // number of leaf columns under this node
    const xCenter = xStart + (width * H_GAP) / 2

    const id = genId()
    pathToId[path] = id

    let label
    let bg
    if (type === 'object') {
      label = key ? `{ ${key} }` : '{ root }'
      bg = '#3b82f6' // blue
    } else if (type === 'array') {
      label = key ? `[ ${key} ]` : '[ root ]'
      bg = '#10b981' // green
    } else {
      // primitive
      const val = String(node)
      label = key !== undefined && key !== null ? `${key}: ${val}` : val
      bg = '#f59e0b' // amber
    }

    nodes.push({
      id,
      position: { x: xCenter, y: depth * V_GAP },
      data: { label, type, path, value: node },
      style: {
        borderRadius: 8,
        padding: 8,
        color: 'white',
        background: bg,
        border: '2px solid rgba(255,255,255,0.25)'
      }
    })

    // Recurse children and make edges
    if (type === 'object') {
      const keys = Object.keys(node)
      let childX = xStart
      for (const k of keys) {
        const child = node[k]
        const childWidth = measure(child)
        const childPath = path ? `${path}.${k}` : k
        const childId = traverse(child, k, childPath, depth + 1, childX)
        edges.push({ id: `${id}-${childId}`, source: id, target: childId })
        childX += childWidth * H_GAP
      }
    } else if (type === 'array') {
      let childX = xStart
      for (let i = 0; i < node.length; i++) {
        const child = node[i]
        const childWidth = measure(child)
        const childPath = `${path}[${i}]`
        const childId = traverse(child, `${i}`, childPath, depth + 1, childX)
        edges.push({ id: `${id}-${childId}`, source: id, target: childId })
        childX += childWidth * H_GAP
      }
    }

    return id
  }

  // Kickoff
  traverse(data, null, '$', 0, 0)

  // Normalize positions so smallest x is near 0
  const minX = Math.min(...nodes.map((n) => n.position.x))
  nodes.forEach((n) => (n.position.x = n.position.x - minX + 40))

  return { nodes, edges, pathToId }
}

function useFitToNode() {
  const { fitView } = useReactFlow()
  const focus = useCallback(
    (id) => {
      if (!id) return
      fitView({ nodes: [{ id }], padding: 0.4, duration: 600 })
    },
    [fitView]
  )
  return focus
}

const TreeCanvas = forwardRef(function TreeCanvas({ data, highlightedId }, ref) {
  const graph = useMemo(() => (data ? buildGraph(data) : { nodes: [], edges: [], pathToId: {} }), [data])
  const [rfInstance, setRfInstance] = useState(null)
  const focus = useFitToNode()
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (rfInstance) {
      // Fit to the whole view initially
      rfInstance.fitView({ padding: 0.2 })
    }
  }, [rfInstance, graph.nodes.length])

  useImperativeHandle(ref, () => ({
    focusNodeByPath: (path) => {
      const id = graph.pathToId[path]
      if (id) focus(id)
      return id || null
    },
    getPathMap: () => graph.pathToId,
    zoomIn: () => rfInstance && rfInstance.zoomIn(),
    zoomOut: () => rfInstance && rfInstance.zoomOut(),
    fitAll: () => rfInstance && rfInstance.fitView({ padding: 0.2 }),
    exportAsPng: async (filename = 'json-tree.png') => {
      if (!wrapperRef.current) return null
      const dataUrl = await toPng(wrapperRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
        style: { width: `${wrapperRef.current.clientWidth}px`, height: `${wrapperRef.current.clientHeight}px` }
      })
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
      return dataUrl
    }
  }))

  return (
    <div ref={wrapperRef} className="h-[520px] w-full rounded-xl border overflow-hidden bg-white">
      <ReactFlow
        nodes={graph.nodes.map((n) => ({
          ...n,
          style: {
            ...n.style,
            boxShadow: highlightedId === n.id ? '0 0 0 4px rgba(99,102,241,0.5)' : '0 1px 2px rgba(0,0,0,0.08)'
          }
        }))}
        edges={graph.edges}
        onInit={setRfInstance}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={18} color="#e5e7eb" />
        <Controls position="bottom-right" />
      </ReactFlow>
    </div>
  )
})

export default TreeCanvas
