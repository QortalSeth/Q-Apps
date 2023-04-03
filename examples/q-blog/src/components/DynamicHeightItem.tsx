import React, { useRef, useState, useEffect } from 'react'
import ReactResizeDetector from 'react-resize-detector'
import { Layouts, Layout } from 'react-grid-layout'

interface DynamicHeightItemProps {
  children: React.ReactNode
  layouts: Layouts
  setLayouts: (layouts: any) => void
  i: string
  breakpoint: keyof Layouts
  rows?: number
  count?: number
  type?: string
}

const DynamicHeightItem: React.FC<DynamicHeightItemProps> = ({
  children,
  layouts,
  setLayouts,
  i,
  breakpoint,
  rows = 1,
  count,
  type
}) => {
  const [height, setHeight] = useState<number>(rows * 150)
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

  const getBreakpoint = (screenWidth: number) => {
    if (screenWidth >= 996) {
      return 'md'
    } else if (screenWidth >= 768) {
      return 'sm'
    } else {
      return 'xs'
    }
  }

  useEffect(() => {
    const widthWin = window.innerWidth
    let newBreakpoint = breakpoint
    // if (!newBreakpoint) {
    //   newBreakpoint = getBreakpoint(widthWin)
    // }

    console.log({ newBreakpoint })
    setLayouts((prev: any) => {
      console.log({ prev })
      const newLayouts: any = { ...prev }
      newLayouts[newBreakpoint] = newLayouts[newBreakpoint]?.map(
        (item: Layout) => {
          if (item.i === i) {
            let constantNum = 25

            console.log({
              item,
              height,
              minHeight: Math.ceil(height / (rows * constantNum))
            })
            // if (type === 'image') {
            //   constantNum = 39
            // }
            return {
              ...item,
              h: Math.ceil(height / (rows * constantNum)) // Adjust this value based on your rowHeight and the number of rows the element spans
            }
          }
          return item
        }
      )
      return newLayouts
    })
  }, [height, breakpoint, count, setLayouts])

  console.log({ height, breakpoint, layouts })

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <ReactResizeDetector handleHeight onResize={onResize}>
        {children}
      </ReactResizeDetector>
    </div>
  )
}

export default DynamicHeightItem
