<script lang="ts">
    import {createEventDispatcher} from 'svelte'
    import type {Product} from "../types"
    import Noty from 'noty'

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
        <div class="cost-badge">{product.cost} points
            <svg width="16px" height="16px" viewBox="0 0 34 34" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
			<!-- Generator: Sketch 46.1 (44463) - http://www.bohemiancoding.com/sketch -->
			<title>money</title>
			<desc>Created with Sketch.</desc>
			<defs>
				<filter x="-9.1%" y="-9.1%" width="128.3%" height="128.3%" filterUnits="objectBoundingBox" id="filter-1">
					<feOffset dx="2" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
					<feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
					<feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.1 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
					<feMerge>
						<feMergeNode in="shadowMatrixOuter1"></feMergeNode>
						<feMergeNode in="SourceGraphic"></feMergeNode>
					</feMerge>
				</filter>
				<radialGradient cx="50%" cy="50%" fx="50%" fy="50%" r="68.6284858%" id="radialGradient-2">
					<stop stop-color="#FFCF00" offset="0%"></stop>
					<stop stop-color="#F7AE15" offset="100%"></stop>
				</radialGradient>
			</defs>
			<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
				<g id="Catalog-pg1" transform="translate(-609.000000, -731.000000)">
					<g id="products" transform="translate(132.000000, 622.000000)">
						<g id="line-1">
							<g id="product-card-hover" filter="url(#filter-1)" transform="translate(300.000000, 0.000000)">
								<g id="money" transform="translate(71.000000, 100.000000)">
									<g transform="translate(108.000000, 11.000000)">
										<g>
											<circle id="Oval-Copy-3" fill="url(#radialGradient-2)" cx="13" cy="13" r="13"></circle>
											<path d="M13,3.0952381 C7.54580357,3.0952381 3.0952381,7.54657738 3.0952381,13 C3.0952381,18.4541964 7.54657738,22.9047619 13,22.9047619 C18.4541964,22.9047619 22.9047619,18.4534226 22.9047619,13 C22.9047619,7.54580357 18.4534226,3.0952381 13,3.0952381 Z M13,21.7440476 C8.17850893,21.7440476 4.25595238,17.8214911 4.25595238,13 C4.25595238,8.17850893 8.17850893,4.25595238 13,4.25595238 C17.8214911,4.25595238 21.7440476,8.17850893 21.7440476,13 C21.7440476,17.8214911 17.8214911,21.7440476 13,21.7440476 Z" id="Shape" fill="#F8B013" fill-rule="nonzero"></path>
											<path d="M13,5.2962963 C8.76834769,5.2962963 5.2962963,8.76956614 5.2962963,13 C5.2962963,17.2316523 8.76956614,20.7037037 13,20.7037037 C17.2316523,20.7037037 20.7037037,17.2304339 20.7037037,13 C20.7037037,8.76834769 17.2304339,5.2962963 13,5.2962963 Z M13,19.5245654 C9.40233107,19.5245654 6.47543462,16.5976689 6.47543462,13 C6.47543462,9.40233107 9.40233107,6.47543462 13,6.47543462 C16.5976689,6.47543462 19.5245654,9.40233107 19.5245654,13 C19.5245654,16.5976689 16.5976689,19.5245654 13,19.5245654 Z" id="Shape" fill="#F8B013" fill-rule="nonzero"></path>
										</g>
									</g>
								</g>
							</g>
						</g>
					</g>
				</g>
			</g>
		    </svg>
        </div>
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
        padding: .5rem;
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
            transform: translateX(-1.2rem);
        }
    }
    @media (max-width: 768px){
        img{
            transform: translateX(-1.2rem);
        }
    }
</style>