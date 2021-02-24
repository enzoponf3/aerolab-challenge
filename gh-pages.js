var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://https://github.com/enzoponf3/aerolab-challenge', // Update to point to your repository  
        user: {
            name: 'enzoponf3', // update to use your name
            email: 'enzoponf3@gmail.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)