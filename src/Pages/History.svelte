<script lang="ts">
	import {onMount} from "svelte"
	
	import api from "../Product/api";
	import type {User,Product} from "../Product/types"
	import Layout from "./_layout.svelte";
	import {user,products} from '../Product/stores'

	let _user:User
    let historyProducts:Product[]
	user.subscribe( u => _user = u)
	
	onMount(async () => {
		if(!_user){api.getUser().then(u => user.set(u)).catch()}
		if(!historyProducts){ await api.getProducts().then( p => products.set(p) ).catch() }
		products.subscribe( p => historyProducts = p)
	 	historyProducts = historyProducts.map(p => {
			p.createDate = new Date(p.createDate).toLocaleString()
			return p
		})
	})

</script>

<Layout>
	<main>
		<div class="section">
			<p>History</p>
		</div>
		<div class="product titles">
			<span class="product-info">Name</span>
			<span class="product-info">Category</span>
			<span class="product-info">Cost</span>
			<span class="product-info">Redeem Date</span>
		</div>
		{#if historyProducts}
			{#each historyProducts as product}
			<div class="product">
				<span class="product-info">{product.name}</span>
				<span class="product-info">{product.category}</span>
				<span class="product-info">{product.cost}</span>
				<span class="product-info">{product.createDate}</span>
			</div>
			{/each}
		{/if}
	</main>
</Layout>
	
<style>
	main {
		text-align: center;
		padding: 1em;
	}
	.section{
		background-color:#ffee58;
		height: 20vh;
		background-size: cover;
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
	}

	.section p{
		font-size: xx-large;
		font-weight: 900;
		color: #222;
		margin: 2rem;
	}	
	.titles{
		font-weight: 700;
		box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.3);
	}
	.product{
		margin: auto;
		width: 80%;
		height: 3rem;
		display: flex;
		justify-content: space-evenly;
		border-bottom: solid 1px #888;
		border-left: solid 1px #888;
		border-right: solid 1px #888;
	}
	.product-info{
		width: 25%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.product-info:not(:last-child){
		border-right: solid 1px #888;
	}
	@media (max-width: 600px) {
		main {
			padding: 0 1rem;
			margin: 0;
			max-width: 100%;
		}
	}
</style>