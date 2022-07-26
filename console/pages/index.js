import { useEffect, Fragment, useState } from "react"
import JSONPretty from "react-json-pretty"
import {
  Image,
  Select,
  ChakraProvider,
  Box,
  Flex,
  Input,
} from "@chakra-ui/react"
import {
  filter,
  compose,
  values,
  keys,
  isNil,
  map,
  mapObjIndexed,
  is,
  slice,
} from "ramda"
import { bind } from "nd"
import weavedb from "lib/weavedb.json"
export default bind(
  ({ set, init, router, conf, $ }) => {
    const fn = init([
      "checkTempAddress",
      "setupWeaveDB",
      "createTempAddress",
      "logoutTemp",
      "queryDB",
    ])
    const [result, setResult] = useState("")
    const [state, setState] = useState(null)
    const [col, setCol] = useState(null)
    const [doc, setDoc] = useState(null)
    const [tab, setTab] = useState("Data")
    const [method, setMethod] = useState("get")
    const [query, setQuery] = useState("")
    const tabs = ["Data", "Schemas", "Rules", "Indexes"]
    useEffect(() => {
      ;(async () => {
        fn.checkTempAddress()
        const db = await fn.setupWeaveDB()
        setInterval(async () => {
          setState(await db.db.currentState())
        }, 1000)
      })()
    }, [])
    let cols = []
    let docs = []
    let data = null
    if (!isNil(state)) {
      cols = keys(state.data)
      if (!isNil(state.data[col])) {
        docs = keys(state.data[col].__docs)
        if (!isNil(doc) && !isNil(state.data[col].__docs[doc])) {
          data = state.data[col].__docs[doc].__data
        }
      }
    }
    const methods = [
      "get",
      "cget",
      "add",
      "set",
      "update",
      "upsert",
      "delete",
      "batch",
      "addIndex",
      "getIndex",
      "removeIndex",
      "setRules",
      "getRules",
      "setSchema",
      "getSchema",
      "nonce",
      "ids",
      "evolve",
    ]
    const ConnectWallet = () => (
      <Flex
        py={2}
        px={6}
        bg="#333"
        color="white"
        sx={{
          borderRadius: "25px",
          cursor: "pointer",
          ":hover": { opacity: 0.75 },
        }}
        justifyContent="center"
        onClick={async () => {
          if (isNil($.temp_current)) {
            set(true, "signing_in")
            await fn.createTempAddress({})
            set(false, "signing_in")
          } else {
            if (confirm("Would you like to sign out?")) {
              fn.logoutTemp()
            }
          }
        }}
      >
        {isNil($.temp_current)
          ? "Sign In"
          : `${$.temp_current.slice(0, 6)}...${$.temp_current.slice(-4)}`}
      </Flex>
    )
    const getCol = (data, path, _signer) => {
      const [col, id] = path
      data[col] ||= { __docs: {} }
      if (isNil(id)) {
        return data[col]
      } else {
        data[col].__docs[id] ||= { __data: null, subs: {} }
        if (!isNil(_signer) && isNil(data[col].__docs[id].setter)) {
          data[col].__docs[id].setter = _signer
        }
        return getCol(
          data[col].__docs[id].subs,
          slice(2, path.length, path),
          _signer
        )
      }
    }

    const getIndex = (state, path) => {
      if (isNil(state.indexes[path.join(".")]))
        state.indexes[path.join(".")] = {}
      return state.indexes[path.join(".")]
    }
    const scanIndexes = ind => {
      let indexes = []
      for (let k in ind) {
        for (let k2 in ind[k]) {
          const _ind = [[k, k2]]
          if (!isNil(ind[k][k2]._)) indexes.push(_ind)
          if (!isNil(ind[k][k2].subs)) {
            const sub_indexes = scanIndexes(ind[k][k2].subs)
            for (let v of sub_indexes) {
              indexes.push([..._ind, ...v])
            }
          }
        }
      }
      return indexes
    }
    let indexes = []
    let rules = {}
    let schemas = {}
    if (!isNil(col)) {
      indexes = scanIndexes(getIndex(state, [col]))
      ;({ rules, schemas } = getCol(state.data, [col]))
    }
    return (
      <ChakraProvider>
        <style global jsx>{`
          html,
          #__next,
          body {
            height: 100%;
          }
        `}</style>
        <Flex
          bg="white"
          width="100%"
          height="56px"
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            borderBottom: "1px solid #ddd",
          }}
          align="center"
        >
          <Flex px={5} justify="center" align="center" w="160px">
            <Image
              boxSize="40px"
              src="/static/images/logo.svg"
              sx={{ borderRadius: "50%" }}
              mr={2}
            />
            WeaveDB
          </Flex>
          <Flex flex={1} justify="center" fontSize="10px">
            <Box px={2}>http://localhost:1820</Box>
            <Box px={2}>contractTxId: {weavedb.weavedb.contractTxId}</Box>
          </Flex>
          <Flex justify="center" align="center" justifySelf="flex-end" px={5}>
            <ConnectWallet />
          </Flex>
        </Flex>
        <Flex justify="center" height="100%" fontSize="12px" pt="50px">
          <Flex maxW="960px" w="100%" h="100%" direction="column" p={3}>
            <Flex w="100%" justify="center" mb={4} mt={2}>
              {map(v => {
                return (
                  <Box
                    onClick={() => setTab(v)}
                    bg={v === tab ? "#333" : "#ddd"}
                    color={v === tab ? "white" : "#333"}
                    px={4}
                    py={1}
                    sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
                  >
                    {v}
                  </Box>
                )
              })(tabs)}
            </Flex>
            <Flex
              height="535px"
              maxW="960px"
              w="100%"
              sx={{ border: "1px solid #333" }}
            >
              <Flex h="535px" w="100%">
                <Box
                  flex={1}
                  sx={{ border: "1px solid #555" }}
                  direction="column"
                >
                  <Flex py={2} px={3} color="white" bg="#333" h="35px">
                    Collections
                  </Flex>
                  {map(v => (
                    <Flex
                      onClick={() => setCol(v)}
                      bg={col === v ? "#ddd" : ""}
                      py={2}
                      px={3}
                      sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
                    >
                      {v}
                    </Flex>
                  ))(cols)}
                </Box>
                {tab === "Schemas" ? (
                  <Flex
                    flex={1}
                    sx={{ border: "1px solid #555" }}
                    direction="column"
                  >
                    <Flex py={2} px={3} color="white" bg="#333" h="35px">
                      Schamas
                    </Flex>
                    <Box height="500px" sx={{ overflowY: "auto" }} p={3}>
                      <JSONPretty id="json-pretty" data={schemas}></JSONPretty>
                    </Box>
                  </Flex>
                ) : tab === "Rules" ? (
                  <Flex
                    flex={1}
                    sx={{ border: "1px solid #555" }}
                    direction="column"
                  >
                    <Flex py={2} px={3} color="white" bg="#333" h="35px">
                      Rules
                    </Flex>
                    <Box height="500px" sx={{ overflowY: "auto" }} p={3}>
                      <JSONPretty id="json-pretty" data={rules}></JSONPretty>
                    </Box>
                  </Flex>
                ) : tab === "Indexes" ? (
                  <>
                    <Flex
                      flex={1}
                      sx={{ border: "1px solid #555" }}
                      direction="column"
                    >
                      <Flex py={2} px={3} color="white" bg="#333" h="35px">
                        Compound Indexes
                      </Flex>
                      <Box height="500px" sx={{ overflowY: "auto" }}>
                        {compose(
                          map(v => (
                            <Flex p={2} px={3}>
                              {map(v2 => {
                                let ind = v2
                                if (v2.length === 1) {
                                  ind.push("asc")
                                }
                                return (
                                  <Box
                                    px={3}
                                    mr={2}
                                    bg="#ddd"
                                    sx={{ borderRadius: "3px" }}
                                  >
                                    {v2.join(" : ")}
                                  </Box>
                                )
                              })(v)}
                            </Flex>
                          )),
                          filter(v => v.length > 1)
                        )(indexes)}
                      </Box>
                    </Flex>
                    <Flex
                      flex={1}
                      sx={{ border: "1px solid #555" }}
                      direction="column"
                    >
                      <Flex py={2} px={3} color="white" bg="#333" h="35px">
                        Single Indexes
                      </Flex>
                      <Box height="500px" sx={{ overflowY: "auto" }}>
                        {compose(
                          map(v => (
                            <Flex p={2} px={3}>
                              {map(v2 => {
                                let ind = v2
                                if (v2.length === 1) {
                                  ind.push("asc")
                                }
                                return (
                                  <Box
                                    px={3}
                                    mr={2}
                                    bg="#ddd"
                                    sx={{ borderRadius: "3px" }}
                                  >
                                    {v2.join(" : ")}
                                  </Box>
                                )
                              })(v)}
                            </Flex>
                          )),
                          filter(v => v.length === 1)
                        )(indexes)}
                      </Box>
                    </Flex>
                  </>
                ) : (
                  <>
                    <Flex
                      flex={1}
                      sx={{ border: "1px solid #555" }}
                      direction="column"
                    >
                      <Flex py={2} px={3} color="white" bg="#333" h="35px">
                        Docs
                      </Flex>
                      <Box height="500px" sx={{ overflowY: "auto" }}>
                        {map(v => (
                          <Flex
                            onClick={() => setDoc(v)}
                            bg={doc === v ? "#ddd" : ""}
                            p={2}
                            px={3}
                            sx={{
                              cursor: "pointer",
                              ":hover": { opacity: 0.75 },
                            }}
                          >
                            {v}
                          </Flex>
                        ))(docs)}
                      </Box>
                    </Flex>
                    <Box
                      flex={1}
                      sx={{ border: "1px solid #555" }}
                      direction="column"
                    >
                      <Flex py={2} px={3} color="white" bg="#333" h="35px">
                        Data
                      </Flex>
                      {compose(
                        values,
                        mapObjIndexed((v, k) => {
                          return (
                            <Flex align="center" p={2} px={3}>
                              <Box
                                mr={2}
                                px={3}
                                bg="#ddd"
                                sx={{ borderRadius: "3px" }}
                              >
                                {k}
                              </Box>
                              {is(Object)(v)
                                ? JSON.stringify(v)
                                : is(Boolean)(v)
                                ? v
                                  ? "true"
                                  : "false"
                                : v}
                            </Flex>
                          )
                        })
                      )(data)}
                    </Box>
                  </>
                )}
              </Flex>
            </Flex>
            <Flex w="100%" justify="center" mb={3} mt={1} pt={2}>
              <Select
                w="200px"
                value={method}
                onChange={e => setMethod(e.target.value)}
                sx={{
                  borderRadius: "3px 0 0 3px",
                }}
              >
                {map(v => <option value={v}>{v}</option>)(methods)}
              </Select>
              <Input
                flex={1}
                sx={{ borderRadius: "0px" }}
                placeholder="query"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <Flex
                sx={{
                  borderRadius: "0 3px 3px 0",
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
                w="150px"
                justify="center"
                align="center"
                color="white"
                bg="#333"
                onClick={async () => {
                  try {
                    const res = await fn.queryDB({ query, method })
                    setResult(res)
                  } catch (e) {
                    console.log(e)
                    setResult("Error: The wrong query")
                  }
                }}
              >
                Execute
              </Flex>
            </Flex>
            <Flex
              w="100%"
              justify="center"
              mb={4}
              sx={{ border: "1px solid #111", borderRadius: "3px" }}
            >
              <Flex
                width="200px"
                justify="center"
                p={2}
                sx={{ borderRight: "1px solid #111" }}
              >
                {method}({query})
              </Flex>
              <Flex
                flex={1}
                px={2}
                color={/^Error:/.test(result) ? "red" : "#333"}
                p={2}
              >
                {result}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </ChakraProvider>
    )
  },
  ["temp_current", "initWDB"]
)
