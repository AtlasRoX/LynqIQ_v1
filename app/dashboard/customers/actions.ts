"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore, revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { getCustomers, getSales, getCosts, getProducts } from "@/lib/supabase/queries";

export async function addCustomer(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to add a customer." }
  }

  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const age = formData.get("age") as string
  const location = formData.get("location") as string

  if (!name) {
    return { error: "Customer name is required." }
  }

  const { error } = await supabase.from("customers").insert({
    user_id: user.id,
    name,
    phone: phone || null,
    address: address || null,
    age: age ? parseInt(age) : null,
    location: location || null,
    total_orders: 0,
    total_spent: 0,
    canceled_orders: 0,
  })

  if (error) {
    return { error: "Failed to add customer." }
  }

  revalidatePath("/dashboard/customers")
  return { success: "Customer added successfully." }
}

export async function updateCustomer(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to update a customer." }
  }

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const age = formData.get("age") as string
  const location = formData.get("location") as string

  if (!id) {
    return { error: "Customer ID is required." }
  }
  if (!name) {
    return { error: "Customer name is required." }
  }

  const { error } = await supabase.from("customers").update({
    name,
    phone: phone || null,
    address: address || null,
    age: age ? parseInt(age) : null,
    location: location || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id)

  if (error) {
    return { error: "Failed to update customer." }
  }

  revalidatePath("/dashboard/customers")
  return { success: "Customer updated successfully." }
}

export async function deleteCustomer(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to delete a customer." }
  }

  const id = formData.get("id") as string

  if (!id) {
    return { error: "Customer ID is required." }
  }

  const { error } = await supabase.from("customers").delete().eq("id", id)

  if (error) {
    return { error: "Failed to delete customer." }
  }

  revalidatePath("/dashboard/customers")
  return { success: "Customer deleted successfully." }
}
