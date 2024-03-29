var json = {
  global: {},
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 70,
        children: [
          {
            type: "tab",
            name: "Output",
            component: "output",
            id: "output",
          },
        ],
      },
    ],
  },
};
const model = Model.fromJson(json);

let layoutMap = {
  output: null,
};
let factory = (node) => {
  var component = node.getComponent();

  for (let [key, val] of Object.entries(layoutMap)) {
    if (component == key) return val;
  }
  return <div>No Layout Matched</div>;
};

let FLayout = () => {
  return <TheFlexLayout model={model} factory={factory} />;
};

function renderApp() {
  window.root.render(
    <BrowserRouter>
      <GlobalStateContextProvider>
        <NextTick />
        <App />
      </GlobalStateContextProvider>
    </BrowserRouter>
  );
}

async function init() {
  if (window.initted) return;
  window.initted = true;
  window.lastEdits = await (await fetch("/api/filesInfo")).json();

  setInterval(async () => {
    window.lastEditsTmp = await (await fetch("/api/filesInfo")).json();
    window.lastModified = Object.entries(window.lastEditsTmp).reduce((a, b) => (new Date(a) > new Date(b[1]) ? a : b[1]), 0);
    for (const [key, value] of Object.entries(window.lastEditsTmp)) {
      if (window.lastEdits[key] !== value) {
        console.log(key, "change", key, value, window.lastEdits[key]);
        window.lastEdits = window.lastEditsTmp;
        if (key.slice(-4) == ".jsx") {
          await makeSureImport(key);
        }
        if (key.slice(-3) == ".js") {
          await makeSureImport(key);
          // await makeSureImport('/main.jsx');
          renderApp();
        }
        if (key.slice(-5) == ".html") {
          window.location.reload();
        }
      }
    }
  }, 500);
}
(async () => {
  await init();

  renderApp();
})();

let Layout = ({ children }) => {
  return (
    <div className=" full col ">
      {state.modal && state.modal()}
      <input
        type="file"
        className="hidden"
        multiple
        onChange={(evt) => {
          window.uploadAwaiter([...evt.target.files]);
        }}
        ref={(el) => {
          window.getFilesUpload = async () => {
            el.click();
            return await new Promise((resolve) => {
              window.uploadAwaiter = resolve;
            });
          };
          window.getSingleFilesUpload = async () => {
            el.removeAttribute("multiple");
            el.click();
            return await new Promise((resolve) => {
              window.uploadAwaiter = resolve;
            });
          };
        }}
      />
      {children}
      <div className={`flex center w-full text-blue-200 ${persist.admin ? "bg-black" : "bg-red-600"}`}>
        <div className="special-link p-0 font-mono" onClick={() => navigate("/")}>
          Home
        </div>
        <div className="special-link p-0 font-mono" onClick={() => (persist.admin = !persist.admin)}>
          Admin {faker.number.int({ min: 0, max: 9 })} {new Date(window.lastModified).toLocaleString()}
        </div>
        <div className="grow"></div>
        {persist.user ? (
          <div className="special-link p-0" onClick={() => navigate("/profile")}>
            Profile
          </div>
        ) : (
          <div className="special-link p-0" onClick={() => navigate("/auth")}>
            Login
          </div>
        )}
        <div className="special-link p-0" onClick={() => navigate("/orders")}>
          Orders
        </div>
        <div className="special-link p-0" onClick={() => navigate("/admin")}>
          Manage
        </div>
      </div>

      {/* main routes */}
      <div className="main-div full col">
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/home">
            <Home />
          </Route>
          <Route path="/search">
            <Search />
          </Route>
          <Route path="/profile">
            <Profile />
          </Route>
          <Route path="/auth">
            <Auth />
          </Route>
          <Route path="/admin">
            <Admin />
          </Route>
          <Route path="/product">
            <ProductPage />
          </Route>
          <Route path="/orders">
            <Orders />
          </Route>
          <Route path="/order">
            <Order />
          </Route>
          <Route path="*">
            <NotFound />
          </Route>
        </Switch>
      </div>
    </div>
  );
};

let App = ({ children }) => {
  useCtx();
  return (
    <div className="full text-text-primary bg-bg-primary col">
      <Layout />
    </div>
  );
};

let Order = ({}) => {
  let { id } = useQuery();
  let orderRef = reactiveRef(null);

  useEffect(() => {
    (async () => {
      orderRef.current = cons(await tryFetch("/api/order/id/" + id));
    })();
  }, []);
  return (
    <div class="min-w-screen min-h-screen bg-gray-50 py-5">
      <div class="px-5">
        <div class="mb-2">
          <a href="#" class="focus:outline-none hover:underline text-gray-500 text-sm">
            <i class="mdi mdi-arrow-left text-gray-400"></i>Back
          </a>
        </div>
        <div class="mb-2">
          <h1 class="text-3xl md:text-5xl font-bold text-gray-600">Checkout.</h1>
        </div>
        <div class="mb-5 text-gray-400">
          <a href="#" class="focus:outline-none hover:underline text-gray-500">
            Home
          </a>{" "}
          /{" "}
          <a href="#" class="focus:outline-none hover:underline text-gray-500">
            Cart
          </a>{" "}
          / <span class="text-gray-600">Checkout</span>
        </div>
      </div>
      <div class="w-full bg-white border-t border-b border-gray-200 px-5 py-10 text-gray-800">
        <div class="w-full">
          <div class="-mx-3 md:flex items-start">
            <div class="px-3 md:w-7/12 lg:pr-10">
              <div class="w-full mx-auto text-gray-800 font-light mb-6 border-b border-gray-200 pb-6">
                {orderRef.current?.product_ids?.map((product) => (
                  <div class="w-full flex items-center">
                    <div class="overflow-hidden rounded-lg w-16 h-16 bg-gray-50 border border-gray-200">
                      <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80" alt="" />
                    </div>
                    <div class="flex-grow pl-3">
                      <h6 class="font-semibold uppercase text-gray-600">Ray Ban Sunglasses.</h6>
                      <p class="text-gray-400">x 1</p>
                    </div>
                    <div>
                      <span class="font-semibold text-gray-600 text-xl">$210</span>
                      <span class="font-semibold text-gray-600 text-sm">.00</span>
                    </div>
                  </div>
                ))}
              </div>
              <div class="mb-6 pb-6 border-b border-gray-200">
                <div class="-mx-2 flex items-end justify-end">
                  <div class="flex-grow px-2 lg:max-w-xs">
                    <label class="text-gray-600 font-semibold text-sm mb-2 ml-1">Discount code</label>
                    <div>
                      <input class="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors" placeholder="XXXXXX" type="text" />
                    </div>
                  </div>
                  <div class="px-2">
                    <button class="block w-full max-w-xs mx-auto border border-transparent bg-gray-400 hover:bg-gray-500 focus:bg-gray-500 text-white rounded-md px-5 py-2 font-semibold">APPLY</button>
                  </div>
                </div>
              </div>
              <div class="mb-6 pb-6 border-b border-gray-200 text-gray-800">
                <div class="w-full flex mb-3 items-center">
                  <div class="flex-grow">
                    <span class="text-gray-600">Subtotal</span>
                  </div>
                  <div class="pl-3">
                    <span class="font-semibold">$190.91</span>
                  </div>
                </div>
                <div class="w-full flex items-center">
                  <div class="flex-grow">
                    <span class="text-gray-600">Taxes (GST)</span>
                  </div>
                  <div class="pl-3">
                    <span class="font-semibold">$19.09</span>
                  </div>
                </div>
              </div>
              <div class="mb-6 pb-6 border-b border-gray-200 md:border-none text-gray-800 text-xl">
                <div class="w-full flex items-center">
                  <div class="flex-grow">
                    <span class="text-gray-600">Total</span>
                  </div>
                  <div class="pl-3">
                    <span class="font-semibold text-gray-400 text-sm">AUD</span> <span class="font-semibold">$210.00</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-3 md:w-5/12">
              <div class="w-full mx-auto rounded-lg bg-white border border-gray-200 p-3 text-gray-800 font-light mb-6">
                <div class="w-full flex mb-3 items-center">
                  <div class="w-32">
                    <span class="text-gray-600 font-semibold">Contact</span>
                  </div>
                  <div class="flex-grow pl-3">
                    <span>Scott Windon</span>
                  </div>
                </div>
                <div class="w-full flex items-center">
                  <div class="w-32">
                    <span class="text-gray-600 font-semibold">Billing Address</span>
                  </div>
                  <div class="flex-grow pl-3">
                    <span>123 George Street, Sydney, NSW 2000 Australia</span>
                  </div>
                </div>
              </div>
              <div class="w-full mx-auto rounded-lg bg-white border border-gray-200 text-gray-800 font-light mb-6">
                <div class="w-full p-3 border-b border-gray-200">
                  <div class="mb-5">
                    <label for="type1" class="flex items-center cursor-pointer">
                      <input type="radio" class="form-radio h-5 w-5 text-indigo-500" name="type" id="type1" checked />
                      <img src="https://leadershipmemphis.org/wp-content/uploads/2020/08/780370.png" class="h-6 ml-3" />
                    </label>
                  </div>
                  <div>
                    <div class="mb-3">
                      <label class="text-gray-600 font-semibold text-sm mb-2 ml-1">Name on card</label>
                      <div>
                        <input class="w-full px-3 py-2 mb-1 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors" placeholder="John Smith" type="text" />
                      </div>
                    </div>
                    <div class="mb-3">
                      <label class="text-gray-600 font-semibold text-sm mb-2 ml-1">Card number</label>
                      <div>
                        <input class="w-full px-3 py-2 mb-1 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors" placeholder="0000 0000 0000 0000" type="text" />
                      </div>
                    </div>
                    <div class="mb-3 -mx-2 flex items-end">
                      <div class="px-2 w-1/4">
                        <label class="text-gray-600 font-semibold text-sm mb-2 ml-1">Expiration date</label>
                        <div>
                          <select class="form-select w-full px-3 py-2 mb-1 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                            <option value="01">01 - January</option>
                            <option value="02">02 - February</option>
                            <option value="03">03 - March</option>
                            <option value="04">04 - April</option>
                            <option value="05">05 - May</option>
                            <option value="06">06 - June</option>
                            <option value="07">07 - July</option>
                            <option value="08">08 - August</option>
                            <option value="09">09 - September</option>
                            <option value="10">10 - October</option>
                            <option value="11">11 - November</option>
                            <option value="12">12 - December</option>
                          </select>
                        </div>
                      </div>
                      <div class="px-2 w-1/4">
                        <select class="form-select w-full px-3 py-2 mb-1 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                          <option value="2020">2020</option>
                          <option value="2021">2021</option>
                          <option value="2022">2022</option>
                          <option value="2023">2023</option>
                          <option value="2024">2024</option>
                          <option value="2025">2025</option>
                          <option value="2026">2026</option>
                          <option value="2027">2027</option>
                          <option value="2028">2028</option>
                          <option value="2029">2029</option>
                        </select>
                      </div>
                      <div class="px-2 w-1/4">
                        <label class="text-gray-600 font-semibold text-sm mb-2 ml-1">Security code</label>
                        <div>
                          <input class="w-full px-3 py-2 mb-1 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors" placeholder="000" type="text" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="w-full p-3">
                  <label for="type2" class="flex items-center cursor-pointer">
                    <input type="radio" class="form-radio h-5 w-5 text-indigo-500" name="type" id="type2" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" width="80" class="ml-3" />
                  </label>
                </div>
              </div>
              <div>
                <button class="block w-full max-w-xs mx-auto bg-indigo-500 hover:bg-indigo-700 focus:bg-indigo-700 text-white rounded-lg px-3 py-2 font-semibold">
                  <i class="mdi mdi-lock-outline mr-1"></i> PAY NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="p-5">
        <div class="text-center text-gray-400 text-sm">
          <a href="https://www.buymeacoffee.com/scottwindon" target="_blank" class="focus:outline-none underline text-gray-400">
            <i class="mdi mdi-beer-outline"></i>Buy me a beer
          </a>{" "}
          and help support open-resource
        </div>
      </div>
    </div>
  );
};

let Orders = () => {
  let loadRows = async () => {
    ordersRef.current = (await tryFetch("/api/order/my")) || [];
  };
  let ordersRef = reactiveRef([]);
  useEffect(() => {
    loadRows();
  }, []);

  let columns = [
    { name: "name" },
    { name: "user_id" },
    { name: "product_ids" },
    { name: "status" },
    {
      name: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <div className="special-btn" onClick={() => navigate("/order?id=" + row.id)}>
            View
          </div>
          <div className="special-btn" onClick={() => navigate("/order?id=" + row.id)}>
            Cancel
          </div>
        </div>
      ),
    },
  ];
  return (
    <div className="col">
      <div className="special-title">Orders</div>

      <CRUDTable columns={columns} rows={ordersRef.current} loadRows={loadRows} />
    </div>
  );
};
let ProductPage = ({ children }) => {
  let { id } = useQuery();
  let [product, setProduct] = useState({});
  let temp = reactiveRef({ quantity: 0 }).current;
  let { path, url } = useRouteMatch();
  let query = useQuery();
  let fakeProductsRef = reactiveRef([]);

  async function loadProduct() {
    let response = await tryFetch("/api/product/id/" + id);
    if (!response) response = {};
    console.log("loadProduct", response);
    setProduct(response);
  }
  useEffect(() => {
    loadProduct();
    (async () => {
      fakeProductsRef.current = (await tryFetch("/api/product/search?limit=10")).rows;
      console.log("loadProduct", id, fakeProductsRef.current);
    })();
  }, [id]);

  async function order() {
    if (!persist.user) return notify("Please Login");
    let response = await tryFetch("/api/order", {
      method: "POST",
      body: JSON.stringify({ product_ids: [id], user_id: persist.user.id }),
    });
    if (response) notify("Ordered Successfully");
    else notify("Something went wrong");
  }

  return (
    product &&
    product.id && (
      <main className="my-8">
        <ProductTopNav />

        <div className="container mx-auto px-6 py-12">
          <div className="md:flex md:items-center">
            <div className="w-full center">
              <img className="aspect-video w-full rounded-md object-cover max-w-lg mx-auto" src={product.images?.[0] || "/images/noimage.png"} alt="Nike Air" />
            </div>
            <div className="w-full max-w-lg mx-auto mt-5 md:ml-8 md:mt-0 md:w-1/2">
              <h3 className="text-gray-700 uppercase text-lg">{product.name || "Product Name"}</h3>
              <span className="text-gray-500 mt-3">${product.price || "0.00"}</span>
              <hr className="my-3" />
              <div className="mt-2">
                <label className="text-gray-700 text-sm" for="count">
                  Count:
                </label>
                <div className="flex items-center mt-1">
                  <button className="text-gray-500 focus:outline-none focus:text-gray-600" onClick={() => temp.quantity++}>
                    <i className="fa fa-plus-circle"></i>
                  </button>
                  <span className="text-gray-700 text-lg mx-2">{temp.quantity}</span>
                  <button className="text-gray-500 focus:outline-none focus:text-gray-600" onClick={() => temp.quantity > 0 && temp.quantity--}>
                    <i className="fa fa-minus-circle"></i>
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <label className="text-gray-700 text-sm" for="count">
                  Color:
                </label>
                <div className="flex items-center mt-1">
                  <button className="h-5 w-5 rounded-full bg-blue-600 border-2 border-blue-200 mr-2 focus:outline-none"></button>
                  <button className="h-5 w-5 rounded-full bg-teal-600 mr-2 focus:outline-none"></button>
                  <button className="h-5 w-5 rounded-full bg-pink-600 mr-2 focus:outline-none"></button>
                </div>
              </div>
              <div className="flex items-center mt-6">
                <button className="px-8 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-500 focus:outline-none focus:bg-indigo-500" onClick={() => order()}>
                  Order Now
                </button>
                <button className="mx-2 text-gray-600 border border-border-primary rounded-md p-2 hover:bg-gray-200 focus:outline-none">
                  <i className="flex fi-rr-shopping-cart"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-16">
            <h3 className="text-gray-600 text-2xl font-medium">More Products</h3>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
              {fakeProductsRef.current.map((product) => (
                <ProductView2 key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  );
};
let Search = (props) => {
  let productsRef = reactiveRef([]);
  let resultsCountRef = reactiveRef(0);
  let queryOptionsRef = reactiveRef({ offset: 0, limits: { name: "limit", data: { options: [10, 20, 50, 100] }, value: 10 }, ranges: { name: "range", data: { options: [] } } });
  let resultsOptionsRef = reactiveRef({});
  useEffect(() => {
    queryOptionsRef.current.ranges.data.options = [];
    queryOptionsRef.current.ranges.value = null;
    queryOptionsRef.current.limits.value = parseInt(queryOptionsRef.current.limits.value);
    let start = 0,
      end = start + queryOptionsRef.current.limits.value;
    while (start <= resultsCountRef.current) {
      queryOptionsRef.current.ranges.data.options.push(`${start}-${end}`);
      start = end;
      end = start + queryOptionsRef.current.limits.value;
    }
  }, [queryOptionsRef.current.stateId, queryOptionsRef.current.limits.value]);
  let { q } = useQuery();
  useEffect(() => {
    cons({ q });
    loadResults();
  }, [q]);
  async function loadResults() {
    let res = cons(await tryFetch(`/api/product/search?q=${q}&offset=${queryOptionsRef.current.ranges.value?.split("-")[0]}`));
    productsRef.current = res?.rows || [];
    resultsCountRef.current = res?.count || 0;
    queryOptionsRef.current.stateId = uuid();
    resultsOptionsRef.current.range = queryOptionsRef.current.ranges.value;
  }
  return (
    <div className="col">
      <ProductTopNav />
      <div className="flex px-6 pb-0 gap-2 items-center bg-bg-secondary shadow">
        <SpecialSelect item={queryOptionsRef.current.limits} />
        <SpecialSelect item={queryOptionsRef.current.ranges} />
        <div className="grow"></div>
        <div className="my-2 border-l-2 border-border-primary self-stretch"></div>
        <div className="special-btn" onClick={() => loadResults()}>
          Apply
        </div>
      </div>
      <div className="col p-6 pb-0">
        <div className="text-xl font-medium">Search Results</div>
        <div className="text-sm text-gray-500">
          Showing {resultsOptionsRef.current.range || 0} of {resultsCountRef.current} results
        </div>
      </div>
      <div class="mx-auto grid max-w-6xl  grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {productsRef.current.map((product, index) => (
          <ProductView1 product={product} key={index} />
        ))}
      </div>
    </div>
  );
};
let Profile = (props) => {
  useCtx();
  function convertStyleStringToReactObj(styleString) {
    const stylesArray = styleString.split(";").filter(Boolean);
    const stylesObj = {};

    stylesArray.forEach((style) => {
      const [key, value] = style.split(":").map((prop) => prop.trim());
      stylesObj[key] = value;
    });

    return stylesObj;
  }
  function getDatePicked() {
    return new Date();
  }
  const [bits, setBits] = useState(0);

  async function saveData() {
    setBits(bits | (1 << 1));
    let fetchedUser = await tryFetch("/api/user/" + props.data.username, {
      method: "PATCH",
      body: JSON.stringify(user),
    });
    // await new Promise(resolve => setTimeout(resolve, 1000));
    notify("Updated User");
    setBits(bits | (0 << 1));
    navigate("/users/" + props.data.username);
  }
  const [user, setUser] = useState(persist.user);

  async function loadUser() {
    let fetchedUser = await tryFetch("/api/user/" + props.data.username, {
      method: "GET",
    });
    setUser(fetchedUser);
  }
  useEffect(() => {
    loadUser();
  }, []);

  return persist.user ? (
    <main class="profile-page">
      {JSON.stringify(props.data)}
      <section class="relative block h-80">
        <div
          class="absolute top-0 w-full h-full bg-center bg-cover"
          style={{
            backgroundImage: "url(https://source.unsplash.com/random)",
          }}
        >
          <span id="blackOverlay" class="w-full h-full absolute opacity-50 bg-black"></span>
        </div>
        <div class="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px" style={convertStyleStringToReactObj(`transform: translateZ(0px)`)}>
          <svg class="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" viewBox="0 0 2560 100" x="0" y="0">
            <polygon class="text-blueGray-200 fill-current" points="2560 0 2560 100 0 100"></polygon>
          </svg>
        </div>
      </section>
      <section class="relative py-16 bg-blueGray-200">
        <div class="container mx-auto px-4">
          <div class="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-32">
            <div class="px-6">
              <div class="flex flex-wrap justify-center">
                <div class="w-full lg:w-3/12 px-4 lg:order-2 flex justify-center ">
                  <div class=" overflow-visible relative aspect-square w-64 ">
                    <img alt="..." src={user?.avatar || "https://i.pravatar.cc/300"} class="shadow-xl rounded-full full -mt-32 " />
                  </div>
                </div>
                <div class="flex gap-2 w-full lg:w-4/12 px-4 lg:order-3 center items-end ">
                  <button
                    className={`${"special-btn"} ${bits & (1 << 1) && "loading"}`}
                    onClick={() => {
                      persist.user = null;
                    }}
                  >
                    Logout
                  </button>
                  <button
                    className={`${"special-btn"} ${bits & (1 << 1) && "loading"}`}
                    onClick={() => {
                      if (!props.editMode) navigate(`/users/${props.data.username}/edit`);
                      else saveData();
                    }}
                  >
                    {props.editMode ? "Save" : "Edit"}
                  </button>
                </div>
                <div class="w-full lg:w-4/12 px-4 lg:order-1">
                  <div class="flex justify-center py-4 lg:pt-4 pt-8">
                    <div class="mr-4 p-3 text-center">
                      <span class="text-xl font-bold block uppercase tracking-wide text-blueGray-600">22</span>
                      <span class="text-sm text-blueGray-400">Friends</span>
                    </div>
                    <div class="mr-4 p-3 text-center">
                      <span class="text-xl font-bold block uppercase tracking-wide text-blueGray-600">10</span>
                      <span class="text-sm text-blueGray-400">Photos</span>
                    </div>
                    <div class="lg:mr-4 p-3 text-center">
                      <span class="text-xl font-bold block uppercase tracking-wide text-blueGray-600">89</span>
                      <span class="text-sm text-blueGray-400">Comments</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="full col center">
                {(props.editMode && (
                  <div className="full max-w-md col">
                    <label class="block uppercase tracking-wide text-blueGray-700 text-xs font-bold mb-2">Username</label>
                    <input
                      type="text"
                      className="special-input rounded"
                      placeholder="Username"
                      value={user?.username}
                      onChange={(e) => {
                        setUser({ ...user, username: e.target.value });
                      }}
                    />
                    <div className="my-2"></div>
                  </div>
                )) || <h3 class="text-md font-semibold leading-normal text-blueGray-700 font-mono">{"@" + user?.username}</h3>}
                {(props.editMode && (
                  <div className="full max-w-md col">
                    <label class="block uppercase tracking-wide text-blueGray-700 text-xs font-bold mb-2">Name</label>
                    <input
                      type="text"
                      className="special-input rounded"
                      placeholder="Edit Name"
                      value={user?.name}
                      onChange={(e) => {
                        setUser({ ...user, name: e.target.value });
                      }}
                    />
                    <div className="my-2"></div>
                  </div>
                )) || <h3 class="text-4xl font-semibold leading-normal text-blueGray-700">{user.name}</h3>}
                {(props.editMode && (
                  <div className="full max-w-md col">
                    <label class="block uppercase tracking-wide text-blueGray-700 text-xs font-bold mb-2">Location</label>
                    <input
                      type="text"
                      className="special-input rounded"
                      placeholder="Location"
                      value={user?.country}
                      onChange={(e) => {
                        setUser({ ...user, country: e.target.value });
                      }}
                    />
                  </div>
                )) || (
                  <div class="text-sm leading-normal mt-0 text-blueGray-400 font-bold uppercase">
                    <i class="fas fa-map-marker-alt mr-2 text-lg text-blueGray-400"></i>
                    Los Angeles, {user?.country || "Unknown"}
                  </div>
                )}
                <div className="my-2"></div>
                {(props.editMode && (
                  <div className="full max-w-md col">
                    <label class="block uppercase tracking-wide text-blueGray-700 text-xs font-bold mb-2">Title</label>
                    <input
                      type="text"
                      className="special-input rounded"
                      placeholder="Title"
                      value={user?.title}
                      onChange={(e) => {
                        setUser({ ...user, title: e.target.value });
                      }}
                    />
                  </div>
                )) || (
                  <div class=" text-blueGray-600 mt-10">
                    <i class="fas fa-briefcase mr-2 text-lg text-blueGray-400"></i>
                    {user?.title || "Unknown"}
                  </div>
                )}
                <div className="my-2"></div>
                {(props.editMode && (
                  <div className="full max-w-md col">
                    <label class="block uppercase tracking-wide text-blueGray-700 text-xs font-bold mb-2">Company Name</label>
                    <input
                      type="text"
                      className="special-input rounded"
                      placeholder="Company Name"
                      value={user?.company}
                      onChange={(e) => {
                        setUser({ ...user, company: e.target.value });
                      }}
                    />
                  </div>
                )) || (
                  <div class=" text-blueGray-600">
                    <i class="fas fa-university mr-2 text-lg text-blueGray-400"></i>
                    {user?.company || "Unknown"}
                  </div>
                )}
              </div>
              <div class="my-20 border-t"></div>
              <div className="full center col">
                <div class="w-full lg:w-9/12 px-4 ">
                  {(props.editMode && (
                    <div className="full ">
                      <label class="block uppercase tracking-wide text-blueGray-700 text-xs font-bold mb-2">Bio</label>
                      <textarea
                        className="special-input full"
                        name=""
                        id=""
                        cols="30"
                        rows="10"
                        value={user?.bio}
                        onChange={(e) => {
                          setUser({ ...user, bio: e.target.value });
                        }}
                      ></textarea>
                    </div>
                  )) || (
                    <div className="col">
                      <p className={`${"mb-4 text-lg leading-relaxed text-blueGray-700"} ${bits & (1 << 0) ? "" : "line-clamp-4"}`}>{user?.bio || "Unknown"}</p>
                      <button
                        onClick={() => {
                          setBits(bits ^ (1 << 0));
                        }}
                        class="self-start font-normal text-pink-500"
                      >
                        {bits & (1 << 0) ? "Show less" : "Show more"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div class="my-20 border-t"></div>
              <div className="full col center">
                <div className="full max-w-md col">
                  <label class="block uppercase tracking-wide text-blueGray-700 text-xs font-bold mb-2 ">Email</label>
                  <input
                    type="text"
                    className="special-input rounded "
                    disabled={!props.editMode}
                    placeholder="Email"
                    value={user?.email}
                    onChange={(e) => {
                      setUser({ ...user, email: e.target.value });
                    }}
                  />
                </div>
                <div className="my-2"></div>
                <div className="full max-w-md col">
                  <label class="block uppercase tracking-wide text-blueGray-700 text-xs font-bold mb-2">Phone</label>
                  <input
                    type="text"
                    className="special-input rounded"
                    disabled={!props.editMode}
                    placeholder="Phone"
                    value={user?.phone}
                    onChange={(e) => {
                      setUser({ ...user, phone: e.target.value });
                    }}
                  />
                </div>
                <div className="my-2"></div>
                <div className="full max-w-md col">
                  <label class="block uppercase tracking-wide text-blueGray-700 text-xs font-bold mb-2">Date of Birth</label>
                  <input type="text" className="special-input rounded" disabled={!props.editMode} placeholder="Date of Birth" value={new Date(user?.dateOfBirth)} onClick={() => setUser({ ...user, dateOfBirth: getDatePicked() })} />
                </div>
                <div className="my-2"></div>
                <div className="full max-w-md col">
                  <label class="block uppercase tracking-wide text-blueGray-700 text-xs font-bold mb-2">Password</label>
                  <input
                    type="text"
                    className="special-input rounded"
                    disabled={!props.editMode}
                    placeholder="Password"
                    value={user?.password}
                    onChange={(e) => {
                      setUser({ ...user, password: e.target.value });
                    }}
                  />
                </div>
                <div className="my-12"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  ) : (
    <div className="full col center">
      <div className="text-lg">Must login first</div>
    </div>
  );
};
let Auth = () => {
  let authType = reactiveRef("login");
  let open = stateRef.current.modal;

  let formFields = reactiveRef([
    { name: "email", type: "input" },
    { name: "password", type: "input" },
  ]);
  let regFormFields = reactiveRef([
    { name: "name", type: "input" },
    { name: "email", type: "input" },
    { name: "password", type: "input" },
  ]);

  async function authLogin() {
    let body = Object.fromEntries(formFields.current.map((item) => [item.name, item.value]));
    console.log("authLogin", body);
    let res = await tryFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
    cons(res);
    if (res) {
      persistRef.current.user = res;
      navigate("/");
    }
    stateRef.current.modal = null;
  }
  async function authRegister() {
    let body = Object.fromEntries(regFormFields.current.map((item) => [item.name, item.value]));
    console.log("authRegister", body);
    let res = await tryFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
    cons(res);
    if (res) {
      persistRef.current.user = res;
      navigate("/");
    }
    stateRef.current.modal = null;
  }

  return (
    <div className="col center p-6">
      <div className="login card min-w-md max-w-lg">
        <div className="card-header">
          <div className="flex center">
            <div className="special-link p-0" onClick={() => (authType.current = "login")}>
              Login
            </div>
            <span>|</span>
            <div className="special-link p-0" onClick={() => (authType.current = "register")}>
              Register
            </div>
          </div>
        </div>
        <div className="card-body">{authType.current === "login" ? <SpecialForm fields={formFields.current} /> : <SpecialForm fields={regFormFields.current} />}</div>
        <div className="card-footer">
          {authType.current === "login" ? (
            <div className="special-btn" onClick={authLogin}>
              Login
            </div>
          ) : (
            <div className="special-btn" onClick={authRegister}>
              Register
            </div>
          )}
          <div className="special-btn" onClick={() => (stateRef.current.modal = null)}>
            Cancel
          </div>
        </div>
      </div>
    </div>
  );
};
let ProductView2 = ({ product }) => {
  return (
    <div className="w-full max-w-sm mx-auto rounded-md shadow-md overflow-hidden" onClick={() => navigate(`/product?id=${product.id}`)}>
      <div className="flex items-end justify-end h-56 w-full bg-cover" style={styleToObject(`background-image: url('${product.images?.[0]}')`)}>
        <button className="p-2 rounded-full bg-blue-600 text-white mx-5 -mb-4 hover:bg-blue-500 focus:outline-none focus:bg-blue-500">
          <svg className="h-5 w-5" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </button>
      </div>
      <div className="px-5 py-3">
        <h3 className="text-gray-700 uppercase">{product.name}</h3>
        <span className="text-gray-500 mt-2">${product.price}</span>
      </div>
    </div>
  );
};
let ProductView1 = ({ product }) => {
  return (
    <div class="rounded-xl bg-white p-3 shadow-lg hover:shadow-xl hover:transform hover:scale-105 duration-300 col" onClick={() => navigate(`/product?id=${product.id}`)}>
      <img class="rounded-xl" src={product.images?.[0]} alt="Hotel Photo" />
      <div class="mt-1 p-2 col grow">
        <h2 class="text-slate-700">{product.name}</h2>
        <p class="mt-1 text-sm text-slate-400">{product.description}</p>
        <div className="grow"></div>
        <div class="mt-3 flex items-end justify-between">
          <p class="text-lg font-bold text-blue-500">${product.price}</p>
          <div class="flex items-center space-x-1.5 rounded-lg bg-blue-500 px-4 py-1.5 text-white duration-100 hover:bg-blue-600">
            <i class="fas fa-shopping-cart"></i>
            <button class="text-sm">Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  );
};
let Home = () => {
  let fakeUserRef = reactiveRef(fakeUser());
  let fakeProductsRef = reactiveRef([]);
  useEffect(() => {
    (async () => {
      fakeProductsRef.current = (await tryFetch("/api/product/search?limit=10")).rows;
    })();
  }, []);
  return (
    <div className="">
      <ProductTopNav />
      <section class="relative bg-blue-50">
        <div class="relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen-75">
          <div
            class="absolute top-0 w-full h-full bg-center bg-cover"
            style={styleToObject(`
            background-image: url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=crop&amp;w=1267&amp;q=80');
          `)}
          >
            <span id="blackOverlay" class="w-full h-full absolute opacity-75 bg-black"></span>
          </div>
          <div class="container relative mx-auto">
            <div class="items-center flex flex-wrap">
              <div class="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
                <div class="pr-12">
                  <h1 class="text-white font-semibold text-5xl">Your story starts with us.</h1>
                  <p class="mt-4 text-lg text-blue-200">This is a simple example of a Landing Page you can build using Notus JS. It features multiple CSS components based on the Tailwind CSS design system.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px" style={styleToObject(`transform: translateZ(0px)`)}>
            <svg class="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" viewBox="0 0 2560 100" x="0" y="0">
              <polygon class="text-blueGray-200 fill-current" points="2560 0 2560 100 0 100"></polygon>
            </svg>
          </div>
        </div>

        <section class="pb-10 bg-blueGray-200 -mt-24">
          <div class="container mx-auto px-4">
            <div class="flex flex-wrap">
              <div class="lg:pt-12 pt-6 w-full md:w-4/12 px-4 text-center">
                <div class="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                  <div class="px-4 py-5 flex-auto">
                    <div class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-red-400">
                      <i class="fas fa-award"></i>
                    </div>
                    <h6 class="text-xl font-semibold">Awarded Agency</h6>
                    <p class="mt-2 mb-4 text-blueGray-500">Divide details about your product or agency work into parts. A paragraph describing a feature will be enough.</p>
                  </div>
                </div>
              </div>
              <div class="w-full md:w-4/12 px-4 text-center">
                <div class="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                  <div class="px-4 py-5 flex-auto">
                    <div class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-blue-400">
                      <i class="fas fa-retweet"></i>
                    </div>
                    <h6 class="text-xl font-semibold">Free Revisions</h6>
                    <p class="mt-2 mb-4 text-blueGray-500">Keep you user engaged by providing meaningful information. Remember that by this time, the user is curious.</p>
                  </div>
                </div>
              </div>
              <div class="pt-6 w-full md:w-4/12 px-4 text-center">
                <div class="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                  <div class="px-4 py-5 flex-auto">
                    <div class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-emerald-400">
                      <i class="fas fa-fingerprint"></i>
                    </div>
                    <h6 class="text-xl font-semibold">Verified Company</h6>
                    <p class="mt-2 mb-4 text-blueGray-500">Write a few lines about each one. A paragraph describing a feature will be enough. Keep you user engaged!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>

      {/* Products */}
      <section class="py-10 bg-gray-100 full border overflow-hidden">
        <div class="mx-auto grid max-w-6xl  grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {fakeProductsRef.current.map((product, index) => (
            <ProductView1 product={product} key={index} />
          ))}
        </div>
      </section>

      <div>
        <main className="flex flex-col">
          <div className="mt-32"></div>

          <section className="flex flex-wrap items-center -mx-3 font-sans px-4 mx-auto w-full lg:max-w-screen-lg sm:max-w-screen-sm md:max-w-screen-md pb-20">
            <div className="px-3 w-full lg:w-2/5 break-words">
              <div className="mx-auto mb-8 max-w-lg text-center lg:mx-0 lg:max-w-md lg:text-left">
                <h2 className="mb-4 text-3xl font-bold text-left lg:text-5xl">
                  Exclusive Agency For
                  <span className="text-5xl text-blue-500 leading-relaxeds">Technology</span>
                  Provide Solution
                </h2>

                <p className="visible mx-0 mt-3 mb-0 text-sm leading-relaxed text-left text-slate-400">Helping you maximize operations management with digitization</p>
              </div>

              <div className="text-center lg:text-left">
                <a className="block visible py-4 px-8 mb-4 text-xs font-semibold tracking-wide leading-none text-white bg-blue-500 rounded cursor-pointer sm:mr-3 sm:mb-0 sm:inline-block">Key Features</a>

                <a className="block visible py-4 px-8 text-xs font-semibold leading-none bg-white rounded border border-solid cursor-pointer sm:inline-block border-slate-200 text-slate-500">How We Work?</a>
              </div>
            </div>

            <div className="px-3 mb-12 w-full lg:mb-0 lg:w-3/5">
              <div className="flex justify-center items-center p-6">
                <img src="https://source.unsplash.com/random" alt="image" className="w-full h-full object-cover rounded-3xl aspect-video" />
              </div>
            </div>
          </section>

          <section
            className="flex flex-col w-full h-[500px] bg-cover bg-fixed bg-center flex justify-center items-center"
            style={styleToObject(`
                        background-image: url(https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c?auto=format&fit=crop&w=880&q=80);
                    `)}
          >
            <h1 className="text-white text-5xl font-semibold mt-20 mb-10">Special Featured</h1>

            <span className="text-center font-bold my-20 text-white/90">
              <a href="https://egoistdeveloper.github.io/twcss-to-sass-playground/" target="_blank" className="text-white/90 hover:text-white">
                Convetert to SASS
              </a>
              <hr className="my-4" />
              <a href="https://unsplash.com/photos/8Pm_A-OHJGg" target="_blank" className="text-white/90 hover:text-white">
                Image Source
              </a>
              <hr className="my-4" />
              <p>
                <a href="https://github.com/EgoistDeveloper/my-tailwind-components/blob/main/src/templates/parallax-landing-page.html" target="_blank" className="text-white/90 hover:text-white">
                  Source Code
                </a>
                |
                <a href="https://egoistdeveloper.github.io/my-tailwind-components/./src/templates/parallax-landing-page.html" target="_blank" className="text-white/90 hover:text-white">
                  Full Preview
                </a>
              </p>
            </span>
          </section>

          <div className="flex flex-wrap border p-16 gap-4 center">{/* {featureds && featureds.map((feature) => <FeatureCard key={feature.id} {...feature} />)} */}</div>
        </main>

        <main className="my-8">
          <div className="container mx-auto px-6">
            <div className="h-64 rounded-md overflow-hidden bg-cover bg-center" style={styleToObject(`background-image: url('https://images.unsplash.com/photo-1577655197620-704858b270ac?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1280&q=144')`)}>
              <div className="bg-gray-900 bg-opacity-50 flex items-center h-full">
                <div className="px-10 max-w-xl">
                  <h2 className="text-2xl text-white font-semibold">Sport Shoes</h2>
                  <p className="mt-2 text-gray-400">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Tempore facere provident molestias ipsam sint voluptatum pariatur.</p>
                  <button className="flex items-center mt-4 px-3 py-2 bg-blue-600 text-white text-sm uppercase font-medium rounded hover:bg-blue-500 focus:outline-none focus:bg-blue-500">
                    <span>Shop Now</span>
                    <svg className="h-5 w-5 mx-2" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="md:flex mt-8 md:-mx-4">
              <div className="w-full h-64 md:mx-4 rounded-md overflow-hidden bg-cover bg-center md:w-1/2" style={styleToObject(`background-image: url('https://images.unsplash.com/photo-1547949003-9792a18a2601?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80')`)}>
                <div className="bg-gray-900 bg-opacity-50 flex items-center h-full">
                  <div className="px-10 max-w-xl">
                    <h2 className="text-2xl text-white font-semibold">Back Pack</h2>
                    <p className="mt-2 text-gray-400">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Tempore facere provident molestias ipsam sint voluptatum pariatur.</p>
                    <button className="flex items-center mt-4 text-white text-sm uppercase font-medium rounded hover:underline focus:outline-none">
                      <span>Shop Now</span>
                      <svg className="h-5 w-5 mx-2" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-full h-64 mt-8 md:mx-4 rounded-md overflow-hidden bg-cover bg-center md:mt-0 md:w-1/2" style={styleToObject(`background-image: url('https://images.unsplash.com/photo-1486401899868-0e435ed85128?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80')`)}>
                <div className="bg-gray-900 bg-opacity-50 flex items-center h-full">
                  <div className="px-10 max-w-xl">
                    <h2 className="text-2xl text-white font-semibold">Games</h2>
                    <p className="mt-2 text-gray-400">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Tempore facere provident molestias ipsam sint voluptatum pariatur.</p>
                    <button className="flex items-center mt-4 text-white text-sm uppercase font-medium rounded hover:underline focus:outline-none">
                      <span>Shop Now</span>
                      <svg className="h-5 w-5 mx-2" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-16">
              <h3 className="text-gray-600 text-2xl font-medium">Fashions</h3>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
                {fakeProductsRef.current.map((product, index) => (
                  <ProductView2 product={product} key={index} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};
let Footer = () => {
  return (
    <footer class="bg-gradient-to-r from-gray-100 via-[#bce1ff] to-gray-100">
      <div class="max-w-screen-xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <img src="#" class="mr-5 h-6 sm:h-9" alt="logo" />
            <p class="max-w-xs mt-4 text-sm text-gray-600">Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, accusantium.</p>
            <div class="flex mt-8 space-x-6 text-gray-600">
              <a class="hover:opacity-75" target="_blank" rel="noreferrer">
                <span class="sr-only"> Facebook </span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a class="hover:opacity-75" target="_blank" rel="noreferrer">
                <span class="sr-only"> Instagram </span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a class="hover:opacity-75" target="_blank" rel="noreferrer">
                <span class="sr-only"> Twitter </span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a class="hover:opacity-75" target="_blank" rel="noreferrer">
                <span class="sr-only"> GitHub </span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a class="hover:opacity-75" target="_blank" rel="noreferrer">
                <span class="sr-only"> Dribbble </span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-8 lg:col-span-2 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p class="font-medium">Company</p>
              <nav class="flex flex-col mt-4 space-y-2 text-sm text-gray-500">
                <a class="hover:opacity-75">About</a>
                <a class="hover:opacity-75">Meet the Team</a>
                <a class="hover:opacity-75">History</a>
                <a class="hover:opacity-75">Careers</a>
              </nav>
            </div>
            <div>
              <p class="font-medium">Services</p>
              <nav class="flex flex-col mt-4 space-y-2 text-sm text-gray-500">
                <a class="hover:opacity-75">1on1 Coaching</a>
                <a class="hover:opacity-75">Company Review</a>
                <a class="hover:opacity-75">Accounts Review</a>
                <a class="hover:opacity-75">HR Consulting</a>
                <a class="hover:opacity-75">SEO Optimisation</a>
              </nav>
            </div>
            <div>
              <p class="font-medium">Helpful Links</p>
              <nav class="flex flex-col mt-4 space-y-2 text-sm text-gray-500">
                <a class="hover:opacity-75">Contact</a>
                <a class="hover:opacity-75">FAQs</a>
                <a class="hover:opacity-75">Live Chat</a>
              </nav>
            </div>
            <div>
              <p class="font-medium">Legal</p>
              <nav class="flex flex-col mt-4 space-y-2 text-sm text-gray-500">
                <a class="hover:opacity-75">Privacy Policy</a>
                <a class="hover:opacity-75">Terms &amp; Conditions</a>
                <a class="hover:opacity-75">Returns Policy</a>
                <a class="hover:opacity-75">Accessibility</a>
              </nav>
            </div>
          </div>
        </div>
        <p class="mt-8 text-xs text-gray-800">© 2022 Comany Name</p>
      </div>
    </footer>
  );
};
let FeatureCard = (props) => {
  return (
    <div className="col w-60 rounded-xl shadow border cursor-pointer self-stretch" onClick={() => navigate(`/products/${props.id}`)}>
      <div className="col">
        <div className="col">
          <img className="w-full rounded-t-xl aspect-video" src={props.images[0]} />
        </div>
        <h3 className="text-2xl font-medium text-gray-700">{props.title}</h3>
      </div>
      <div className="col p-6">
        <div className="font-medium text-sm text-gray-700">{props.name}</div>
        <div className="text-gray-700">${props.price}</div>
        <p className="text-xs text-gray-500">{props.description}</p>
      </div>
      <div className="grow"></div>
      <div className="flex p-6 gap-2">
        <div className="special-btn">Buy Now</div>
        <div className="special-btn">Add to Cart</div>
      </div>
    </div>
  );
};

let SpecialSelect = ({ item }) => {
  useEffect(() => {
    if (!item.value) item.value = item.data.options[0]?.value || item.data.options[0] || null;
    cons(item.data.options);
  }, [item.data.options]);
  return (
    <div className="col my-2 min-w-xxs" key={item.name}>
      <label className=" block text-sm font-medium text-[#07074D]">{item.name.toTitleCase()}</label>
      <select
        className="special-input w-full"
        value={item.value}
        onChange={(e) => {
          item.value = e.target.value;
        }}
      >
        {item.data.options?.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    </div>
  );
};

let SpecialInput = ({ item }) => (
  <div className="col my-2" key={item.name}>
    <label className=" block text-base font-medium text-[#07074D]">{item.name.toTitleCase()}</label>
    <input
      type="text"
      className="special-input w-full"
      placeholder={item.name}
      value={item.value}
      onChange={(e) => {
        item.value = e.target.value;
      }}
    />
  </div>
);

let SpecialInputFiles = ({ item }) => (
  <div className="col my-2" key={item.name}>
    <label className=" block text-base font-medium text-[#07074D]">{item.name.toTitleCase()}</label>
    <div className="flex flex-wrap ">
      {item.value?.map((image, index) => (
        <div className="basis-1/2 aspect-video border relative group hover:visible">
          <img key={index} className="full aspect-video object-cover rounded " src={URL.createObjectURL(image)} alt="user avatar" />
          <div className="center bottom-0 w-full h-8 absolute bg-slate-500/50 text-whites invisible group-hover:visible">
            <i
              className="fi fi-rr-trash cursor-pointer"
              onClick={() => {
                item.value.splice(index, 1);
              }}
            ></i>
          </div>
        </div>
      ))}
    </div>
    <div
      className="col center border-slate-400 border-2 border-dashed rounded-xl p-3 cursor-pointer bg-slate-200"
      onClick={async () => {
        item.value = [...(item.value || []), ...(await window.getFilesUpload())];
      }}
    >
      <div className="text-lg">Drag and drop </div>
      <div className="text-sm">or click to select</div>
      <i className="fas fa-cloud-upload-alt"></i>
    </div>
  </div>
);

let SpecialForm = ({ fields }) => {
  return (
    <div className="">
      {fields.map((item, index) => {
        if (item.type === "select") {
          return <SpecialSelect item={item} key={index} />;
        } else if (item.type === "input" || !item.type) {
          return <SpecialInput item={item} key={index} />;
        } else if (item.type === "input-files") {
          return <SpecialInputFiles item={item} key={index} />;
        }
      })}
    </div>
  );
};

let showModal = (fields) => {
  return new Promise((resolve) => {
    stateRef.current.modal = () => {
      let formFields = reactiveRef(fields);

      return (
        <CustomModal open={true} onClose={() => (stateRef.current.modal = null)}>
          <div className="login card sm:min-w-sm">
            <div className="card-header">Header</div>
            <div className="card-body">
              <SpecialForm fields={formFields.current} />
            </div>
            <div className="card-footer">
              <div className="flex gap-2">
                <div
                  className="special-btn"
                  onClick={() => {
                    stateRef.current.modal = null;
                    resolve(Object.fromEntries(formFields.current.map((item) => [item.name, item.value])));
                  }}
                >
                  OK
                </div>
                <div className="special-btn" onClick={() => (stateRef.current.modal = null)}>
                  Cancel
                </div>
              </div>
            </div>
          </div>
        </CustomModal>
      );
    };
  });
};
let login = () => {
  stateRef.current.modal = () => {
    let authType = reactiveRef("login");
    let open = stateRef.current.modal;

    let formFields = reactiveRef([
      { name: "email", type: "input" },
      { name: "password", type: "input" },
    ]);
    let regFormFields = reactiveRef([
      { name: "name", type: "input" },
      { name: "email", type: "input" },
      { name: "password", type: "input" },
    ]);

    async function authLogin() {
      let body = Object.fromEntries(formFields.current.map((item) => [item.name, item.value]));
      console.log("authLogin", body);
      let res = await tryFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      });
      cons(res);
      stateRef.current.modal = null;
    }
    async function authRegister() {
      let body = Object.fromEntries(regFormFields.current.map((item) => [item.name, item.value]));
      console.log("authRegister", body);
      let res = await tryFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });
      cons(res);
      stateRef.current.modal = null;
    }

    return (
      <CustomModal open={true} onClose={() => (stateRef.current.modal = null)}>
        <div className="login card">
          <div className="card-header">
            <div className="flex center">
              <div className="special-link p-0" onClick={() => (authType.current = "login")}>
                Login
              </div>
              <span>|</span>
              <div className="special-link p-0" onClick={() => (authType.current = "register")}>
                Register
              </div>
            </div>
          </div>
          <div className="card-body">{authType.current === "login" ? <SpecialForm fields={formFields.current} /> : <SpecialForm fields={regFormFields.current} />}</div>
          <div className="card-footer">
            <div className="flex">
              {authType.current === "login" ? (
                <div className="special-btn" onClick={authLogin}>
                  Login
                </div>
              ) : (
                <div className="special-btn" onClick={authRegister}>
                  Register
                </div>
              )}
              <div className="special-btn" onClick={() => (stateRef.current.modal = null)}>
                Cancel
              </div>
            </div>
          </div>
        </div>
      </CustomModal>
    );
  };
};

let ProductTopNav = (props) => {
  async function search(q) {
    navigate(`/search?q=${q}`);
  }
  let { q } = useQuery();

  let searchTextRef = reactiveRef(q || "");

  return (
    <div>
      <div className="container mx-auto">
        <div className="flex flex-row py-2 px-5 lg:px-0">
          <div className="hidden lg:flex lg:w-1/2 items-center">
            <a href="" className="text-dark">
              FAQs
            </a>
            <span className="text-muted px-2">|</span>
            <a href="" className="text-dark">
              Help
            </a>
            <span className="text-muted px-2">|</span>
            <a href="" className="text-dark">
              Support
            </a>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end items-center">
            <a href="" className="text-dark px-2">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="" className="text-dark px-2">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="" className="text-dark px-2">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="" className="text-dark px-2">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="" className="text-dark pl-2">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
        <div className="flex flex-row items-center p-2 bg-secondary border-b">
          <div className="hidden lg:block mx-4 ">
            <a className="text-decoration-none" onClick={() => navigate("/")}>
              <h1 className="m-0 text-2xl font-semibold">
                <span className=" font-bold border px-3 mr-1">E</span>Shop
              </h1>
            </a>
          </div>
          <div className="relative flex">
            <input type="text" className="w-full py-2 px-4 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:border-primary" placeholder="Search for products" value={searchTextRef.current} onChange={(e) => (searchTextRef.current = e.target.value)} />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 " onClick={() => search(searchTextRef.current)}>
              <i className="fa fa-search"></i>
            </div>
          </div>
          <div className="grow"></div>
          <div className="flex items-center space-x-5 hidden md:flex px-4">
            <a className="flex text-gray-600 hover:text-blue-500 cursor-pointer transition-colors duration-300 center">
              <i className="fi fi-rr-user mr-2 flex"></i>Register
            </a>
            <a className="flex text-gray-600 cursor-pointer transition-colors duration-300 font-semibold text-blue-600 center" onClick={() => login()}>
              <i className="fi fi-rr-lock mr-2 flex"></i>Logins
            </a>
          </div>
          <div className="flex gap-2">
            <a href="" className="special-btn border center gap-2 px-4">
              <i className="fa fa-heart"></i>
              <span className="badge">0</span>
            </a>
            <a href="" className="special-btn border center gap-2 px-4">
              <i className="fa fa-shopping-cart"></i>
              <span className="badge">0</span>
            </a>
          </div>
        </div>
      </div>

      <div className="flex p-2 justify-center border-b shadow-md sticky top-0 bg-white bg-opacity-70 backdrop-blur-md">
        <div className="special-link" onClick={() => navigate("/home")}>
          Home
        </div>
        <div className="special-link" onClick={() => navigate("/discover")}>
          Discover
        </div>
        <div className="special-link" onClick={() => navigate("/hot")}>
          Hot
        </div>
        <div className="special-link" onClick={() => navigate("/latest")}>
          Latest
        </div>
      </div>
    </div>
  );
};
let Product = (props) => {
  let [product, setProduct] = useState({});
  let [temp, setTemp] = useState({});
  let { id } = useParams();
  let { path, url } = useRouteMatch();
  let query = useQuery();

  let { globalState } = useGlobalState();

  async function loadProduct() {
    let response = await tryFetch("/api/product/" + id);
    if (!response) response = {};
    setProduct(response);
  }
  useEffect(() => {
    console.log("loadProduct", id);
    loadProduct();
    globalState.cart = globalState.cart || [];
    temp.quantity = 0;
  }, []);

  return (
    product &&
    product.id && (
      <main className="my-8">
        <ProductTopNav />

        <div className="container mx-auto px-6 py-12">
          <div className="md:flex md:items-center">
            <div className="w-full center">
              <img className="aspect-video w-full rounded-md object-cover max-w-lg mx-auto" src={product.images?.[0] || "/images/noimage.png"} alt="Nike Air" />
            </div>
            <div className="w-full max-w-lg mx-auto mt-5 md:ml-8 md:mt-0 md:w-1/2">
              <h3 className="text-gray-700 uppercase text-lg">{product.name || "Product Name"}</h3>
              <span className="text-gray-500 mt-3">${product.price || "0.00"}</span>
              <hr className="my-3" />
              <div className="mt-2">
                <label className="text-gray-700 text-sm" for="count">
                  Count:
                </label>
                <div className="flex items-center mt-1">
                  <button className="text-gray-500 focus:outline-none focus:text-gray-600" onClick={() => temp.quantity++}>
                    <svg className="h-5 w-5" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </button>
                  <span className="text-gray-700 text-lg mx-2">{temp.quantity}</span>
                  <button className="text-gray-500 focus:outline-none focus:text-gray-600" onClick={() => temp.quantity > 0 && temp.quantity--}>
                    <svg className="h-5 w-5" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <label className="text-gray-700 text-sm" for="count">
                  Color:
                </label>
                <div className="flex items-center mt-1">
                  <button className="h-5 w-5 rounded-full bg-blue-600 border-2 border-blue-200 mr-2 focus:outline-none"></button>
                  <button className="h-5 w-5 rounded-full bg-teal-600 mr-2 focus:outline-none"></button>
                  <button className="h-5 w-5 rounded-full bg-pink-600 mr-2 focus:outline-none"></button>
                </div>
              </div>
              <div className="flex items-center mt-6">
                <button className="px-8 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-500 focus:outline-none focus:bg-indigo-500">Order Now</button>
                <button className="mx-2 text-gray-600 border rounded-md p-2 hover:bg-gray-200 focus:outline-none">
                  <svg className="h-5 w-5" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-16">
            <h3 className="text-gray-600 text-2xl font-medium">More Products</h3>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
              <div className="w-full max-w-sm mx-auto rounded-md shadow-md overflow-hidden">
                <div className="flex items-end justify-end h-56 w-full bg-cover" style={styleToObject(`background-image: url('https://images.unsplash.com/photo-1563170351-be82bc888aa4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=376&q=80')`)}>
                  <button className="p-2 rounded-full bg-blue-600 text-white mx-5 -mb-4 hover:bg-blue-500 focus:outline-none focus:bg-blue-500">
                    <svg className="h-5 w-5" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </button>
                </div>
                <div className="px-5 py-3">
                  <h3 className="text-gray-700 uppercase">Chanel</h3>
                  <span className="text-gray-500 mt-2">$12</span>
                </div>
              </div>
              <div className="w-full max-w-sm mx-auto rounded-md shadow-md overflow-hidden">
                <div className="flex items-end justify-end h-56 w-full bg-cover" style={styleToObject(`background-image: url('https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80')`)}>
                  <button className="p-2 rounded-full bg-blue-600 text-white mx-5 -mb-4 hover:bg-blue-500 focus:outline-none focus:bg-blue-500">
                    <svg className="h-5 w-5" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </button>
                </div>
                <div className="px-5 py-3">
                  <h3 className="text-gray-700 uppercase">Man Mix</h3>
                  <span className="text-gray-500 mt-2">$12</span>
                </div>
              </div>
              <div className="w-full max-w-sm mx-auto rounded-md shadow-md overflow-hidden">
                <div className="flex items-end justify-end h-56 w-full bg-cover" style={styleToObject(`background-image: url('https://images.unsplash.com/photo-1532667449560-72a95c8d381b?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80')`)}>
                  <button className="p-2 rounded-full bg-blue-600 text-white mx-5 -mb-4 hover:bg-blue-500 focus:outline-none focus:bg-blue-500">
                    <svg className="h-5 w-5" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </button>
                </div>
                <div className="px-5 py-3">
                  <h3 className="text-gray-700 uppercase">Classic watch</h3>
                  <span className="text-gray-500 mt-2">$12</span>
                </div>
              </div>
              <div className="w-full max-w-sm mx-auto rounded-md shadow-md overflow-hidden">
                <div className="flex items-end justify-end h-56 w-full bg-cover" style={styleToObject(`background-image: url('https://images.unsplash.com/photo-1590664863685-a99ef05e9f61?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=345&q=80')`)}>
                  <button className="p-2 rounded-full bg-blue-600 text-white mx-5 -mb-4 hover:bg-blue-500 focus:outline-none focus:bg-blue-500">
                    <svg className="h-5 w-5" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </button>
                </div>
                <div className="px-5 py-3">
                  <h3 className="text-gray-700 uppercase">woman mix</h3>
                  <span className="text-gray-500 mt-2">$12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  );
};

let Admin = (props) => {
  return (
    <div className="text-emerald-500 full">
      <div className="text-4xl " onClick={() => state.count++}>
        Admin {state.count}
      </div>
      <div className="my-10"></div>
      <Switch>
        <Route exact path={`/admin`}>
          <div>
            <div className="flex justify-center flex-wrap">
              <a className="special-link p-4 min-w-32 shadow border col center" onClick={() => navigate("/admin/users")}>
                <i className="fi fi-rr-users"></i>
                Users
              </a>
              <a className="special-link p-4 min-w-32 shadow border col center" onClick={() => navigate("/admin/products")}>
                <i className="fi fi-rr-shopping-bag"></i>
                Products
              </a>
            </div>
          </div>
        </Route>
        <Route path={`/admin/users`}>
          <Users />
        </Route>
        <Route path={`/admin/products`}>
          <Products />
        </Route>
      </Switch>
    </div>
  );
};

let Products = (props) => {
  let endpoint = "/api/product";
  let rowsRef = reactiveRef(null);
  async function loadRows(options) {
    rowsRef.current = cons(await tryFetch(endpoint));
  }
  async function postRandom() {
    await tryFetch(endpoint, {
      method: "POST",
      body: getFormData(fakeProduct(), await Promise.all([1, 1, 1].map(() => fakeImage()))),
      headers: {},
    });
    cons(rowsRef.current);
  }
  async function reset() {
    await tryFetch(endpoint, { method: "DELETE" });
  }
  async function deleteRow(id) {
    await tryFetch(endpoint + "/" + id, { method: "DELETE" });
  }
  function setRows(params) {
    rowsRef.current = params;
  }
  async function create() {
    let params = await showModal(columns);
    console.log(params);
    await tryFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(params),
    });
    loadRows();
  }
  async function edit(row) {
    let params = await showModal(columns.map((item) => ({ ...item, value: row[item.name] })));
    console.log(params);
    await tryFetch(endpoint + "/" + row.id, {
      method: "PATCH",
      body: JSON.stringify(params),
    });
    loadRows();
  }
  let columns = [
    { type: "checkbox" },
    {
      name: "images",
      render: (row) => (
        <div className="row gap-1 overflow-auto">
          {row.images?.map((image) => (
            <img className="w-10 aspect-video rounded" src={image} />
          ))}
        </div>
      ),
    },
    { name: "name" },
    { name: "price" },
    { name: "description", render: (row) => <div className="line-clamp-2 max-w-xs">{row.description}</div> },
    {
      name: "Actions",
      render: (row) => (
        <div className="flex">
          <div
            className="cursor-pointer font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick={() => {
              edit(row);
            }}
          >
            Edit
          </div>
          <a
            className="font-medium text-red-600 dark:text-red-500 hover:underline ms-3"
            onClick={async () => {
              await deleteRow(row.id);
              await loadRows();
            }}
          >
            Remove
          </a>
        </div>
      ),
    },
  ];

  return <CRUDTable columns={columns} rows={rowsRef.current} setRows={setRows} loadRows={loadRows} postRandom={postRandom} create={create} reset={reset} />;
};

let Users = (props) => {
  let rowsRef = reactiveRef(null);
  async function loadRows(options) {
    rowsRef.current = cons(await tryFetch("/api/user"));
  }
  async function postRandom() {
    await tryFetch("/api/user", {
      method: "POST",
      body: getFormData(fakeUser(), [await downloadImageAsBlob(fakeUser().avatar)]),
      headers: {},
    });
    cons(rowsRef.current);
  }
  async function reset() {
    await tryFetch("/api/user", { method: "DELETE" });
  }
  async function deleteRow(id) {
    await tryFetch("/api/user/" + id, { method: "DELETE" });
  }
  function setRows(params) {
    rowsRef.current = params;
  }
  async function create() {
    let params = await showModal(columns);
    console.log(params);
    await tryFetch("/api/user", {
      method: "POST",
      body: JSON.stringify(params),
    });
    loadRows();
  }
  async function edit(row) {
    let params = await showModal(columns.map((item) => ({ ...item, value: row[item.name] })));
    console.log(params);
    await tryFetch("/api/user/" + row.id, {
      method: "PATCH",
      body: JSON.stringify(params),
    });
    loadRows();
  }
  let columns = [
    { type: "checkbox" },
    { name: "avatar", render: (row) => <img className="w-10 aspect-square rounded-full" src={row.avatar} /> },
    { name: "name" },
    { name: "email" },
    { name: "password" },
    { name: "Balance" },
    { name: "bio", render: (row) => <div className="line-clamp-2 max-w-xs">{row.bio}</div> },
    {
      name: "Actions",
      render: (row) => (
        <div className="flex">
          <div
            className="cursor-pointer font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick={() => {
              edit(row);
            }}
          >
            Edit
          </div>
          <a
            className="font-medium text-red-600 dark:text-red-500 hover:underline ms-3"
            onClick={async () => {
              await deleteRow(row.id);
              await loadRows();
            }}
          >
            Remove
          </a>
        </div>
      ),
    },
  ];

  return <CRUDTable columns={columns} rows={rowsRef.current} setRows={setRows} loadRows={loadRows} postRandom={postRandom} create={create} reset={reset} />;
};
let CRUDTable = ({ loadRows, postRandom, create, reset, columns, rows, setRows }) => {
  // loadRows = loadRows || (() => {});
  setRows = setRows || (() => []);

  let [loading, setLoading] = useState({});

  useEffect(() => {
    // cons("rows", rows);
  }, []);

  let createOriginal = create;
  create = async () => {
    if (!createOriginal) return notify("Not Implemented!");
    loading["create"] = 1;
    await createOriginal();
    await loadRows();
    loading["create"] = 0;
  };
  let postRandomOriginal = postRandom;
  postRandom = async () => {
    if (!postRandomOriginal) return notify("Not Implemented!");
    loading["postRandom"] = 1;
    await postRandomOriginal();
    await loadRows();
    loading["postRandom"] = 0;
  };
  let resetOriginal = reset;
  reset = async () => {
    if (!resetOriginal) return notify("Not Implemented!");
    loading["reset"] = 1;
    await resetOriginal();
    await loadRows();
    loading["reset"] = 0;
  };

  React.useEffect(() => {
    loadRows();
  }, []);
  return (
    <div className="full">
      <div className="flex items-start my-4 justify-between w-full overflow-auto">
        <div>
          <div className="flex gap-2 items w-full m-1">
            <div className={`${"special-btn center"}`}>
              <div className="">Action</div>
              <i className="flex fi fi-rr-angle-down"></i>
            </div>
            <button onClick={() => create()} className={`${"special-btn center"}`}>
              <div>Add New</div>
              <i className="flex fi fi-rr-plus"></i>
            </button>
            <button
              onClick={async () => {
                postRandom();
              }}
              className={`${"special-btn center"} ${loading["postRandom"] && "quick-loading"}`}
              type="button"
            >
              <div>Add Random</div>
              <i className="flex fi fi-rr-shuffle"></i>
            </button>
            <button onClick={() => reset()} className={`${"special-btn center"} ${loading["reset"] && "quick-loading"}`} type="button">
              <div>Reset</div>
              <i className="flex fi fi-rr-trash"></i>
            </button>
            <button
              onClick={async () => {
                loading["loadRows"] = true;
                setLoading({ ...loading });
                await loadRows();
                loading["loadRows"] = false;
                setLoading({ ...loading });
              }}
              className={`${"special-btn center"} ${loading["loadRows"] && "quick-loading"}`}
              type="button"
            >
              <div>Refresh</div>
              <i className="flex fi fi-rr-refresh" />
            </button>
          </div>
          <div id="dropdownAction" className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
            <ul className="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownActionButton">
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                  Reward
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                  Promote
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                  Activate account
                </a>
              </li>
            </ul>
            <div className="py-1">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
                Delete Items
              </a>
            </div>
          </div>
        </div>
      </div>
      <label htmlFor="table-search" className="sr-only">
        Search
      </label>
      <div className="relative full">
        <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
          </svg>
        </div>
        <input type="text" id="table-search-users" className="block p-2 ps-10 text-sm border border-gray-300 rounded-lg full" placeholder="Search..." />
      </div>
      <div className="overflow-x-auto ">
        <table className=" w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 border">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {columns.map((item, index) => {
                return (
                  <th scope="col" className="px-6 py-4 min-w-12 max-w-80" key={index}>
                    {(() => {
                      if (item.type == "checkbox")
                        return (
                          <div className="flex items-center">
                            <input
                              id="checkbox-all-search"
                              type="checkbox"
                              onChange={(e) => {
                                rows?.map((row) => (row.checked = rows.every((row) => e.target.checked)));
                                setRows([...rows]);
                              }}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label htmlFor="checkbox-all-search" className="sr-only">
                              checkbox
                            </label>
                          </div>
                        );
                      return item.name && typeof item.name == "string" ? item.name : item.name(item);
                    })()}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {(rows &&
              rows?.map((row, rowindex) => {
                return (
                  <tr key={rowindex} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    {columns.map((item, index) => {
                      return (
                        <td className="px-6 py-4 min-w-12 max-w-80" key={index}>
                          {(() => {
                            if (item.type == "checkbox")
                              return (
                                <div className="flex items-center">
                                  <input id="checkbox-table-search-1" type="checkbox" defaultChecked={row.checked} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                  <label htmlFor="checkbox-table-search-1" className="sr-only">
                                    checkbox
                                  </label>
                                </div>
                              );
                            return item.render ? item.render(row) : row[item.name?.toLowerCase()] ? row[item.name?.toLowerCase()] : "---";
                          })()}
                        </td>
                      );
                    })}
                  </tr>
                );
              })) || (
              <tr className="">
                <td colspan="100%">
                  <div className="quick-loading p-4">Loading...</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto">
          Showing
          <span className="font-semibold text-gray-900 dark:text-white">1-10</span> of <span className="font-semibold text-gray-900 dark:text-white">{rows?.length || 0}</span>
        </span>
        <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
          <li>
            <a href="#" className="flex items-center justify-center px-2 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
              Previous
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center justify-center px-2 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
              1
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center justify-center px-2 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
              2
            </a>
          </li>
          <li>
            <a href="#" aria-current="page" className="flex items-center justify-center px-2 h-8 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white">
              3
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center justify-center px-2 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
              4
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center justify-center px-2 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
              5
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center justify-center px-2 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
              Next
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};
