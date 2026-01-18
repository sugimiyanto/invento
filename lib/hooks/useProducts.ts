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

      if (error) {
        console.warn('Error fetching products:', error.message)
        setProducts([])
        setError(null) // Jangan set error, biarkan app berjalan normal
      } else {
        setProducts(data || [])
        setError(null)
      }
    } catch (err: any) {
      // Ignore abort errors from HMR
      if (err?.name === 'AbortError') {
        console.log('Products fetch aborted (likely HMR)')
      } else {
        console.warn('Error fetching products:', err)
      }
      setProducts([])
      setError(null) // Jangan set error, biarkan app berjalan normal
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

export async function importProducts(
  productsData: Partial<Product>[],
  strategy: 'skip' | 'replace' = 'skip'
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let data, error;

  const dataWithUser = productsData.map((p) => ({ ...p, created_by: user?.id }))

  if (strategy === 'replace') {
    // Use upsert to replace duplicates
    // Split into separate operations to avoid "ON CONFLICT DO UPDATE command cannot affect row a second time" error
    const results = []
    for (const item of dataWithUser) {
      const { data: result, error: err } = await supabase
        .from('products')
        .upsert([item], { onConflict: 'kode_barang_baru' })
        .select()

      if (err) {
        console.error('Error upserting product:', err)
        throw err
      }
      if (result) {
        results.push(...result)
      }
    }
    data = results
  } else {
    // Use insert to skip duplicates (already filtered on client)
    ({ data, error } = await supabase
      .from('products')
      .insert(dataWithUser)
      .select())
  }

  if (error) throw error

  if (data && user) {
    await createAuditLog({
      user_id: user.id,
      action: 'import',
      table_name: 'products',
      record_id: null,
      changes: { count: data.length, strategy }
    })
  }

  return data
}
