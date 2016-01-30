/* Example of configuration file. */

module.exports = {
	port: process.env.PORT || 80,
	
	applications: {
		'42gc': {
			repo_name: '42GC',
			repo_branch: 'master',
			
			execute: '/home/kern0/DEV/42GC/scripts/deploy.sh',
			directory: '/home/kern0/DEV/42GC/'
		},
		
		enabled: ['42gc']
	}
};
