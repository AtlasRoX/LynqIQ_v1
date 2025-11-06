"use client"

import { useStableId } from "@/hooks/use-stable-id";

export function AddSaleDialog({ products, customers }: AddSaleDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const id = useStableId();

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const totalAmount = selectedProduct ? selectedProduct.sell_price * parseInt(quantity || "1") : 0;

  const resetForm = () => {
    const form = document.getElementById("add-sale-form") as HTMLFormElement;
    if (form) {
      form.reset();
    }
    setSelectedProductId("");
    setQuantity("1");
  };

  const handleSubmit = async (formData: FormData) => {
    setError("");
    const result = await addSale(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" id={id}>
          <Plus className="h-4 w-4" />
          Add Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Sale</DialogTitle>
          <DialogDescription>
            Record a new sale transaction.
          </DialogDescription>
        </DialogHeader>
        <form id="add-sale-form" action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer">Customer *</Label>
            <Select
              name="customer_id"
              onValueChange={(value) => {}}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product">Product *</Label>
            <Select
              name="product_id"
              onValueChange={(value) => setSelectedProductId(value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - ${product.sell_price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Total Amount</Label>
              <Input
                value={formatCurrency(totalAmount, "BDT")}
                disabled
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                name="status"
                defaultValue="completed"
                onValueChange={(value) => {}}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel">Sales Channel</Label>
              <Input
                id="channel"
                name="sales_channel"
                placeholder="online, retail, etc."
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
