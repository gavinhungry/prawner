prawner
=======
Spawn shell commands with Promises.

Installation
------------

    $ npm install prawner

Usage
-----

```js
const prawner = require('prawner');

await prawner('uname -sm'); // 'Linux x86_64'

await prawner('foobar').catch(err => {
  // Error: '/bin/sh: foobar: command not found'
});
```

License
-------
This software is released under the terms of the **MIT license**. See `LICENSE`.
