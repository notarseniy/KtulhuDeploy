KtulhuDeploy
---

Simple deployment server for handling Git WebHooks.

# Install
1. Clone repository from GitHub:
`git clone git@github.com:Kern0/KtulhuDeploy.git`
2. Install modules
`npm install`

# Usage
1. Start the server:
`node kdeploy.js`
2. Configure the server in `config.js`:
```JavaScript
module.exports = {
	port: process.env.PORT || 80, // KtulhuDeploy port
	
	applications: {
		'42gc': {
			repo_name: '42GC', // Repository name. Capitalized or not - nobody cares
			repo_branch: 'master', // Deployment branch. Commits from other branches will be ignored
			
			execute: '/home/kern0/DEV/42GC/scripts/deploy.sh' // Full path
		},
		
		enabled: ['42gc'] // Enabled repository configurations
	}
};
```
Also see `config.example.js` file.
3. Recieve Git WebHook
4. ???
5. PROFIT
6. Or get error in response JSON.

# Author
Kern0 — [Home page](http://kern0.ru), [GitHub](https://github.com/Kern0/KtulhuDeploy).