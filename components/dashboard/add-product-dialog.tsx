"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addProduct } from "../../app/dashboard/products/actions"
import { useFormStatus } from "react-dom"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : (
        "Add Product"
      )}
    </Button>
  )
}

export function AddProductDialog() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")

  const resetForm = () => {
    const form = document.getElementById("add-product-form") as HTMLFormElement;
    if (form) {
      form.reset();
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setError("")
    const result = await addProduct(formData)
    if (result.error) {
      setError(result.error)
    } else {
      setOpen(false)
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Enter the product details below to add it to your inventory.
          </DialogDescription>
        </DialogHeader>
        <form id="add-product-form" action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="e.g., Laptop"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              name="category"
              required
              placeholder="e.g., Electronics"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost Price *</Label>
              <Input
                id="cost_price"
                name="cost_price"
                type="number"
                step="0.01"
                required
                placeholder="800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sell_price">Sell Price *</Label>
              <Input
                id="sell_price"
                name="sell_price"
                type="number"
                step="0.01"
                required
                placeholder="1200"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
