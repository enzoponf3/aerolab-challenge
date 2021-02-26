import {writable} from 'svelte/store'
import type { Product, User } from './types'

export const user = writable<User>(null)
export const products = writable<Product[]>(null)
