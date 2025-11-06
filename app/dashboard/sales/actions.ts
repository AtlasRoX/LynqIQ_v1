"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore, revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { getSales, getProducts, getCustomers, getCosts } from "@/lib/supabase/queries";

export async function addSale(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to add a sale." }
  }

  const date = formData.get("date") as string
  const customer_id = formData.get("customer_id") as string
  const product_id = formData.get("product_id") as string
  const quantity = formData.get("quantity") as string
  const status = formData.get("status") as string
  const sales_channel = formData.get("sales_channel") as string

  if (!date || !customer_id || !product_id || !quantity || !status) {
    return { error: "All required sale fields must be filled." }
  }

  const selectedProduct = await supabase.from("products").select("sell_price").eq("id", product_id).single()
  if (selectedProduct.error || !selectedProduct.data) {
    return { error: "Product not found." }
  }
  const unit_price = selectedProduct.data.sell_price
  const total_amount = parseInt(quantity) * unit_price

  const { error: insertError } = await supabase.from("sales").insert({
    user_id: user.id,
    date,
    customer_id,
    product_id,
    quantity: parseInt(quantity),
    unit_price,
    total_amount,
    status,
    sales_channel: sales_channel || null,
  })

  if (insertError) {
    return { error: "Failed to add sale." }
  }

  // Update customer stats if status is completed
  if (status === "completed") {
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("total_orders, total_spent, last_order_date")
      .eq("id", customer_id)
      .single()

    if (customerError || !customer) {
      console.error("Failed to fetch customer for update:", customerError?.message)
      // Continue without updating customer if fetch fails, but log the error
    } else {
      await supabase
        .from("customers")
        .update({
          total_orders: customer.total_orders + 1,
          total_spent: customer.total_spent + total_amount,
          last_order_date: date,
        })
        .eq("id", customer_id)
    }
  }

  revalidatePath("/dashboard/sales")
  return { success: "Sale added successfully." }
}

export async function updateSale(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to update a sale." }
  }

  const id = formData.get("id") as string
  const date = formData.get("date") as string
  const customer_id = formData.get("customer_id") as string
  const product_id = formData.get("product_id") as string
  const quantity = formData.get("quantity") as string
  const status = formData.get("status") as string
  const sales_channel = formData.get("sales_channel") as string

  if (!id) {
    return { error: "Sale ID is required." }
  }
  if (!date || !customer_id || !product_id || !quantity || !status) {
    return { error: "All required sale fields must be filled." }
  }

  const selectedProduct = await supabase.from("products").select("sell_price").eq("id", product_id).single()
  if (selectedProduct.error || !selectedProduct.data) {
    return { error: "Product not found." }
  }
  const unit_price = selectedProduct.data.sell_price
  const total_amount = parseInt(quantity) * unit_price

  const { error: updateError } = await supabase.from("sales").update({
    date,
    customer_id,
    product_id,
    quantity: parseInt(quantity),
    unit_price,
    total_amount,
    status,
    sales_channel: sales_channel || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id)

  if (updateError) {
    return { error: "Failed to update sale." }
  }

  revalidatePath("/dashboard/sales")
  return { success: "Sale updated successfully." }
}

export async function deleteSale(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to delete a sale." }
  }

  const id = formData.get("id") as string

  if (!id) {
    return { error: "Sale ID is required." }
  }

  const { error } = await supabase.from("sales").delete().eq("id", id)

  if (error) {
    return { error: "Failed to delete sale." }
  }

  revalidatePath("/dashboard/sales")
  return { success: "Sale deleted successfully." }
}
