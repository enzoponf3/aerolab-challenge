<script lang="ts">
    import {createEventDispatcher} from 'svelte'
    import type {Product} from "../types"
    import Noty from 'noty'

    import Coin from '../assets/icons/coin.svg'
    import api from "../api";
    export let product:Product
    export let avaiablePoints:number
    const dispatch = createEventDispatcher()

    const redeem = async productId =>{
       await api.redeemProduct(productId).then(m => {
           new Noty ({
                    theme:'sunset',
                    type:'success',
                    text: m.message,
                    timeout: 3000
                }).show()
       }).catch()
       dispatch('message')
    }

</script>
{#if product}
    <div class="card">
        <img src={product.img.url} alt={product.name}>
        <div class="cost-badge">{product.cost} points<Coin height=12/></div>
        <div class="product-information">
            <div class="category">{product.category}</div>
            <div class="redeem">
                <div>{product.name}</div>
                {#if avaiablePoints < product.cost}
                    <div class="button-container">
                        <span class="danger">You need {product.cost - avaiablePoints} points.</span>
                        <div class="redeem-button">
                           <span class="button">
                            Redeem
                           </span>
                        </div>
                    </div>
                    {:else}
                    <div class="button-container">
                        <div class="redeem-button">
                            <span class="button enabled" on:click={() => redeem(product._id)}>
                                Redeem
                            </span>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
    {:else}
    <p>Loading</p>
{/if}
<style>
    .card{
        position: relative;
        box-shadow: 0 0 5px 0;
        height: 19rem;
        overflow: hidden;
    }
    .card:hover img{
        filter: brightness(0.5);
        
    }
    .card:hover  .product-information{
        transform: translateY(-4rem);
    }
    img{
        transition: all 1s ease;
    }
    .cost-badge{
        position: absolute;
        top: 0;
        left: 0;
        padding: .5rem 0 .5rem 1rem;
        margin: .5rem;
        border-radius: .5rem;
        background-color: rgba(0,0,0,.5);
        color: whitesmoke;
        font-size: 12px;
        display: flex;
        align-items: flex-end;
    }
    .product-information{
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        transition: transform 1s ease;
    }
    .category{
        padding: .5rem .5rem;
        background-color: aquamarine;
        font-weight: 900;
    }
    .danger{
        color: #f23232;
        margin-bottom: 1rem;
    }
    .redeem{
        width: 100%;
        border-top: aquamarine solid 2px;
        font-weight: 700;
        padding-top: 1rem;
        background-color: white;
    }
    .button-container{
        height: 5rem;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        margin-top: 1rem;
    }
    .redeem-button{
        margin: 1rem 0;
    }
    .button{
        background-color: darkgrey;
        padding: .5rem 1rem;
        border-radius: .5rem;
        width: fit-content;
        cursor: not-allowed;
        margin-top: 2rem;
    }
    .enabled{
        cursor: pointer;
        background-color: aquamarine;
    }
    @media (max-width: 600px){
        .card{
            height: 100%;
            pointer-events: none;
        }
        img{
            height: 8rem;
        }
    }
</style>