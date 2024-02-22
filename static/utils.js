const consoleWarn = console.error;
const SUPPRESSED_WARNINGS = ["Warning: A component is changing an uncontrolled", "Warning: Invalid DOM property", 'Each child in a list should have a unique "key" prop'];

console.error = function filterWarnings(msg, ...args) {
  if (!SUPPRESSED_WARNINGS.some((entry) => msg.includes(entry))) {
    consoleWarn(msg, ...args);
  }
};

window.onerror = function (msg, url, lineNo, columnNo, error) {
  alertify.error(msg + "\n" + url + "\n" + lineNo + "\n" + columnNo + "\n" + error);
};

window.notify = alertify.success;
let { Layout: TheFlexLayout, Model } = FlexLayout;

const { useState, useEffect, useLayoutEffect, useRef, createContext, useContext, useMemo } = React;

const { BrowserRouter, Link, Route, Routes, Switch, useHistory, useLocation, useParams, useRouteMatch } = ReactRouterDOM;
function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => Object.fromEntries([...new URLSearchParams(search)]), [search]); // q.get("name")
}

function fakeUser() {
  return {
    avatar: faker.image.avatar(),
    name: faker.person.firstName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    phone: faker.phone.number(),
    balance: faker.finance.amount(0, 1000, 2),
    bio: faker.person.bio(),
  };
}
function fakeProduct() {
  return {
    image: faker.image.urlLoremFlickr({ category: "clothes" }),
    name: faker.commerce.productName(),
    price: faker.commerce.price(),
    description: faker.commerce.productDescription(),
  };
}

async function fakeImage() {
  return await downloadImageAsBlob(faker.image.urlLoremFlickr({ category: "random" }));
}

let safeStringify = function (...args) {
  let replacer = ((obj) => {
    let cache = [];
    return (key, value) =>
      typeof value === "object" && value !== null
        ? cache.includes(value)
          ? undefined // Duplicate reference found, discard key
          : cache.push(value) && value // Store value in our collection
        : value;
  })();
  return JSON.stringify(args[0], replacer, ...args.slice(2));
};

let safeParse = function (...args) {
  try {
    return JSON.parse(args[0]);
  } catch (e) {
    console.error(e);
    return {};
  }
};
let BACKEND_URL = window.location.origin;

function cons(...args) {
  console.log(...args);
  return args[0];
}
let poll = async (fn, t) => {
  while (1) {
    if (await fn()) return;
    await new Promise((r) => setTimeout(r, t || 200));
  }
};

function tryParseJSON(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return {};
  }
}
function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === "[object Function]";
}
function isJSONObject(obj) {
  if ([Date, RegExp, Error].some((t) => obj instanceof t)) {
    return false;
  }
  try {
    JSON.stringify(obj);
    return obj && typeof obj == "object";
  } catch (e) {
    return false;
  }
}

async function makeSureImport(url) {
  let jsxCode;
  try {
    jsxCode = await (await fetch(url)).text();
    const transpiledCode = Babel.transform(jsxCode, {
      presets: ["es2015", "react"],
    }).code;
    eval(transpiledCode);
  } catch (err) {
    console.log(err);
    return 0;
  }
  return 1;
}

function styleToObject(style) {
  if (!style) return null;
  let obj = {};
  style.split(";").forEach((s) => {
    let keyval = s.split(":");
    let [key, value] = [keyval[0], keyval.slice(1).join(":")];
    key = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    obj[key.trim()] = value.trim();
  });
  return obj;
}
String.prototype.toTitleCase = function () {
  let str = this.toLowerCase();
  str = str.split(" ");
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
};
function getFormData(obj, files) {
  let formData = new FormData();
  // for (let key in obj) {
  //     formData.append(key, obj[key]);
  // }
  formData.append("bodyString", JSON.stringify(obj));
  files.forEach((file, index) => {
    formData.append(`files`, file); // these fields will be parsed into req.files
  });
  return formData;
}
async function downloadImageAsBlob(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  // rename the blob file
  const renamedBlob = new File([blob], "newFileName.jpg");
  return renamedBlob;
}

let tryFetch = async (url, options = {}, log = false) => {
  options = {
    credentials: "include",
    headers:
      options?.method == "GET"
        ? {}
        : {
            "Content-Type": "application/json",
          },
    ...options,
  };
  let res;
  try {
    let response = await fetch(BACKEND_URL + url, options);
    res = await response.json();
    if (log) console.log(">", url, res);
    return response.ok ? res : null;
  } catch (e) {
    try {
      let response = await fetch(BACKEND_URL + url, options);
      res = await response.text();
      if (log) console.log(">", url, res);
      return response.ok ? res : null;
    } catch (e) {
      console.log(">", url, e.message);
      return null;
    }
  }
};

window.setters = window.setters || [];

const reactiveRef = (init) => {
  let [val, setVal] = useState(init);
  let ref = useRef(val);
  ref.current = val;
  if (!window.setters.find((item) => item.ref == ref))
    window.setters.push({
      ref,
      setState: () => {
        if (!isJSONObject(ref.current) && !isFunction(ref.current)) setVal(ref.current);
        else {
          if (Array.isArray(ref.current)) setVal([...ref.current]);
          else {
            // console.log('object')
            setVal({ ...ref.current });
          }
        }
      },
    });
  return ref;
};

let nextTickResolvers = [];
let nextTick = () => new Promise((r) => nextTickResolvers.push(r));

let NextTick = ({ children, t }) => {
  let [countId, setCountId] = React.useState(0);
  useEffect(() => {
    window.updateAll = async (t) => {
      window.setters.forEach((item) => item.setState());
    };
  }, []);
  useEffect(() => {
    (async () => {
      await new Promise((r) => setTimeout(r, t || 10));
      setCountId(countId + 1);
      while (nextTickResolvers.length) nextTickResolvers.pop()();
      window.updateAll();
    })();
  }, [countId]);
  return children;
};

let GlobalStateContext = createContext({});
let GlobalStateContextProvider = ({ children }) => {
  let stateRef = reactiveRef({ count: 90 });
  let persistRef = useLocalStorage("persitedState", {});
  window.stateRef = stateRef;
  window.state = stateRef.current;
  window.persistRef = persistRef;
  window.persist = persistRef.current;

  let history = useHistory();
  window.navigate = (...args) => {
    if (typeof args[0] == "number") return history.go(args[0]);
    history.push(...args);
  };

  return <GlobalStateContext.Provider value={{ state }}> {children}</GlobalStateContext.Provider>;
};

let useLocalStorage = (keyName, defaultValue) => {
  let value;
  try {
    value = window.localStorage.getItem(keyName);
    if (value) {
      value = JSON.parse(value);
    } else {
      value = defaultValue;
    }
  } catch (err) {
    value = defaultValue;
  }
  let stateRef = reactiveRef(value);
  React.useEffect(() => {
    try {
      localStorage[keyName] = safeStringify(stateRef.current);
    } catch (err) {
      console.log(err);
    }
  }, [stateRef.current]);

  return stateRef;
};

function useCtx() {
  return useContext(GlobalStateContext);
}

let NotFound = (props) => {
  return (
    <div className="col gap-6 text-emerald-500 text-medium center full py-20">
      Route: {useLocation().pathname}
      <div className="text-4xl text-red-500 center gap-2">
        <i className="fi fi-rr-triangle-warning flex"></i>
        404 Not Found
      </div>
      <div className="flex gap-2">
        <a className="special-btn" onClick={() => navigate("/")}>
          Go Home
        </a>
        <a className="special-btn" onClick={() => navigate(-1)}>
          Go Back
        </a>
      </div>
    </div>
  );
};
let CustomModal = ({ open, onClose, children }) => {
  let show, setShow;
  show = open;
  const toggle = () => {
    onClose();
  };
  const [domReady, setDomReady] = React.useState(false);

  React.useEffect(() => {
    setDomReady(true);
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "";
    };
  }, []);
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = getScrollBarWidth() + "px";
    } else {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "";
    }
  }, [open]);
  function getScrollBarWidth() {
    let el = document.createElement("div");
    el.style.cssText = "overflow:scroll; visibility:hidden; position:absolute;";
    document.body.appendChild(el);
    let width = el.offsetWidth - el.clientWidth;
    el.remove();
    return width;
  }

  return (
    domReady &&
    ReactDOM.createPortal(
      show ? (
        // <div className={`${show ? "block" : "hidden"} grid place-items-center fixed top-0 left-0 z-50 h-screen w-screen bg-black/25 dark:bg-white/25 overscroll-none overflow-auto `} onClick={() => onClose && onClose(open)}>
        <div className={`${show ? "flex" : "hidden"} border-8 flex flex-col items-center justify-center fixed top-0 left-0 z-50 h-screen w-screen bg-black/25 dark:bg-white/25 overscroll-none overflow-auto `} onClick={() => onClose && onClose(open)}>
          {Array.isArray(children) ? (
            children.map((item, index) => {
              return <item.type {...item.props} key={index} onClick={(e) => e.stopPropagation()} />;
            })
          ) : (
            <children.type {...children.props} onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      ) : null,
      document.body
    )
  );
};

function WithAsync({ children, resolver, placeholder }) {
  let [resolved, setResolved] = useState(false);
  useEffect(() => {
    (async () => {
      console.log("resolved");
      await poll(resolver);
      setResolved(true);
    })();
  }, []);

  return (
    <div>
      {!resolved
        ? placeholder || (
            <div className="text-xs full border border-green-500 bg-green-100 p-2 break-words w-screen text-green-500 font-bold">
              <div className="font-mono">[Async Component] Loading...</div>
            </div>
          )
        : children}
    </div>
  );
}

class WithError extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    let total = 5000;
    this.setState({ hasError: true, error, errorInfo, remaining: total });

    (async () => {
      let steps = 51;
      let st = steps;
      while (st--) {
        await new Promise((r) => setTimeout(r, total / steps));
        this.setState({
          ...this.state,
          remaining: (this.state.remaining - total / steps).toFixed(2),
        });
      }
      console.log("error", error);
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        remaining: 0,
      });
    })();
  }
  componentDidMount() {}

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-xs full border border-red-500 bg-red-100 p-2 break-words w-screen ">
          <div className="font-mono">Retrying in {this.state.remaining}ms</div>
          <pre className="whitespace-pre-wrap">
            <div className="text-red-500 text-lg font-bold">{this.state.error.toString()}</div>
            <div className="">{this.state.errorInfo?.componentStack.split("\n").slice(0, 5).join("\n") || "Stack finding error"}</div>
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

let original_createElement = window.original_createElement || React.createElement;
let mod_createElement = (...args) => {
  if (args[0]) {
    if (args[0] && args[0].name && !args[1]?.path && isFunction(args[0]) && args[0].name != "WithError") {
      // console.log('w error', args[0].name, args)
      return <WithError>{original_createElement(...args)}</WithError>;
    }
  }
  return original_createElement(...args);
};
React.createElement = mod_createElement;

if (!window.root) {
  window.root = ReactDOM.createRoot(document.querySelector("#root"));
} else {
  window.root.unmount && window.root.unmount();
  window.root = ReactDOM.createRoot(document.querySelector("#root"));
}
