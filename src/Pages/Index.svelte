<script lang="ts">
    import {onMount} from "svelte"
    import {Link} from "svelte-routing"
	import Noty from 'noty'

	import Products from '../Components/Products.svelte'
	import api from "../api";
	import type { User } from "../types"

	let _user:User
	
	onMount(async () => {
		await api.getUser().then( u => { _user = u })
	})

	const subtractPoints = async () =>{
		await api.getUser().then( u => { _user = u })
	}

	const addPoints = async () => {
		await api.addPoints().then( () =>{
			new Noty ({
                    theme:'sunset',
                    type:'success',
                    text: '1000 points added.',
                    timeout: 3000
                }).show()
		}).catch()
		await api.getUser().then( u => { _user = u })
	}
</script>
<header>
	<h1>
		<Link to="/">
			<svg width="39px" height="36px" viewBox="0 0 39 36" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
				<!-- Generator: Sketch 46.1 (44463) - http://www.bohemiancoding.com/sketch -->
				<title>logo</title>
				<desc>Created with Sketch.</desc>
				<defs>
					<linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-1">
						<stop stop-color="#FF8800" offset="0%"></stop>
						<stop stop-color="#FF6600" offset="100%"></stop>
					</linearGradient>
				</defs>
				<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
					<g id="Catalog" transform="translate(-16.000000, -16.000000)" fill="url(#linearGradient-1)">
						<g id="top">
							<path d="M46.868244,16.404544 C46.6405958,16.0177278 46.1363003,15.8851051 45.7421767,16.1085325 L32.2482382,23.7546496 C31.9411566,23.9287916 31.7816812,24.2764781 31.8528973,24.6175933 L36.3942582,46.3988127 C36.4161301,46.5037148 36.370779,46.6585782 36.3020649,46.734636 L35.7503076,47.3453612 C34.6032406,48.615134 33.631475,49.3030396 31.7844202,49.3030396 C29.7133694,49.3030396 28.7409951,48.2316035 27.2013263,46.3378469 C25.3624888,44.0763908 23.0744418,41.2620414 17.5113649,41.2620414 L17.3738021,41.2620414 C16.6150762,41.2620414 16,41.8657137 16,42.6103723 C16,43.3550308 16.6150762,43.9587031 17.3738021,43.9587031 L17.5113649,43.9587031 C21.7514649,43.9587031 23.3553499,45.9313165 25.0535812,48.0198254 C26.5704243,49.8855042 28.2896551,52 31.7844202,52 C34.8013676,52 36.461556,50.6226953 37.8061413,49.134573 L42.7657069,43.6456657 C42.7657069,43.645367 54.5617185,30.5894981 54.5617185,30.5894981 C54.7969752,30.3290319 54.8362354,29.9499819 54.6588037,29.6482951 L46.868244,16.404544 Z" id="logo"></path>
						</g>
					</g>
				</g>
			</svg>
		</Link>
	</h1>
	<div class="coins" on:click={addPoints}>
		<svg width="24px" height="24px" viewBox="0 0 34 34" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
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
		{#if _user}
			<p>{_user.points}</p>
		{/if}
	</div>
	<div class="user-info" href="/history">
		{#if _user}
		 {_user.name}
		<div class="link">
			<Link to="history">
				History
			</Link>
		</div>
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
		padding: 1rem 1rem;
        top: 0;
        background-color: white;
		z-index: 1;
		border-radius: 1rem;
		box-shadow: 0 3px 3px rgba(0, 0, 0, 0.3);
	}
	.coins{
		display: flex;
		justify-content: space-evenly;
		align-items: center;
		width: 8rem;
		border-radius: 8rem;
		background-color: #dfdfdf;
		font-weight: 900;
	}
	.user-info{
		display: flex;
		align-items: center;
	}
	.link{
		padding: .5rem;
		border-radius: 2rem;
		margin-left: 1rem;
		background-color: #fb7b04;
		color: #f1f1f1;
		font-weight: 700;
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