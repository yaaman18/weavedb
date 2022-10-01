import { useRef, useState, useEffect } from "react";
import lf from "localforage";
import { divide, isNil, map } from "ramda";
import SDK from "weavedb-sdk";
import client from "weavedb-client";
import { Buffer } from "buffer";
import { ethers } from "ethers";

let db;
const contractTxId = "fhrDBPh8kN517SEWaVu9AomRwqukm0q6f8AbQhEQTn0";
const arweave_wallet = {
  kty: "RSA",
  n: "7f37L7G5ADMZPId-Ce9u1nsl1w4DTpk0IFhuNEQ31rhQT3W2GXzvZIcnVEqp5gJRkBCbyzSPZEksBVf-t7AcMsXQtaOFj5rOe4jr8OT8M5QmFVjMEFJP-0_sYvm6TqDDVQU8boPdg7gdc6sSnA_L6XhLtpUvp5NwjEV6I483AOlIujIElhoV7AeG59MStA4MQTbccDEgOFJ-NRdp_uK7P4RCZdS0XSz53T7THed26z07C8W3ZaNIAJq3OB9giHFReqhL42V1rVQbj0cfLxQXt_RKV0ojrO_mY95Cm0_49-Nhkna6PXyn30QZIYkKvbbYwaRF2gXg9ipxxso6mIyIGLeYUKpN0nVzuY7hL8-zhZ4I1KkuuMvn-9y8EA0QoMrzug_GZ4LVJIoDVDe9IYKuy4c3lVP8Wv1F1mBaoRpq7R2CfagPL_UvYe_EXdFqMZLYYoF92RQxdEPW8pWFw9g6QWYfAGSM0mKJHaUeSovcYuuyQIRKehbsXS08hgOW_QJHIN9JTB-dW7Np8O76RbJgLtyBft82nJ8ZMw3t-f90PUurAcjA0_NznGOxlwf52j_ABCD7rfg4zM0MbsIWKvx83gVunGNHk7rL2RrMo1yCdrZgUTy0rsBXrUdjmOKrokjn_F9WKOF8_KWmTYDhuT0dFC0ILFJhKoke8FuzJgq71Kk",
  e: "AQAB",
  d: "fI689E1TweL8hk1zjceefuqc910CJhTQz0z5AKnjf6GfhrbYw6Y7tKV31Anvuc3k2j2XDFdJ5PbW70UKryCg4YHepfIbaPlgsA8NTVrLFEOpWurKgpBSA_nkgjipZZWGJe1Dn6OsP9AQugUDDGLIGj03gyu5cT8dXIzQS-QcqYFu6uRauiSU7J9T3-j8lPf1Ofx4is9rSY8DNs42T4xi6-9QwPL-IvXzH_RNkg0elCfLy3GDdtJqUMaotdrWLxL_ze5fKXhkin7Gncpfa8hcUY6tidnnqg80yXf97EOCzlpXKsyw1JV1VsjRTlfnIzubXl2XoXAKOUwlmCEnYcfLQgISk-iqlbiwJ-KHkLrGsFLp_YeY2k5azBy4xg7oL03qOpAFbadgzoswrWLW671RX24nyUwp2JSFnHJqxApt_iqpYeJpcwasAJC4LMq0_dyIkfbT5mixduD7u5yYCB2X2fUR-yvRnFyyqnn9a_iiBqcAdGPHJx4wNYE5vtFaCzBQfaeeR0LRV-VBI8FssKLV2hG1_n35mvIl6n7MgpOyIYoEnK6oBVFKPiR_nBgwbG7MTAeh_zTZgir47VFW6kW6fOXjKb3SfRoqyZfDeomvi4VPyinX_t9xbPFJX-TPgZzI2adzLuKhS3hey0PM9JXk12fkiR2oP3T5GWr-Y8lTlLE",
  p: "-TW7HoqxH8fkUWVQY6plIrUkyKDR2fcmlpFGszbeIZefrZXJGiAmkoouaEz9KijpwMVLSHrXctVwxumcFdXPKjn3vU6OTcK0wovu2UiS1w035IIIBkkDwmnULea4mZvzsN2Gl6waHtBy2IHd7T1LFHX4R-TbDIwoVvzov5nezw2Gi2O1D79MnghFlH-yIrRSBCakHcr5-hlA0eNxn1jAMHTzi_cfHjVlqhjchyRxCO13uU6nqNpb26tkOS9EnhpThDnrPu6EWtYAnE8Vm705VH8yh6CidgxeR2GGW-LKC8dNHo9iZZCGT-J-uOzJyqQZbSfa0z6h8ZM86rlJ_mD6Rw",
  q: "9HoBRAEADXg9lyuKYTPxzsCP5DVmZhDCOw4EIubwgIH8CO0ELRHardQjms2BumB4EJw1aoIqQkt9ZJr57t0AY8cC6w5Uzu3NPBUTJWCEx2OGF0_3aZ8AUzFBsKW52Y_jJsMSOPlgxkBUuYFNUSoo0fU70JjFEJcrmesvrW1s8B13KJvUIrNvyrVX3KPRz5IXe2sQWBgRBHeY4CCdVOB8zn_lEu1SmlBmM93OiXUoBLEXMqO_p1gPST8vLcj9JIWR_s1W4qMTo5xf1YmRW09tDZslQ1jyO04crOgPfrLS89ExxgJ3Yv56gI8WgF1cz9Drm6I2ymMhOj9Bm0BD0txBjw",
  dp: "lRd4IwWGgiTsi2W5embuqp0ErKLJ6UTbaSjwyzcAHcjAVvFNprulV_YjXXLx4s8nSZS_PVWAn8rh9Z69KrMHhZO4iyD8MblSuzFMa-HnN5FI5wSEGH6GKUF3Fx75QazzVdSyOPtVhSngC3dmdhA9YrhRGXHpOtB_McuM01QS4HyPCcVVBV7FT6ZTOkxLHkgS6TjU5p4Qf3esN-WCjHpkQJk3O31UuJXphKHrDU7X8SdggRR1aad5XSpkg3Gr84p8fJbKDpRTyqRNKTaHDu1d5xdR-6I2j7lGjh3ibAZ6KiHKGYZer7SPJiuy9J90-i7Cp3M4jzjhWc1knGjNw8nw8Q",
  dq: "TjA292jae3RZPl_Oggf67gToADST61CwzfJNoFv7zx3DXZdwHnn3VmDigj_3nYP84lMTQl0e5tT95Y8rIBnOZhrf9A1BUmz7lpum4-1aiepqmEoa9szDbdfzCmv2ZH6AR4Vb7pzTNpSchDe2Yp75Ly0fVDeHzyaJ61Asj2rPzHugAHzV-8Mnnc0hrI84KwquN-ql74bC6orVedj0eJDTWbfNq5_7Kx9LkIr_4zZ09gstQCTexsaDHQn4LMx7KZMOfk9t2k4NmeYJQGIe-vUMC63y3Pc1gYIZ6bLOQdcvYIsnQAzJ4f9BbpxUtfkmFdDbiYr3uwK5Pce9U8nZ5zZKQQ",
  qi: "-J5GETXBH3T3zpg7vrSsvCjFk6-Zz7N43f88Zbf5qJn3rhfDGzha2pX49RueQct8FmtDLcNHqGIChAHgXigEmQwvohT7CsWAvkszARMmuRQfiHFV3rtqUVPzh-CuNzuunQqvYRmRBd_ejZtVlpQOfucusXEe8WQcXOjOm4XcBFx1vmIEFvcy8-qsA8cQFtYdtVNaT9I3-lQSBtVr3QRswLO5GdQNBM6K35i1DxC9HWRRLeyxg5ocEOodGEc7ATWqe-goSqKWWgAyIojwPAxHfh-rbsORT_-zpSMTlZyMwOJWKvqgCtJvrcCUfZgzMObABA_6q6pbWqJbMnWH0ziahQ",
};

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
