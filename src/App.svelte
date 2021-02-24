<script lang="ts">
	import {Router, Route} from 'svelte-routing'	
	import History from './Pages/History.svelte';
	import Index from './Pages/Index.svelte';
</script>

<Router>
	<Route path='/' component={Index}/>
	<Route path='/history' component={History}/>
</Router>
