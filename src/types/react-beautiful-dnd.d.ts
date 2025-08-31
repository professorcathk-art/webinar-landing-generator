declare module 'react-beautiful-dnd' {
  import * as React from 'react'

  export interface DraggableLocation {
    droppableId: string
    index: number
  }

  export interface DragStart {
    draggableId: string
    type: string
    source: DraggableLocation
  }

  export interface DragUpdate extends DragStart {
    destination?: DraggableLocation
  }

  export interface DropResult extends DragUpdate {
    reason: 'DROP' | 'CANCEL'
  }

  export interface DroppableProvided {
    innerRef: (element: HTMLElement | null) => void
    placeholder: React.ReactElement | null
    droppableProps: any
  }

  export interface DraggableProvided {
    innerRef: (element: HTMLElement | null) => void
    draggableProps: any
    dragHandleProps: any
  }

  export interface DroppableStateSnapshot {
    isDraggingOver: boolean
    draggingOverWith?: string
    draggingFromThisWith?: string
  }

  export interface DraggableStateSnapshot {
    isDragging: boolean
    draggingOver?: string
    draggingWith?: string
  }

  export interface DroppableProps {
    droppableId: string
    type?: string
    mode?: 'standard' | 'virtual'
    children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactElement
  }

  export interface DraggableProps {
    draggableId: string
    index: number
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => React.ReactElement
  }

  export interface DragDropContextProps {
    onDragStart?: (initial: DragStart) => void
    onDragUpdate?: (initial: DragUpdate) => void
    onDragEnd: (result: DropResult) => void
    children: React.ReactNode
  }

  export const DragDropContext: React.ComponentType<DragDropContextProps>
  export const Droppable: React.ComponentType<DroppableProps>
  export const Draggable: React.ComponentType<DraggableProps>
}
