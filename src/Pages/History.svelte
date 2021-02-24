<script lang="ts">
	import {onMount} from "svelte"
	import {Link} from "svelte-routing"
	
	import api from "../api";
	import Logo from "../assets/logo.svg"
	import CoinLogo from "../assets/icons/coin.svg"
	import type {User,Product} from "../types"

	let _user:User
    let historyProducts:Product[]
	
	onMount(async () => {
		await api.getUser().then( u => { _user = u })
        await api.getHistory().then(h => historyProducts = h)
	 	historyProducts = historyProducts.map(p => {
			p.createDate = new Date(p.createDate).toLocaleString()
			return p
		})
	})

</script>

<header>
	<h1>
		<Link to="/">
			<Logo alt="aerolab-logo"/>
		</Link>
	</h1>
	<div class="coins">
		<CoinLogo height=28 href="/"/>
		{#if _user}
			<p>{_user.points}</p>
		{/if}
	</div>
	<div class="user-info" href="/history">
		{#if _user}
		<Link to="history">
			{_user.name}
		</Link>
		{/if}
	</div>
</header>
<main>
	<div class="section">
		<p>History</p>
	</div>
	<div class="product titles">
		<div  class="product-info" >Photo</div>
		<span class="product-info">Name</span>
		<span class="product-info">Category</span>
		<span class="product-info">Cost</span>
		<span class="product-info">Redeem Date</span>
	</div>
	{#if historyProducts}
        {#each historyProducts as product}
            <div class="product">
				<div  class="product-info" >
					<img src={product.img.url} alt={product.name}>
				</div>
				<span class="product-info">{product.name}</span>
				<span class="product-info">{product.category}</span>
				<span class="product-info">{product.cost}</span>
				<span class="product-info">{product.createDate}</span>
			</div>
        {/each}
	{/if}
</main>

<style>
	header{
		display: flex;
        position: sticky;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 0;
        top: 0;
        background-color: white;
		z-index: 1;
	}
	.coins{
		display: flex;
		justify-content: space-evenly;
		align-items: center;
		width: 8rem;
		border-radius: 8rem;
		background-color: #dfdfdf;
	}
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
	}

	.section p{
		font-size: xx-large;
		font-weight: 900;
		color: #222;
		margin: 2rem;
	}	
	.titles{
		font-weight: 700;
		margin-top: 1rem;
	}
	.product{
		width: 100%;
		height: 3rem;
		display: flex;
		justify-content: space-evenly;
		box-shadow: 0 2px 5px 0;
		margin-bottom: 10px;
	}
	.product-info{
		width: 20%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.product-info:not(:last-child){
		border-right: solid 1px #888;
	}
	.product-info > img{
		height: 100%;
		align-self: auto;
	}

	@media (max-width: 600px) {
		main {
			padding: 0 1rem;
			margin: 0;
			max-width: 100%;
		}
		header{
			padding: 1rem;
		}
	}
</style>