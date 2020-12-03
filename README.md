# PG Funky

From a security standpoint, I prefer interacting with PostgreSQL only with functions from my applications. So, I made it easy. Also, I always let the server do the work, then return JSON. So, you always get back JSON.

# Usage

```javascript
//==================== funky.js
const { PGFunky } = require('pg-funky');

let config = {
  host: 'myPostgresHost', //required - Host of the postgres database
  port: 5432, //optional - port to connect to. Default: 5432
  user: 'theUser', //required - user to connect with
  password: 'thePassword', //required - password for the user
  database: 'theDatabase', //required - database to connect to
  application_name: 'pg-funky', //optional - Name of the application. Default pg-funky
  idleTimeoutMillis: 0, //optional - time before a client removes itself from the pool. Default 0 = Never
  max: 10 //optional - maximum number of clients allowed in the pool. Default: 10
  ssl: false, //optional - If using ssl use {rejectUnauthorized: true} when using legit certs. Default: false
}

let funky = new PGFunky(config);


funk.start().then(()=>{
  console.log('Systsem is ready')
}).catch((e)=>{
  console.log('System failed:', e.message)
})

module.exports = funky

//==================== user-model.js
const funky = require('./funky')

const funky = require('./funky');

//type is optional, but if you are using method overloading on the postgres side you will need it
funky.execute('identities.get_user', [{ type: 'bigint', value: 1 }]).then((user) => {
  console.log(user);
});
```
