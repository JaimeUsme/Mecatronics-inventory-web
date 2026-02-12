import type { OrderResponse } from '../types'

/**
 * Determina si una orden está programada
 * Está programada cuando:
 * - programated_at NO es null, O
 * - (start_at NO es null Y end_at NO es null) como alternativa
 * Y state todavía no es "closed"
 */
export function isOrderScheduled(order: OrderResponse): boolean {
  if (order.state === 'closed') {
    return false
  }
  
  // Si tiene programated_at y no es null, está programada
  if (order.programated_at !== null && order.programated_at !== undefined) {
    return true
  }
  
  // Si no tiene programated_at, verificar start_at y end_at como alternativa
  if (order.start_at !== null && order.start_at !== undefined && 
      order.end_at !== null && order.end_at !== undefined) {
    return true
  }
  
  return false
}

/**
 * Determina si una orden NO está programada
 * No está programada cuando:
 * - programated_at es null/undefined, Y
 * - (start_at es null/undefined O end_at es null/undefined)
 */
export function isOrderUnscheduled(order: OrderResponse): boolean {
  // Si tiene programated_at y no es null, está programada (no es no programada)
  if (order.programated_at !== null && order.programated_at !== undefined) {
    return false
  }
  
  // Si tiene start_at y end_at, está programada (no es no programada)
  if (order.start_at !== null && order.start_at !== undefined && 
      order.end_at !== null && order.end_at !== undefined) {
    return false
  }
  
  // Si no tiene programated_at y tampoco tiene start_at/end_at, no está programada
  return true
}

/**
 * Determina si una orden fue exitosa
 * Es exitosa cuando state = "closed" y result = "success"
 */
export function isOrderSuccess(order: OrderResponse): boolean {
  return order.state === 'closed' && order.result === 'success'
}

/**
 * Determina si una orden falló
 * Es fallida cuando state = "closed" y result = "failure"
 */
export function isOrderFailure(order: OrderResponse): boolean {
  return order.state === 'closed' && order.result === 'failure'
}

/**
 * Obtiene la etiqueta de estado de la orden según las reglas de negocio
 */
export function getOrderStatusLabel(order: OrderResponse): 'programada' | 'no_programada' | 'exitosa' | 'fallida' | 'otra' {
  if (isOrderSuccess(order)) {
    return 'exitosa'
  }
  if (isOrderFailure(order)) {
    return 'fallida'
  }
  if (isOrderScheduled(order)) {
    return 'programada'
  }
  if (isOrderUnscheduled(order)) {
    return 'no_programada'
  }
  return 'otra'
}

