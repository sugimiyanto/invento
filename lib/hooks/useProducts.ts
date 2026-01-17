import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types/product'
import { createAuditLog } from './useAuditLogs'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setProducts(data || [])
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching products:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProducts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { products, isLoading, error, refetch: fetchProducts }
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        setProduct(data)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching product:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  return { product, isLoading, error }
}

export async function createProduct(productData: Partial<Product>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('products')
    .insert({ ...productData, created_by: user?.id })
    .select()
    .single()

  if (error) throw error

  if (data && user) {
    await createAuditLog({
      user_id: user.id,
      action: 'create',
      table_name: 'products',
      record_id: data.id,
      changes: data
    })
  }

  return data
}

export async function updateProduct(id: string, productData: Partial<Product>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  if (data && user) {
    await createAuditLog({
      user_id: user.id,
      action: 'update',
      table_name: 'products',
      record_id: id,
      changes: productData
    })
  }

  return data
}

export async function deleteProduct(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error

  if (user) {
    await createAuditLog({
      user_id: user.id,
      action: 'delete',
      table_name: 'products',
      record_id: id,
      changes: { id }
    })
  }

  return true
}

export async function importProducts(productsData: Partial<Product>[]) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('products')
    .insert(
      productsData.map((p) => ({ ...p, created_by: user?.id }))
    )
    .select()

  if (error) throw error

  if (data && user) {
    await createAuditLog({
      user_id: user.id,
      action: 'import',
      table_name: 'products',
      record_id: 'bulk',
      changes: { count: data.length }
    })
  }

  return data
}
