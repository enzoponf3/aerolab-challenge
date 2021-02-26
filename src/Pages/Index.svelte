<script lang="ts">
    import {onMount} from "svelte"

	import Products from '../Components/Products.svelte'
	import api from "../Product/api";
	import type { User } from "../Product/types"
	import Layout from "./_layout.svelte";
	import {user} from '../Product/stores'

	let _user:User
	user.subscribe( v => _user = v)

	onMount( () => {if(!_user){	api.getUser().then( u => user.set(u) ).catch()	}})

</script>
<Layout>
	<main>
		<div class="section">
			<p>Electronics</p>
		</div>
		<Products/>
	</main>
</Layout>
	
<style>		
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
	}
</style>