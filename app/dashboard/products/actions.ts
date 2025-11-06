"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore, revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { getProducts, getSales, getCosts, getCustomers } from "@/lib/supabase/queries";

export async function addProduct(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to add a product." }
  }

  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const cost_price = formData.get("cost_price") as string
  const sell_price = formData.get("sell_price") as string

  if (!name || !category || !cost_price || !sell_price) {
    return { error: "All required product fields must be filled." }
  }

  const { error } = await supabase.from("products").insert({
    user_id: user.id,
    name,
    category,
    cost_price: parseFloat(cost_price),
    sell_price: parseFloat(sell_price),
  })

  revalidatePath("/dashboard/products")
  return { success: "Product added successfully." }
}

export async function updateProduct(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to update a product." }
  }

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const cost_price = formData.get("cost_price") as string
  const sell_price = formData.get("sell_price") as string

  if (!id) {
    return { error: "Product ID is required." }
  }
  if (!name || !category || !cost_price || !sell_price) {
    return { error: "All required product fields must be filled." }
  }

  const { error } = await supabase.from("products").update({
    name,
    category,
    cost_price: parseFloat(cost_price),
    sell_price: parseFloat(sell_price),
    updated_at: new Date().toISOString(),
  }).eq("id", id)

  if (error) {
    return { error: "Failed to update product." }
  }

  revalidatePath("/dashboard/products")
  return { success: "Product updated successfully." }
}

export async function deleteProduct(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to delete a product." }
  }

  const id = formData.get("id") as string

  if (!id) {
    return { error: "Product ID is required." }
  }

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    return { error: "Failed to delete product." }
  }

  revalidatePath("/dashboard/products")
  return { success: "Product deleted successfully." }
}
