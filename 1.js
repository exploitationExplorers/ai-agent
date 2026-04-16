async function* makeStream() {
    yield "第1段";
    await new Promise((r) => setTimeout(r, 1500));
    yield "第2段";
    await new Promise((r) => setTimeout(r, 500));
    yield "第3段";
  }
  async function main() {
    for await (const part of makeStream()) {
      console.log("收到：", part);
    }
    console.log("结束");
  }



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