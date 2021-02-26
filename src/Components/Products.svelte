<script lang="ts">
    import {onMount} from 'svelte'
    import {fly} from 'svelte/transition'
    import {flip} from 'svelte/animate'
    import api from "../Product/api";
    import Product from "./Product.svelte";
    import type {Product as Prod} from '../Product/types'
import Spinner from './Spinner.svelte';

    let products:Prod[]
    let sortedProducts:Prod[]
    
    onMount( async()=>{
        await api.getProducts().then(p => products = p)
        sortedProducts = [...products]
    })        
    
    const toggleSelect = e =>{
        let actual = document.getElementsByClassName('selected')[0]
        if(!e.classList.contains('selected')){
            actual.classList.toggle('selected')
            e.classList.toggle('selected')
        }
    }
    const orderNormal = e =>{
        toggleSelect(e)
        sortedProducts = [...products]
    }
    const orderHigher = e =>{
        toggleSelect(e)
        sortedProducts = sortedProducts.sort((a,b) => {
            if(a.cost<b.cost){return 1}
            if(a.cost>b.cost){return -1}
            return 0
        })
    }
    const orderLower = e =>{
        toggleSelect(e)
        sortedProducts = sortedProducts.sort((a,b) => {
            if(a.cost<b.cost){return -1}
            if(a.cost>b.cost){return 1}
            return 0
        })
    }

</script>
<div>
    <div class="order-by">
        <div class="order-selector selected" on:click={ e => orderNormal(e.currentTarget)}>All Products</div>
        <div class="order-selector" on:click={e => orderHigher(e.currentTarget)}>Points: Higher</div>
        <div class="order-selector" on:click={e => orderLower(e.currentTarget)}>Points: Lower</div>
    </div>
    <div class="products-container">
        {#if sortedProducts} 
            {#each sortedProducts as product(product._id) }
                <div in:fly={{y:50, duration:500}} animate:flip={{duration:1000}}>
                    <Product product={product}/>
                </div>                
            {/each}
        {:else}
            <Spinner/>
        {/if}
    </div>
</div>
<style>
    .order-by{
        display: flex;
        justify-content: flex-end;
        padding: 1rem 0;
        border-bottom: solid 1px lightgray;
        margin-bottom: 1rem;
    }
    .order-selector{
        border-radius: 2rem;
        background-color: lightgray;
        padding: 0.3rem 1rem;
        font-size: 14px;
        margin-left: .5rem;
        cursor: pointer;
    }
    .selected{
        background-color: aquamarine;
    }
    .products-container{
        display: grid;
        grid-template-columns: repeat(5, 15rem);
        grid-gap: 1rem;
    }
        @media (max-width: 768px){
            .products-container{
                grid-template-columns: repeat(3, 13rem);
                grid-gap: 1rem;
            }
        }
        @media (max-width: 600px){
            .products-container{
                grid-template-columns: repeat(1, 1fr);
                grid-gap: 1rem;
            }
        }
</style>