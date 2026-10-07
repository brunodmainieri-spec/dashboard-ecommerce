import { useEffect, useState } from 'react'

const FILES = [
  'meta',
  'kpis',
  'monthly',
  'by_category',
  'products',
  'by_geo',
  'segments',
  'cohorts',
  'rfm',
  'orders_behavior',
]

// Carrega, uma única vez, todos os JSONs pré-processados de public/data/.
export function useData() {
  const [state, setState] = useState({ loading: true, error: null, data: null })

  useEffect(() => {
    let alive = true
    Promise.all(
      FILES.map((f) =>
        fetch(`${import.meta.env.BASE_URL}data/${f}.json`).then((r) => {
          if (!r.ok) throw new Error(`Falha ao carregar ${f}.json (${r.status})`)
          return r.json()
        }),
      ),
    )
      .then((results) => {
        if (!alive) return
        const data = Object.fromEntries(FILES.map((f, i) => [f, results[i]]))
        setState({ loading: false, error: null, data })
      })
      .catch((error) => alive && setState({ loading: false, error, data: null }))
    return () => {
      alive = false
    }
  }, [])

  return state
}
