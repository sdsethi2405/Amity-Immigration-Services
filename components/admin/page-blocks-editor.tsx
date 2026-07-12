"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createEmptyBlock,
  EDITABLE_BLOCK_TYPES,
  type ContentBlockInput,
  type EditableBlockType,
} from "@/lib/schemas/content-blocks";
import { cn } from "@/lib/utils";

type BlockRow = {
  clientId: string;
  block: ContentBlockInput;
};

type PageBlocksEditorProps = {
  initialBlocks: ContentBlockInput[];
  onChange: (blocks: ContentBlockInput[]) => void;
};

function isEditableType(type: string): type is EditableBlockType {
  return (EDITABLE_BLOCK_TYPES as readonly string[]).includes(type);
}

function createClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `block-${Math.random().toString(36).slice(2)}`;
}

function toRows(blocks: ContentBlockInput[]): BlockRow[] {
  return blocks.map((block) => ({
    clientId: createClientId(),
    block,
  }));
}

function stringField(
  block: ContentBlockInput,
  key: string,
): string | undefined {
  const value = block[key];
  return typeof value === "string" ? value : undefined;
}

type SortableBlockCardProps = {
  row: BlockRow;
  reduceMotion: boolean | null;
  onUpdate: (clientId: string, block: ContentBlockInput) => void;
  onRemove: (clientId: string) => void;
};

function SortableBlockCard({
  row,
  reduceMotion,
  onUpdate,
  onRemove,
}: SortableBlockCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.clientId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition:
      transition ??
      "transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1)",
    zIndex: isDragging ? 10 : undefined,
  };

  const { block } = row;
  const type = String(block.type);

  function patch(partial: Record<string, unknown>) {
    onUpdate(row.clientId, { ...block, ...partial, type: block.type });
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={
        reduceMotion
          ? undefined
          : { opacity: 0, height: 0, transition: { duration: 0.2 } }
      }
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-background",
        isDragging && "shadow-md ring-1 ring-primary/30",
      )}
    >
      <div className="flex items-start gap-2 p-3">
        <button
          type="button"
          className="mt-1 touch-none rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {type}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove block"
              onClick={() => onRemove(row.clientId)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>

          {isEditableType(type) ? (
            <EditableBlockFields block={block} onPatch={patch} />
          ) : (
            <TemplateBlockFields block={block} onPatch={patch} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EditableBlockFields({
  block,
  onPatch,
}: {
  block: ContentBlockInput;
  onPatch: (partial: Record<string, unknown>) => void;
}) {
  const type = block.type as EditableBlockType;

  switch (type) {
    case "heading":
      return (
        <div className="grid gap-3 sm:grid-cols-[7rem_1fr]">
          <div className="space-y-2">
            <Label>Level</Label>
            <select
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={Number(block.level ?? 2)}
              onChange={(event) =>
                onPatch({ level: Number(event.target.value) as 2 | 3 })
              }
            >
              <option value={2}>H2</option>
              <option value={3}>H3</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Text</Label>
            <Input
              value={stringField(block, "text") ?? ""}
              onChange={(event) => onPatch({ text: event.target.value })}
            />
          </div>
        </div>
      );
    case "richtext":
      return (
        <div className="space-y-2">
          <Label>HTML</Label>
          <Textarea
            rows={5}
            value={stringField(block, "html") ?? ""}
            onChange={(event) => onPatch({ html: event.target.value })}
          />
        </div>
      );
    case "image":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Image URL</Label>
            <Input
              value={stringField(block, "src") ?? ""}
              onChange={(event) => onPatch({ src: event.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Alt text</Label>
            <Input
              value={stringField(block, "alt") ?? ""}
              onChange={(event) => onPatch({ alt: event.target.value })}
            />
          </div>
        </div>
      );
    case "cta":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={stringField(block, "label") ?? ""}
              onChange={(event) => onPatch({ label: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Href</Label>
            <Input
              value={stringField(block, "href") ?? ""}
              onChange={(event) => onPatch({ href: event.target.value })}
            />
          </div>
        </div>
      );
    case "callout":
      return (
        <div className="grid gap-3">
          <div className="space-y-2">
            <Label>Text</Label>
            <Textarea
              rows={3}
              value={stringField(block, "text") ?? ""}
              onChange={(event) => onPatch({ text: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Variant (optional)</Label>
            <Input
              value={stringField(block, "variant") ?? ""}
              onChange={(event) => onPatch({ variant: event.target.value })}
            />
          </div>
        </div>
      );
    default:
      return null;
  }
}

const SIMPLE_KEYS = [
  "title",
  "body",
  "headline",
  "subhead",
  "text",
  "html",
] as const;

function TemplateBlockFields({
  block,
  onPatch,
}: {
  block: ContentBlockInput;
  onPatch: (partial: Record<string, unknown>) => void;
}) {
  const simpleKeys = SIMPLE_KEYS.filter((key) => key in block);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonValue, setJsonValue] = useState(() =>
    JSON.stringify(block, null, 2),
  );

  useEffect(() => {
    setJsonValue(JSON.stringify(block, null, 2));
    setJsonError(null);
  }, [block]);

  if (simpleKeys.length > 0) {
    return (
      <div className="grid gap-3">
        {simpleKeys.map((key) => {
          const value = block[key];
          const isLong =
            typeof value === "string" &&
            (value.length > 120 || value.includes("\n") || key === "html" || key === "body");

          return (
            <div key={key} className="space-y-2">
              <Label className="capitalize">{key}</Label>
              {isLong ? (
                <Textarea
                  rows={4}
                  value={typeof value === "string" ? value : String(value ?? "")}
                  onChange={(event) => onPatch({ [key]: event.target.value })}
                />
              ) : (
                <Input
                  value={typeof value === "string" ? value : String(value ?? "")}
                  onChange={(event) => onPatch({ [key]: event.target.value })}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Block JSON</Label>
      <Textarea
        rows={8}
        className="font-mono text-xs"
        value={jsonValue}
        onChange={(event) => {
          const next = event.target.value;
          setJsonValue(next);
          try {
            const parsed = JSON.parse(next) as ContentBlockInput;
            if (
              typeof parsed !== "object" ||
              parsed === null ||
              Array.isArray(parsed)
            ) {
              setJsonError("JSON must be an object");
              return;
            }
            onPatch({
              ...parsed,
              type: block.type,
            });
            setJsonError(null);
          } catch {
            setJsonError("Invalid JSON");
          }
        }}
      />
      {jsonError ? (
        <p className="text-sm text-destructive">{jsonError}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Type is locked. Other fields can be edited as JSON.
        </p>
      )}
    </div>
  );
}

export function PageBlocksEditor({
  initialBlocks,
  onChange,
}: PageBlocksEditorProps) {
  const reduceMotion = useReducedMotion();
  const [rows, setRows] = useState<BlockRow[]>(() => toRows(initialBlocks));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = useMemo(() => rows.map((row) => row.clientId), [rows]);

  function emit(nextRows: BlockRow[]) {
    setRows(nextRows);
    onChange(nextRows.map((row) => row.block));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = rows.findIndex((row) => row.clientId === active.id);
    const newIndex = rows.findIndex((row) => row.clientId === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    emit(arrayMove(rows, oldIndex, newIndex));
  }

  function addBlock(type: EditableBlockType) {
    emit([
      ...rows,
      { clientId: createClientId(), block: createEmptyBlock(type) },
    ]);
  }

  function updateBlock(clientId: string, block: ContentBlockInput) {
    emit(
      rows.map((row) =>
        row.clientId === clientId ? { ...row, block } : row,
      ),
    );
  }

  function removeBlock(clientId: string) {
    emit(rows.filter((row) => row.clientId !== clientId));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-base">Content blocks</Label>
        <div className="flex flex-wrap gap-1.5">
          {EDITABLE_BLOCK_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock(type)}
            >
              <Plus className="size-3.5" aria-hidden />
              {type}
            </Button>
          ))}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {rows.map((row) => (
                <SortableBlockCard
                  key={row.clientId}
                  row={row}
                  reduceMotion={reduceMotion}
                  onUpdate={updateBlock}
                  onRemove={removeBlock}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No blocks yet. Add a heading, rich text, image, CTA, or callout.
        </p>
      ) : null}
    </div>
  );
}
