export interface User {
    "id": string,
    "name": string,
    "points": number,
    "redeemHistory": Array<Reedem>,
    "createDate": string
}

export interface Reedem{
    "productId": string,
    "_id": string,
    "createDate": string
}

export interface Product{
    "_id": string,
    "name": string,
    "cost": number,
    "category": string,
    "createDate": string,
    "img": {
      "url": string,
      "hdUrl": string
    }
}