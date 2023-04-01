import React, { useRef, useState, useEffect } from 'react'
import ReactResizeDetector from 'react-resize-detector'
import { Layouts, Layout } from 'react-grid-layout'

interface DynamicHeightItemProps {
  children: React.ReactNode
  layouts: Layouts
  onLayoutsChange: (layouts: Layouts) => void
  i: string
  breakpoint: keyof Layouts
  rows?: number
}

const DynamicHeightItem: React.FC<DynamicHeightItemProps> = ({
  children,
  layouts,
  onLayoutsChange,
  i,
  breakpoint,
  rows = 1
}) => {
  const [height, setHeight] = useState<number>(rows * 30)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.clientHeight)
    }
  }, [ref.current])

  const onResize = () => {
    if (ref.current) {
      setHeight(ref.current.clientHeight)
    }
  }

  useEffect(() => {
    const newLayouts: Layouts = { ...layouts }
    newLayouts[breakpoint] = newLayouts[breakpoint]?.map((item: Layout) => {
      if (item.i === i) {
        return {
          ...item,
          h: Math.ceil(height / (rows * 30)) // Adjust this value based on your rowHeight and the number of rows the element spans
        }
      }
      return item
    })

    onLayoutsChange(newLayouts)
  }, [height, breakpoint])

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <ReactResizeDetector handleHeight onResize={onResize}>
        {children}
      </ReactResizeDetector>
    </div>
  )
}

export default DynamicHeightItem
