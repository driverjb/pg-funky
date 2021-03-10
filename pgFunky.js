const { Pool } = require('pg');

/**
 * @typedef {object} PGParam
 * @param {"text"|"numeric"|"json"|"bool"} type Predefined types (can also put other types as a string)
 * @param {any} value
 */

function prepareFunctionCall(functionName, params) {
  let p = [];
  let f = [];
  for (let i = 0; i < params.length; i++) {
    let param = params[i];
    if (param.type) p.push(`$${i + 1}::${param.type}`);
    else p.push(`$${i + 1}`);
    if (param.value == null) f.push(param.value);
    else if (typeof param.value == 'object') f.push(JSON.stringify(param.value));
    else f.push(param.value);
  }
  return {
    sql: `select * from ${functionName}(${p.join(', ')}) as "RESULT"`,
    params: f,
  };
}

class PGFunky {
  /**
   *
   * @param {Object} opt Configuration options
   * @param {string} opt.host Host to connect to
   * @param {number} [opt.port=5432] Port to connect on
   * @param {string} opt.user
   * @param {string} opt.password
   * @param {bool} [opt.ssl=false]
   * @param {number} [opt.idleTimeoutMillis=0]
   * @param {number} [opt.max=10] Maximum number of concurrent clients
   */
  constructor(opt) {
    opt.application_name = opt.application_name ? opt.application_name : 'pg-funky';
    if (opt.max === undefined) opt.max = 10;
    if (opt.port === undefined) opt.port = 5432;
    if (opt.ssl === undefined) opt.ssl = false;
    if (opt.idleTimeoutMillis === undefined) opt.idleTimeoutMillis = 0;
    this.config = opt;
    this.pool = null;
  }
  /**
   * Add an event handler for client connect events
   * @param func
   */
  addPoolClientConnectHandler(func) {
    this.pool.on('connect', func);
  }
  /**
   * Add an event handler for client acquisition events (clients already connect, but idle in the pool)
   * @param func
   */
  addPoolClientAcquiredHandler(func) {
    this.pool.on('acquire', func);
  }
  /**
   * Add an event handler for client removal events. Happens when clients timeout or crash out of the pool
   * @param func
   */
  addPoolClientRemovedHandler(func) {
    this.pool.on('remove', func);
  }
  /**
   * Add an event handler for client error events
   * @param func
   */
  addPoolClientErrorHandler(func) {
    this.pool.on('error', func);
  }
  /** Shut down the pool */
  stop() {
    return this.pool.end();
  }
  start() {
    this.pool = new Pool(this.config);
    return this._testConnection();
  }
  /**
   * Execute the given function with the given parameters. Function names should be formatted as
   * schema.function
   * @param {string} functionName
   * @param {PGParam[]} params
   */
  execute(functionName, params) {
    let prepped = prepareFunctionCall(functionName, params);
    return this.pool.connect().then((client) => {
      return client
        .query(prepped.sql, prepped.params)
        .then((result) => {
          let r = result.rows[0]['RESULT'];
          if (Array.isArray(r) && r.length === 1 && r[0] == null) return [];
          else return r;
        })
        .finally(client.release);
    });
  }
  /** Connects a pool client to see if the configuration is working */
  _testConnection() {
    return this.pool.connect().then((client) => {
      client.release();
      return true;
    });
  }
}

module.exports = PGFunky;
