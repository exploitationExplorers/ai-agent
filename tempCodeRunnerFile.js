
  function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
  async function* gen() {
    yield "A";
    await delay(100);
    yield "B";
    return "C";
  }
  (async () => {
    const it = gen();
    console.log(await it.next()); // { value: 'A', done: false }
    console.log(await it.next()); // { value: 'B', done: false }
    console.log(await it.next()); // { value: 'C', done: true }
  })();