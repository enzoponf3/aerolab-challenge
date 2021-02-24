<script lang="ts">
    import {onMount} from "svelte"
    import {Link} from "svelte-routing"

	import Products from '../Components/Products.svelte'
	import api from "../api";
	import Logo from "../assets/Logo.svg"
	import CoinLogo from "../assets/icons/Coin.svg"
	import type { User } from "../types"

	let _user:User
	
	onMount(async () => {
		await api.getUser().then( u => { _user = u })
	})

	const subtractPoints = async () =>{
		await api.getUser().then( u => { _user = u })
	}
</script>
<header>
	<h1>
        <Link to="/">
            <Logo alt="aerolab-logo" />
        </Link>
	</h1>
	<div class="coins">
		<CoinLogo height=28/>
		{#if _user}
		<p>{_user.points}</p>
		{/if}
	</div>
	<div class="link user-info">
		{#if _user}
        <Link to="history">
            {_user.name}
        </Link>
		{/if}
	</div>
</header>
<main>
	<div class="section">
		<p>Electronics</p>
	</div>
	{#if _user}
		<Products on:message={subtractPoints} avaiablePoints={_user.points}/>		
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
		margin: 0 auto;
	}
	.section{
		background-image: url("/header.png");
		height: 20vh;
		background-size: cover;
		display: flex;
		align-items: center;
	}

	.section p{
		font-size: xx-large;
		font-weight: 900;
		color: whitesmoke;
		margin: 2rem;
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