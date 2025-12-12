"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Option {
  id: string
  nome: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selecione...",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleOption = (optionId: string) => {
    if (selected.includes(optionId)) {
      onChange(selected.filter((id) => id !== optionId))
    } else {
      onChange([...selected, optionId])
    }
  }

  const removeOption = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter((id) => id !== optionId))
  }

  const selectedOptions = options.filter((opt) => selected.includes(opt.id))
  const displayText =
    selectedOptions.length > 0
      ? `${selectedOptions.length} selecionada${selectedOptions.length > 1 ? "s" : ""}`
      : placeholder

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-left",
          "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "flex items-center justify-between gap-2",
          isOpen && "ring-2 ring-ring"
        )}
      >
        <span
          className={cn(
            "flex-1 truncate",
            selected.length === 0 && "text-muted-foreground"
          )}
        >
          {displayText}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {selected.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
              {selectedOptions.slice(0, 2).map((opt) => (
                <span
                  key={opt.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-xs text-foreground"
                >
                  {opt.nome}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => removeOption(opt.id, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        removeOption(opt.id, e as any)
                      }
                    }}
                    className="hover:bg-muted-foreground/20 rounded-full p-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </span>
              ))}
              {selectedOptions.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{selectedOptions.length - 2}
                </span>
              )}
            </div>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isOpen && "transform rotate-180"
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 rounded-md border border-border bg-card shadow-md">
          <div className="max-h-60 overflow-auto p-1">
            {options.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Nenhuma opção disponível
              </div>
            ) : (
              options.map((option) => {
                const isSelected = selected.includes(option.id)
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleOption(option.id)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 text-sm rounded-sm",
                      "hover:bg-accent hover:text-accent-foreground",
                      "flex items-center gap-2",
                      isSelected && "bg-accent"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border border-input",
                        isSelected && "bg-primary border-primary text-primary-foreground"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span>{option.nome}</span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

