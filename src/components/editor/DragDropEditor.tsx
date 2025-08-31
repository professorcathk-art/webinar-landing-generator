'use client'

import { useState, useRef } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { motion } from 'framer-motion'
import { 
  Edit3, 
  Palette, 
  Type, 
  Image, 
  Settings, 
  Eye,
  Smartphone,
  Monitor,
  Save,
  Undo,
  Redo
} from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import toast from 'react-hot-toast'

interface Block {
  id: string
  type: 'hero' | 'value-prop' | 'instructor' | 'content' | 'testimonials' | 'faq' | 'form' | 'footer'
  content: string
  styles: Record<string, any>
  isEditing: boolean
}

interface EditorProps {
  initialContent: {
    html: string
    css: string
    js: string
  }
  pageId: string
}

export default function DragDropEditor({ initialContent, pageId }: EditorProps) {
  // Parse the AI-generated HTML to extract content for each block
  const parseAIContent = () => {
    const blocks: Block[] = []
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = initialContent.html
    
    // Extract hero section
    const heroSection = tempDiv.querySelector('.hero-section')
    blocks.push({
      id: 'hero',
      type: 'hero',
      content: heroSection ? heroSection.innerHTML : 'Hero Section',
      styles: { backgroundColor: '#ffffff', color: '#000000' },
      isEditing: false
    })
    
    // Extract benefits section
    const benefitsSection = tempDiv.querySelector('.benefits')
    blocks.push({
      id: 'value-prop',
      type: 'value-prop',
      content: benefitsSection ? benefitsSection.innerHTML : 'Value Proposition',
      styles: { backgroundColor: '#f8fafc', color: '#1f2937' },
      isEditing: false
    })
    
    // Extract instructor section
    const instructorSection = tempDiv.querySelector('.instructor')
    blocks.push({
      id: 'instructor',
      type: 'instructor',
      content: instructorSection ? instructorSection.innerHTML : 'About Instructor',
      styles: { backgroundColor: '#ffffff', color: '#000000' },
      isEditing: false
    })
    
    // Extract form section
    const formSection = tempDiv.querySelector('.registration-form')
    blocks.push({
      id: 'form',
      type: 'form',
      content: formSection ? formSection.innerHTML : 'Registration Form',
      styles: { backgroundColor: '#ffffff', color: '#000000' },
      isEditing: false
    })
    
    // Add remaining sections with default content
    blocks.push({
      id: 'content',
      type: 'content',
      content: 'Webinar Content',
      styles: { backgroundColor: '#f8fafc', color: '#1f2937' },
      isEditing: false
    })
    
    blocks.push({
      id: 'testimonials',
      type: 'testimonials',
      content: 'Testimonials',
      styles: { backgroundColor: '#ffffff', color: '#000000' },
      isEditing: false
    })
    
    blocks.push({
      id: 'faq',
      type: 'faq',
      content: 'FAQ Section',
      styles: { backgroundColor: '#f8fafc', color: '#1f2937' },
      isEditing: false
    })
    
    blocks.push({
      id: 'footer',
      type: 'footer',
      content: 'Footer',
      styles: { backgroundColor: '#1f2937', color: '#ffffff' },
      isEditing: false
    })
    
    return blocks
  }

  const [blocks, setBlocks] = useState<Block[]>(() => {
    // Use AI-generated content if available, otherwise use defaults
    if (initialContent.html && initialContent.html.trim() !== '') {
      return parseAIContent()
    }
    
    // Fallback to default blocks
    return [
      {
        id: 'hero',
        type: 'hero',
        content: 'Hero Section',
        styles: { backgroundColor: '#ffffff', color: '#000000' },
        isEditing: false
      },
      {
        id: 'value-prop',
        type: 'value-prop',
        content: 'Value Proposition',
        styles: { backgroundColor: '#f8fafc', color: '#1f2937' },
        isEditing: false
      },
      {
        id: 'instructor',
        type: 'instructor',
        content: 'About Instructor',
        styles: { backgroundColor: '#ffffff', color: '#000000' },
        isEditing: false
      },
      {
        id: 'content',
        type: 'content',
        content: 'Webinar Content',
        styles: { backgroundColor: '#f8fafc', color: '#1f2937' },
        isEditing: false
      },
      {
        id: 'testimonials',
        type: 'testimonials',
        content: 'Testimonials',
        styles: { backgroundColor: '#ffffff', color: '#000000' },
        isEditing: false
      },
      {
        id: 'faq',
        type: 'faq',
        content: 'FAQ Section',
        styles: { backgroundColor: '#f8fafc', color: '#1f2937' },
        isEditing: false
      },
      {
        id: 'form',
        type: 'form',
        content: 'Registration Form',
        styles: { backgroundColor: '#ffffff', color: '#000000' },
        isEditing: false
      },
      {
        id: 'footer',
        type: 'footer',
        content: 'Footer',
        styles: { backgroundColor: '#1f2937', color: '#ffffff' },
        isEditing: false
      }
    ]
  })

  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [history, setHistory] = useState<Block[][]>([blocks])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  const editorRef = useRef<HTMLDivElement>(null)

  const addToHistory = (newBlocks: Block[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newBlocks)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const newBlocks = Array.from(blocks)
    const [reorderedBlock] = newBlocks.splice(result.source.index, 1)
    newBlocks.splice(result.destination.index, 0, reorderedBlock)

    setBlocks(newBlocks)
    addToHistory(newBlocks)
  }

  const toggleBlockEditing = (blockId: string) => {
    setBlocks(blocks.map(block => 
      block.id === blockId 
        ? { ...block, isEditing: !block.isEditing }
        : block
    ))
  }

  const updateBlockContent = (blockId: string, content: string) => {
    const newBlocks = blocks.map(block => 
      block.id === blockId 
        ? { ...block, content }
        : block
    )
    setBlocks(newBlocks)
    addToHistory(newBlocks)
  }

  const updateBlockStyle = (blockId: string, style: string, value: any) => {
    const newBlocks = blocks.map(block => 
      block.id === blockId 
        ? { ...block, styles: { ...block.styles, [style]: value } }
        : block
    )
    setBlocks(newBlocks)
    addToHistory(newBlocks)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setBlocks(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setBlocks(history[historyIndex + 1])
    }
  }

  const savePage = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blocks,
          html: generateHTML(),
          css: generateCSS(),
          js: generateJS(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save page')
      }

      toast.success('Page saved successfully!')
    } catch (error) {
      console.error('Error saving page:', error)
      toast.error('Failed to save page')
    } finally {
      setIsSaving(false)
    }
  }

  const generateHTML = () => {
    return blocks.map(block => `
      <section id="${block.id}" class="block ${block.type}-block">
        <div class="container">
          ${block.content}
        </div>
      </section>
    `).join('')
  }

  const generateCSS = () => {
    return blocks.map(block => `
      .${block.type}-block {
        background-color: ${block.styles.backgroundColor};
        color: ${block.styles.color};
        padding: 4rem 0;
      }
    `).join('')
  }

  const generateJS = () => {
    return `
      // Interactive functionality
      document.addEventListener('DOMContentLoaded', function() {
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
              behavior: 'smooth'
            });
          });
        });
      });
    `
  }

  const blockTypes = {
    hero: { icon: Edit3, label: 'Hero Section' },
    'value-prop': { icon: Type, label: 'Value Proposition' },
    instructor: { icon: Image, label: 'About Instructor' },
    content: { icon: Edit3, label: 'Webinar Content' },
    testimonials: { icon: Image, label: 'Testimonials' },
    faq: { icon: Settings, label: 'FAQ Section' },
    form: { icon: Edit3, label: 'Registration Form' },
    footer: { icon: Settings, label: 'Footer' }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Page Editor</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={undo}
                disabled={historyIndex === 0}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex === history.length - 1}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                <Redo className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={savePage}
            disabled={isSaving}
            className="w-full btn-primary flex items-center justify-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Page'}
          </button>
        </div>

        {/* Blocks List */}
        <div className="flex-1 overflow-y-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="blocks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="p-4 space-y-2"
                >
                  {blocks.map((block, index) => {
                    const BlockIcon = blockTypes[block.type].icon
                    return (
                      <Draggable key={block.id} draggableId={block.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              p-3 rounded-lg border cursor-move transition-all
                              ${selectedBlock === block.id 
                                ? 'border-primary-500 bg-primary-50' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                              }
                              ${snapshot.isDragging ? 'shadow-lg' : ''}
                            `}
                            onClick={() => setSelectedBlock(block.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <BlockIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-900">
                                  {blockTypes[block.type].label}
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleBlockEditing(block.id)
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Edit3 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Preview Controls */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-medium text-gray-900">Preview</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-3 py-1 rounded text-sm ${
                    previewMode === 'desktop' 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-3 py-1 rounded text-sm ${
                    previewMode === 'mobile' 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mobile
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              <Palette className="h-4 w-4" />
              <span>Colors</span>
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-gray-50 p-8 overflow-auto">
          <div className={`
            mx-auto bg-white shadow-lg rounded-lg overflow-hidden
            ${previewMode === 'mobile' ? 'max-w-sm' : 'max-w-4xl'}
          `}>
            <div
              ref={editorRef}
              className="min-h-screen"
              style={{
                transform: previewMode === 'mobile' ? 'scale(0.8)' : 'scale(1)',
                transformOrigin: 'top center',
              }}
            >
              {blocks.map((block) => (
                <motion.div
                  key={block.id}
                  layout
                  className={`
                    block ${block.type}-block relative
                    ${selectedBlock === block.id ? 'ring-2 ring-primary-500' : ''}
                  `}
                  style={block.styles}
                  onClick={() => setSelectedBlock(block.id)}
                >
                  <div className="container mx-auto px-4 py-8">
                    {block.isEditing ? (
                      <textarea
                        value={block.content}
                        onChange={(e) => updateBlockContent(block.id, e.target.value)}
                        className="w-full h-32 p-2 border border-gray-300 rounded resize-none"
                        autoFocus
                        onBlur={() => toggleBlockEditing(block.id)}
                      />
                    ) : (
                      <div 
                        className="min-h-[100px] p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500"
                        onClick={() => toggleBlockEditing(block.id)}
                      >
                        {block.content}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Color Picker Panel */}
      {showColorPicker && selectedBlock && (
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Color Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <HexColorPicker
                color={blocks.find(b => b.id === selectedBlock)?.styles.backgroundColor || '#ffffff'}
                onChange={(color) => updateBlockStyle(selectedBlock, 'backgroundColor', color)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Color
              </label>
              <HexColorPicker
                color={blocks.find(b => b.id === selectedBlock)?.styles.color || '#000000'}
                onChange={(color) => updateBlockStyle(selectedBlock, 'color', color)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
