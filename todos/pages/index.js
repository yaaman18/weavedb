import { useRef, useState, useEffect } from "react";
import lf from "localforage";
import { divide, isNil, map } from "ramda";
import SDK from "weavedb-sdk";
import client from "weavedb-client";
import { Buffer } from "buffer";
import { ethers } from "ethers";

let db;
const contractTxId = "";
const arweave_wallet = {
}

export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState("All");
  const [initDB, setInitDB] = useState(false);
  let task = useRef();
  const tabs = isNil(user) ? ["All"] : ["All", "Yours"];
  const [button, setButton] = useState(true);

  const setupWeaveDB = async () => {
    window.Buffer = Buffer;
    db = new SDK({
      web3: web3,
      wallet: arweave_wallet,
      name: "weavedb",
      version: "1",
      contractTxId,
      arweave: {
        host: "arweave.net",
        port: 443,
        protocol: "https",
      },
    });
    setInitDB(true);
  };

  const getTasks = async () => {
    setTasks(await db.cget("tasks", ["date", "desc"]));
  };

  const getMyTasks = async () => {
    setTasks(
      await db.cget(
        "tasks",
        ["user_address", "=", user.wallet.toLowerCase()],
        ["date", "desc"]
      )
    );
  };

  const addTask = async (task) => {
    await db.add(
      {
        task,
        date: db.ts(),
        user_address: db.signer(),
        done: false,
      },
      "tasks",
      user
    );
    await getTasks();
  };

  const completeTask = async (id) => {
    await db.update(
      {
        done: true,
      },
      "tasks",
      id,
      user
    );
    await getTasks();
  };

  const deleteTask = async (id) => {
    await db.delete("tasks", id, user);
    await getTasks();
  };
  const changeWord = () => {
    setButton(!button);
  };
  const login = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    const wallet_address = await provider.getSigner().getAddress();
    let identity = await lf.getItem(
      `temp_address:${contractTxId}:${wallet_address}`
    );
    let tx;
    let err;
    if (isNil(identity)) {
      ({ tx, identity, err } = await db.createTempAddress(wallet_address));
    } else {
      await lf.setItem("temp_address:current", wallet_address);
      setUser({
        wallet: wallet_address,
        privateKey: identity.privateKey,
      });
      changeWord();
      return;
    }
    if (!isNil(tx) && isNil(tx.err)) {
      identity.tx = tx;
      identity.linked_address = wallet_address;
      await lf.setItem("temp_address:current", wallet_address);
      await lf.setItem(
        `temp_address:${contractTxId}:${wallet_address}`,
        identity
      );
      setUser({
        wallet: wallet_address,
        privateKey: identity.privateKey,
      });
    }
    console.log("ログイン成功");
    console.log(user.wallet.slice(0, 7));
  };

  const logout = async () => {
    if (confirm("Would you like to sign out?")) {
      await lf.removeItem("temp_address:current");
      setUser(null, "temp_current");
      changeWord();
      console.log("ログアウト成功");
    } else {
      console.log("ログアウト失敗");
    }
  };

  const checkUser = async () => {
    const wallet_address = await lf.getItem(`temp_address:current`);
    if (!isNil(wallet_address)) {
      const identity = await lf.getItem(
        `temp_address:${contractTxId}:${wallet_address}`
      );
      if (!isNil(identity))
        setUser({
          wallet: wallet_address,
          privateKey: identity.privateKey,
        });
    }
  };

  useEffect(() => {
    checkUser();
    setupWeaveDB();
  }, []);

  useEffect(() => {
    if (initDB) {
      if (tab === "All") {
        getTasks();
      } else {
        getMyTasks();
      }
    }
  }, [tab, initDB]);

  const Tabs = () => (
    <Flex justify="center" style={{ display: "flex" }} mb={4}>
      {map((v) => (
        <Box
          mx={2}
          onClick={() => setTab(v)}
          color={tab === v ? "red" : ""}
          textDecoration={tab === v ? "underline" : ""}
          sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
        >
          {v}
        </Box>
      ))(tabs)}
    </Flex>
  );

  const loginStatus = async () => {
    {
      if (!isNil(user)) {
        logout();
        console.log("logout");
        console.log(user.wallet.slice(0, 7));
      } else {
        login();
        console.log("login");
      }
    }
  };

  return (
    <div data-theme="cupcake">
      <div className="drawer">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          {/* <!-- Navbar --> */}
          <div className="navbar w-full bg-base-300">
            <div className="flex-none ">
              <label htmlFor="my-drawer-3" className="btn btn-ghost btn-square">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block h-6 w-6 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </label>
            </div>
            <div className="mx-2 flex-1 justify-center px-2">Code Sundbox</div>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  loginStatus();
                }}
                className="btn"
              >
                {button ? "connnect wallet" : user.wallet.slice(0, 7)}
              </button>
            </div>
          </div>
          {/* <!-- Page content here --> */}
          <main>
            <h1 className="mt-32 flex justify-center text-3xl">Test Flight</h1>
            <p className="mt-8 flex justify-center break-words  text-xl">
              please write something
            </p>
            <div className="mt-10 flex justify-center">
              <input
                type="text"
                placeholder="Type here"
                value={task.current}
                onChange={(e) => {
                  task.current = e.target.value;
                }}
                className="input input-primary w-full  max-w-xs"
              />
              <button
                onClick={async () => {
                  if (!/^\s*$/.test(task.current)) {
                    await addTask(task.current);
                    task.current = "";
                  }
                }}
                className="btn"
              >
                add text
              </button>
            </div>
            {/* user soart */}
            <div className="mt-8 mb-8 flex justify-center">
              {map((v) => (
                <button className="group-hover mr-2" onClick={() => setTab(v)}>
                  {v}
                </button>
              ))(tabs)}
            </div>

            <div className="">
              {map((v) => (
                <div>
                  <div className="my-4 flex justify-center">
                    <div className=" cursor-pointer ">
                      {v.data.done ? (
                        "✅"
                      ) : v.data.user_address !==
                        user?.wallet.toLowerCase() ? null : (
                        <div
                          className="cursor-pointer"
                          onClick={() => completeTask(v.id)}
                        >
                          ⬜
                        </div>
                      )}
                    </div>
                    <div className="mr-4">
                      {v.data.user_address.slice(0, 7)}
                    </div>
                    <div> {v.data.task} </div>
                    <div className="group-hover flex justify-center">
                      {v.data.user_address === user?.wallet.toLowerCase() ? (
                        <div
                          className="tooltip  tooltip-info ml-3 flex cursor-pointer justify-center"
                          data-tip="クリックでタスクが消えます"
                          onClick={() => deleteTask(v.id)}
                        >
                          ❌
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))(tasks)}
            </div>
          </main>
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer-3" className="drawer-overlay"></label>
          <ul className="menu w-80 overflow-y-auto bg-base-100 p-4">
            {/* <!-- Sidebar content here --> */}
            <li>
              <a>Sidebar Item 1</a>
            </li>
            <li>
              <a>Sidebar Item 2</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
export async function getStaticProps() {
  const dummyNewsList = [
    {
      id: "1",
      title: "test1",
      content: "texttext1",
    },
    {
      id: "2",
      title: "test2",
      content: "texttext2",
    },
  ];

  return {
    props: {
      news: dummyNewsList,
    },
    revalidate: 10,
  };
}
