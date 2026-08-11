"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (html: string) => void;
  className?: string;
};

export function RichTextEditor({
  id,
  label = "Content",
  value,
  onChange,
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef(value);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (!el.dataset.ready) {
      el.innerHTML = value || "<p></p>";
      el.dataset.ready = "1";
      lastEmitted.current = value;
      return;
    }
    if (value === lastEmitted.current) return;
    if (el.innerHTML === value) return;
    el.innerHTML = value || "<p></p>";
  }, [value]);

  function emit() {
    const el = editorRef.current;
    if (!el) return;
    const next = sanitizeHtml(el.innerHTML);
    lastEmitted.current = next;
    onChange(next);
  }

  function runCommand(command: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emit();
  }

  function addLink() {
    const url = window.prompt("Link URL (https://… or /path)");
    if (!url) return;
    const trimmed = url.trim();
    if (!trimmed) return;
    runCommand("createLink", trimmed);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <div className="overflow-hidden rounded-lg border border-input">
        <div className="flex flex-wrap gap-1 border-b border-border bg-muted/40 p-1.5">
          <ToolbarButton
            label="Bold"
            onClick={() => runCommand("bold")}
            icon={<Bold className="size-3.5" />}
          />
          <ToolbarButton
            label="Italic"
            onClick={() => runCommand("italic")}
            icon={<Italic className="size-3.5" />}
          />
          <ToolbarButton
            label="Underline"
            onClick={() => runCommand("underline")}
            icon={<Underline className="size-3.5" />}
          />
          <ToolbarButton
            label="Bullet list"
            onClick={() => runCommand("insertUnorderedList")}
            icon={<List className="size-3.5" />}
          />
          <ToolbarButton
            label="Numbered list"
            onClick={() => runCommand("insertOrderedList")}
            icon={<ListOrdered className="size-3.5" />}
          />
          <ToolbarButton
            label="Add link"
            onClick={addLink}
            icon={<Link2 className="size-3.5" />}
          />
        </div>
        <div
          id={id}
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          contentEditable
          suppressContentEditableWarning
          className="min-h-28 max-h-80 overflow-y-auto px-3 py-2 text-sm outline-none prose-sm [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
          onInput={emit}
          onBlur={emit}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Use the buttons above to format text. You do not need HTML.
      </p>
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      {icon}
    </Button>
  );
}
