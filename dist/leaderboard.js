(() => {
  const status = document.getElementById('leaderboard-status');
  const list = document.getElementById('leaderboard-list');
  let watchGeneration = 0;
  let services, connection, unsubscribe, writeQueue = Promise.resolve();
  const prepared = new Map();
  function failure(error) {
    console.warn('Leaderboard:', error.code || error.message);
    status.textContent = error.code === 'permission-denied'
      ? 'The leaderboard is waiting for Firebase access rules. Local scores still work.'
      : 'Could not connect to the leaderboard. Check your connection and try Refresh. (' + (error.code || error.message) + ')';
  }
  async function connect() {
    if (connection) return connection;
    connection = (async () => {
      const base = 'https://www.gstatic.com/firebasejs/13.1.0/';
      const [app, auth, db] = await Promise.all([
        import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')
      ]);
      const firebase = app.initializeApp({
        apiKey:'AIzaSyCUCaZz07fb8Qp7qRYwzQiQC92pws7CSLU',
        authDomain:'cafe-thanda-garam.firebaseapp.com',projectId:'cafe-thanda-garam',
        storageBucket:'cafe-thanda-garam.firebasestorage.app',messagingSenderId:'775585056135',
        appId:'1:775585056135:web:f80f2fa2a0a3aa48bf3f22'
      });
      const account = auth.getAuth(firebase);
      await account.authStateReady();
      const user = account.currentUser || (await auth.signInAnonymously(account)).user;
      services = {db, store:db.getFirestore(firebase), uid:user.uid};
      return services;
    })().catch(error => {connection = null; throw error;});
    return connection;
  }
  function render(rows) {
    list.replaceChildren();
    if (!rows.length) {list.textContent = 'The first cup is yours. Play to join the leaderboard!'; return;}
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>Rank</th><th>Barista</th><th>Right</th><th>Wrong</th></tr></thead><tbody></tbody>';
    rows.forEach((row,index) => {
      const tr = document.createElement('tr');
      [index + 1, row.name, row.right, row.wrong].forEach(value => {
        const td = document.createElement('td');td.textContent = String(value);tr.append(td);
      });
      table.tBodies[0].append(tr);
    });
    list.append(table);
  }
  async function watch() {
    const generation = ++watchGeneration;
    status.textContent = 'Connecting to the public leaderboard…';
    try {
      const {db,store} = await connect();
      if (generation !== watchGeneration || !document.getElementById('scores-dialog').open) return;
      if (unsubscribe) unsubscribe();
      unsubscribe = db.onSnapshot(db.query(db.collection(store,'baristas'),db.orderBy('right','desc'),db.limit(50)), snapshot => {
        render(snapshot.docs.map(doc => doc.data()));
        status.textContent = 'Live · top 50 by correct drinks. New online rounds count here.';
      }, failure);
    } catch (error) {failure(error);}
  }
  async function profileRef(profile) {
    const {db,store,uid} = await connect();
    const key = uid + '_' + profile.id;
    if (!prepared.has(key)) {
      const promise = (async () => {
        const ref = db.doc(store,'baristas',key);
        await db.runTransaction(store,async transaction => {
          const snapshot = await transaction.get(ref);
          if (!snapshot.exists()) transaction.set(ref,{owner:uid,name:profile.name,right:0,wrong:0,updatedAt:db.serverTimestamp()});
        });
        return ref;
      })().catch(error => {prepared.delete(key);throw error;});
      prepared.set(key,promise);
    }
    return prepared.get(key);
  }
  window.CafeLeaderboard = {
    record(profile,ok) {
      const copy = {id:profile.id,name:profile.name};
      const sync = document.getElementById('cloud-score-status');
      sync.textContent = 'Saving this cup to the public leaderboard…';
      writeQueue = writeQueue.then(async () => {
        const ref = await profileRef(copy);
        const {db,store} = services;
        await db.runTransaction(store,async transaction => {
          const snapshot = await transaction.get(ref);
          if (!snapshot.exists()) throw new Error('Profile not found');
          const field = ok ? 'right' : 'wrong';
          transaction.update(ref,{[field]:snapshot.data()[field] + 1,updatedAt:db.serverTimestamp()});
        });
        sync.textContent = 'This cup is saved to the public leaderboard.';
      }).catch(error => {
        sync.textContent = 'This cup was saved locally, but could not reach the public leaderboard.';
        failure(error);
      });
    }
  };
  document.getElementById('scores-open').addEventListener('click',watch);
  document.getElementById('leaderboard-refresh').addEventListener('click',watch);
  document.getElementById('scores-dialog').addEventListener('close',() => {watchGeneration++;if(unsubscribe){unsubscribe();unsubscribe=null;}});
})();
