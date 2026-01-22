import { NextResponse } from 'next/server'

/**
 * Validates request body against a Zod schema
 * @param {Request} request 
 * @param {import('zod').ZodSchema} schema 
 * @returns {Promise<{success: true, data: any} | {success: false, response: NextResponse}>}
 */
export async function validateBody(request, schema) {
  // Step 1: Parse JSON body
  let body
  try {
    body = await request.json()
  } catch (e) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }
  }

  // Step 2: Validate with Zod
  const result = schema.safeParse(body)
  
  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        { 
          error: 'Validasi gagal', 
          details: result.error.issues.map(err => ({
            field: err.path.join('.') || 'root',
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
  }
  
  return { success: true, data: result.data }
}

/**
 * Validates search params against a Zod schema
 * @param {Request} request 
 * @param {import('zod').ZodSchema} schema 
 * @returns {{success: true, data: any} | {success: false, response: NextResponse}}
 */
export function validateQuery(request, schema) {
  const url = new URL(request.url)
  const queryParams = Object.fromEntries(url.searchParams.entries())
  
  const result = schema.safeParse(queryParams)
  
  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        { 
          error: 'Validasi query param gagal', 
          details: result.error.issues.map(err => ({
            field: err.path.join('.') || 'root',
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
  }

  return { success: true, data: result.data }
}
