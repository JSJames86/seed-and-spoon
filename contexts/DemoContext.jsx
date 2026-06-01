'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const DemoContext = createContext({ demo: false, setDemo: () => {} })

export function DemoProvider({ children }) {
  const [demo, setDemoState] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('ss_demo_mode')
    if (stored === 'true') setDemoState(true)
  }, [])

  const setDemo = (val) => {
    setDemoState(val)
    localStorage.setItem('ss_demo_mode', val ? 'true' : 'false')
  }

  return (
    <DemoContext.Provider value={{ demo, setDemo }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  return useContext(DemoContext)
}
