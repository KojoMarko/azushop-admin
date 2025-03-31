"use client"

import { useState } from "react"
import { Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter description...",
  minHeight = "200px",
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")

  const handleFormat = (format: string) => {
    const textarea = document.getElementById("rich-text-editor") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    let formattedText = ""

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        break
      case "italic":
        formattedText = `*${selectedText}*`
        break
      case "ul":
        formattedText = selectedText
          .split("\n")
          .map((line) => `- ${line}`)
          .join("\n")
        break
      case "ol":
        formattedText = selectedText
          .split("\n")
          .map((line, i) => `${i + 1}. ${line}`)
          .join("\n")
        break
      case "left":
        formattedText = `<div style="text-align: left">${selectedText}</div>`
        break
      case "center":
        formattedText = `<div style="text-align: center">${selectedText}</div>`
        break
      case "right":
        formattedText = `<div style="text-align: right">${selectedText}</div>`
        break
      default:
        formattedText = selectedText
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end)
    onChange(newValue)

    // Reset selection
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length)
    }, 0)
  }

  // Simple markdown to HTML converter
  const renderPreview = () => {
    const html = value
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Unordered lists
      .replace(/^- (.*)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
      // Ordered lists
      .replace(/^\d+\. (.*)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>\n?)+/g, "<ol>$&</ol>")
      // Paragraphs
      .replace(/^(?!<[uo]l>|<li>)(.+)$/gm, "<p>$1</p>")
      // Line breaks
      .replace(/\n/g, "")

    return { __html: html }
  }

  return (
    <div className="border rounded-md">
      <div className="flex items-center gap-1 p-1 border-b bg-muted/50">
        <Button type="button" variant="ghost" size="icon" onClick={() => handleFormat("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => handleFormat("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <div className="h-4 w-px bg-border mx-1" />
        <Button type="button" variant="ghost" size="icon" onClick={() => handleFormat("ul")} title="Bullet List">
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => handleFormat("ol")} title="Numbered List">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="h-4 w-px bg-border mx-1" />
        <Button type="button" variant="ghost" size="icon" onClick={() => handleFormat("left")} title="Align Left">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => handleFormat("center")} title="Align Center">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => handleFormat("right")} title="Align Right">
          <AlignRight className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "write" | "preview")}
          className="w-[200px]"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div style={{ minHeight }}>
        {activeTab === "write" ? (
          <Textarea
            id="rich-text-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="border-0 rounded-none h-full min-h-[200px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        ) : (
          <div
            className="p-3 prose prose-sm max-w-none h-full overflow-auto"
            dangerouslySetInnerHTML={renderPreview()}
          />
        )}
      </div>
    </div>
  )
}

