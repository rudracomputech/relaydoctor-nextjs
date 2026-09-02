"use client"

import { useState, useTransition } from "react"
import { type Table } from "@tanstack/react-table"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { sleep } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useRouter } from "next/navigation"
import { deleteEntities } from "@/services/common"

type TaskMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  entity: string
}

const CONFIRM_WORD = "DELETE"

export function TasksMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  entity,
}: TaskMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState("")
  const [isPending, startTransition] = useTransition()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const idsToDelete = selectedRows.map((row: any) => row.original.id)
  const router = useRouter()

 

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }
    startTransition(async () => {
      const result = await deleteEntities(entity, idsToDelete)

      toast.promise(sleep(2000), {
        loading: "Deleting from database...",
        success: () => {
          table.resetRowSelection()

          onOpenChange(false) // Close dialog
          setValue("") // Clear "DELETE" input
          router.refresh()
          return `Deleted ${selectedRows.length} ${
            selectedRows.length > 1 ? "tasks" : "task"
          }`
        },
        error: "Error",
      })
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="me-1 inline-block stroke-destructive"
            size={18}
          />{" "}
          Delete {selectedRows.length}{" "}
          {selectedRows.length > 1 ? "tasks" : "task"}
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete the selected tasks? <br />
            This action cannot be undone.
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span className="">Confirm by typing "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText="Delete"
      destructive
    />
  )
}
