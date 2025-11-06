import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Customer } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function TopCustomersList({ customers }: { customers: Customer[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Customers</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {customers.map((customer) => (
          <div key={customer.id} className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`} alt="Avatar" />
              <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">{customer.name}</p>
              <p className="text-sm text-muted-foreground">
                {customer.total_orders} orders • {formatCurrency(customer.total_spent, "BDT")}
              </p>
            </div>
            <div className="ml-auto font-medium">{formatCurrency(customer.total_spent, "BDT")}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
