import type {User, Product} from './types'
const BASE_URL = 'https://coding-challenge-api.aerolab.co/'
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDM0NTQ5YzdlNzE4NzAwMjBlMzhmMTIiLCJpYXQiOjE2MTQwNDIyNjh9.l1973GUNztJ4EEjyWIgFjqKfOmmQforpiQ9kBtBI4BA"
const HEADER = {            
    'Content-Type':'application/json',
    'Accept':'application/json',
    'Authorization':'Bearer '+ TOKEN

}

export default {
    getUser: () => fetch(BASE_URL+"user/me",{
        method: 'get',
        headers:HEADER
    }).then(res => res.json()),
    getProducts:():Promise<Product[]> => fetch(BASE_URL + "products",{
        method: 'get',
        headers: HEADER
    }).then(res => res.json()),
    redeemProduct:(productId:string) => fetch(BASE_URL+"redeem",{
        body:JSON.stringify({productId:productId}),
        method:'post',
        headers:HEADER
    }).then(res => res.json()),
    getHistory: () : Promise<Product[]> => fetch(BASE_URL+'user/history',{
        method:'get',
        headers:HEADER
    }).then(res => res.json()),
    addPoints: () => fetch(BASE_URL+'user/points',{
        body:JSON.stringify({amount:1000}),
        method:'post',
        headers:HEADER
    }).then(res => res.json())
}