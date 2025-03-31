"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash } from "lucide-react"

interface SpecificationsEditorProps {
  value: Record<string, string>
  onChange: (value: Record<string, string>) => void
}

export function SpecificationsEditor({ value, onChange }: SpecificationsEditorProps) {
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")

  const handleAddSpec = () => {
    if (!newKey.trim()) return

    onChange({
      ...value,
      [newKey.trim()]: newValue.trim(),
    })

    setNewKey("")
    setNewValue("")
  }

  const handleRemoveSpec = (key: string) => {
    const newSpecs = { ...value }
    delete newSpecs[key]
    onChange(newSpecs)
  }

  const handleUpdateValue = (key: string, newVal: string) => {
    onChange({
      ...value,
      [key]: newVal,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {Object.entries(value).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">{key}</Label>
              <Input value={val} onChange={(e) => handleUpdateValue(key, e.target.value)} placeholder="Value" />
            </div>
            <Button type="button" variant="ghost" size="icon" className="mt-5" onClick={() => handleRemoveSpec(key)}>
              <Trash className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="spec-key">Specification</Label>
          <Input
            id="spec-key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="e.g., Processor, RAM, Storage"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="spec-value">Value</Label>
          <Input
            id="spec-value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="e.g., Intel i7, 16GB, 512GB SSD"
          />
        </div>
        <Button type="button" onClick={handleAddSpec} disabled={!newKey.trim()} className="mb-px">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  )
}

