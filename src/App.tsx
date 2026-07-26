import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link } from "react-router";
import {
  Gamepad2,
  Zap,
  Shield,
  Truck,
  Star,
  ChevronDown,
  Check,
  Mail,
  Menu,
  X,
  Wrench,
  Landmark,
  Loader2,
  Package,
  ClipboardList,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

/* ============================================================
   SETTINGS — easy to edit
   ============================================================ */
const SHIPPING_COST = 4.95; // shipping fee in EUR
const FREE_SHIPPING_FROM = 90; // free shipping from this subtotal
const BANK_ACCOUNT = "BE40 9735 0579 9763"; // payment account

type Product = {
  id: string;
  name: string;
  price: number;
  img: string;
  color: string;
  tag?: string;
  desc: string;
};

type Paddle = {
  id: string;
  name: string;
  price: number;
  img: string;
  color: string;
  tag?: string;
};

/* Controllers (base models for the configurator)
   Single color = €80 · Two or more colors = €100 */
const products: Product[] = [
  { id: "classic-white", name: "Classic White", price: 79.99, img: "/images/controllers/classic-white.jpg", color: "from-slate-300 to-slate-500", desc: "The timeless original DualSense look." },
  { id: "midnight-black", name: "Midnight Black", price: 79.99, img: "/images/controllers/midnight-black.jpg", color: "from-zinc-600 to-black", tag: "Best Seller", desc: "Sleek all-black official finish." },
  { id: "chameleon-blue", name: "Chameleon Blue", price: 99.99, img: "/images/controllers/chameleon-blue.jpg", color: "from-indigo-500 to-blue-700", desc: "Metallic blue-purple color-shifting shell." },
  { id: "pearl-white", name: "Pearl White", price: 99.99, img: "/images/controllers/pearl-white.jpg", color: "from-slate-200 to-purple-200", desc: "Iridescent pearl finish that shifts in the light." },
  { id: "chameleon-emerald", name: "Chameleon Emerald", price: 99.99, img: "/images/controllers/chameleon-emerald.jpg", color: "from-emerald-500 to-teal-700", desc: "Metallic green-teal color-shifting shell." },
  { id: "inferno-red", name: "Inferno Red", price: 99.99, img: "/images/controllers/inferno-red.jpg", color: "from-red-500 to-black", desc: "Fiery red shell with a black fade top." },
  { id: "venom-green", name: "Venom Green", price: 99.99, img: "/images/controllers/venom-green.jpg", color: "from-lime-400 to-black", desc: "Toxic green shell with a black fade top." },
  { id: "frost-blue", name: "Frost Blue", price: 99.99, img: "/images/controllers/frost-blue.jpg", color: "from-sky-400 to-black", desc: "Ice-cold blue shell with a black fade top." },
];

/* Back paddles */
const paddles: Paddle[] = [
  { id: "chameleon-purple", name: "Chameleon Purple", price: 54.99, img: "/images/paddles/chameleon-purple.jpg", color: "from-purple-400 to-blue-500", tag: "Popular" },
  { id: "chameleon-green", name: "Chameleon Green", price: 54.99, img: "/images/paddles/chameleon-green.jpg", color: "from-teal-400 to-purple-500" },
  { id: "chrome-gold", name: "Chrome Gold", price: 54.99, img: "/images/paddles/chrome-gold.jpg", color: "from-amber-400 to-yellow-600", tag: "Premium" },
  { id: "arctic-white", name: "Arctic White Grip", price: 64.99, img: "/images/paddles/arctic-white.jpg", color: "from-slate-200 to-slate-400" },
  { id: "stealth-black", name: "Stealth Black", price: 64.99, img: "/images/paddles/stealth-black.jpg", color: "from-zinc-600 to-black" },
];

const faqs = [
  {
    q: "What are back buttons?",
    a: "Back buttons (paddles) are extra buttons on the rear of the controller. You can map them to any face button, so you never have to take your thumbs off the sticks — perfect for competitive shooters like Call of Duty and Fortnite.",
  },
  {
    q: "Can I order a back paddle separately?",
    a: "Yes! In the Backpaddles section you can order a paddle kit on its own, or add one to a controller in the Build Your Controller configurator.",
  },
  {
    q: "Are these official Sony controllers?",
    a: "Yes. Every build starts from a brand-new official Sony DualSense controller, which we then customize with a new shell and back buttons.",
  },
  {
    q: "How much is shipping?",
    a: `Shipping is €${SHIPPING_COST.toFixed(2)} and completely free on orders of €${FREE_SHIPPING_FROM} or more. Production takes 3–5 business days, plus 2–4 business days shipping within Belgium and the EU.`,
  },
  {
    q: "How do I pay?",
    a: `After placing your order you receive our payment details. You pay by bank transfer (Visa or Bancontact) to ${BANK_ACCOUNT}. Your order goes into production as soon as payment arrives.`,
  },
  {
    q: "Is there a warranty?",
    a: "Every controller and back paddle comes with a 2-month warranty on the back buttons and customization, on top of Sony's standard hardware warranty.",
  },
];

/* ---------- helpers ---------- */
const fmt = (n: number) => `€${n.toFixed(2).replace(".", ",")}`;
const shippingFor = (subtotal: number) =>
  subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;

type OrderDraft = {
  title: string;
  img?: string;
  lines: { label: string; amount: number | null }[];
  subtotal: number;
  shipping: number;
  total: number;
};

/* ---------- Order modal with real form ---------- */
function OrderModal({ order, onClose }: { order: OrderDraft; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [payMethod, setPayMethod] = useState<"visa" | "bancontact">("bancontact");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (data) => setOrderId(data.orderId),
    onError: () => setError("Something went wrong. Please try again."),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const items = order.lines
      .filter((l) => l.amount !== null)
      .map((l) => `${l.label} — ${fmt(l.amount!)}`)
      .join("\n");
    createOrder.mutate({
      customerName: name,
      email,
      address,
      paymentMethod: payMethod,
      items: `${order.title}\n${items}`,
      subtotal: Math.round(order.subtotal * 100),
      shipping: Math.round(order.shipping * 100),
      total: Math.round(order.total * 100),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-[#14141c] border border-white/10 rounded-2xl max-w-md w-full p-6 my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold">{orderId ? "Order Placed!" : order.title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderId ? (
          <div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-5 text-center">
              <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-300 font-semibold">Thank you, {name.split(" ")[0]}!</p>
              <p className="text-white/60 text-sm mt-1">Your order #{orderId} has been received.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-5">
              <p className="flex items-center gap-2 font-bold mb-3">
                <Landmark className="w-5 h-5 text-violet-400" /> Pay by bank transfer
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/50">Account</span><span className="font-mono font-bold">{BANK_ACCOUNT}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Amount</span><span className="font-bold">{fmt(order.total)}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Reference</span><span className="font-semibold">Order #{orderId}</span></div>
              </div>
              <p className="text-xs text-white/40 mt-3">
                Pay with {payMethod === "visa" ? "Visa" : "Bancontact"} via your bank app using the details above. Your order goes into production as soon as payment arrives.
              </p>
            </div>
            <button onClick={onClose} className="w-full bg-violet-600 hover:bg-violet-500 py-3.5 rounded-full font-bold transition">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            {order.img && (
              <img src={order.img} alt="" className="w-full aspect-square object-cover rounded-xl mb-4" />
            )}
            <div className="space-y-1.5 text-sm mb-4">
              {order.lines.map((l) => (
                <div key={l.label} className="flex justify-between">
                  <span className="text-white/60">{l.label}</span>
                  <span>{l.amount === null ? "—" : fmt(l.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-white/60">Shipping</span>
                <span className={order.shipping === 0 ? "text-green-400 font-semibold" : ""}>
                  {order.shipping === 0 ? "FREE" : fmt(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-extrabold">
                <span>Total</span>
                <span>{fmt(order.total)}</span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-white/30 focus:border-violet-500 focus:outline-none"
              />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-white/30 focus:border-violet-500 focus:outline-none"
              />
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Delivery address (street, number, city, postal code)"
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-white/30 focus:border-violet-500 focus:outline-none resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                {(["bancontact", "visa"] as const).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setPayMethod(m)}
                    className={`py-3 rounded-xl border font-semibold text-sm capitalize transition ${
                      payMethod === m
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    {m === "visa" ? "Visa" : "Bancontact"}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <button
              type="submit"
              disabled={createOrder.isPending}
              className="w-full bg-violet-600 hover:bg-violet-500 py-3.5 rounded-full font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createOrder.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Place Order — {fmt(order.total)}
            </button>
            <p className="text-center text-xs text-white/40 mt-3">
              You'll receive our payment details after ordering. Pay by bank transfer (Visa / Bancontact).
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------- Shop page ---------- */
function Shop() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [order, setOrder] = useState<OrderDraft | null>(null);
  const [paidBanner, setPaidBanner] = useState(
    () => new URLSearchParams(window.location.search).get("payment") === "success"
  );

  // After returning from Stripe, sync the payment status in the background
  const paidOrderId = useMemo(() => {
    const v = new URLSearchParams(window.location.search).get("order");
    return v ? Number(v) : null;
  }, []);
  const checkPayment = trpc.orders.checkPayment.useQuery(
    { orderId: paidOrderId ?? 0 },
    { enabled: paidOrderId !== null, retry: false }
  );
  useEffect(() => {
    if (checkPayment.data && checkPayment.data.status !== "paid") {
      setPaidBanner(false);
    }
  }, [checkPayment.data]);

  /* Configurator state */
  const [cfgController, setCfgController] = useState<Product>(products[0]);
  const [cfgPaddle, setCfgPaddle] = useState<Paddle | null>(null);

  const cfg = useMemo(() => {
    const subtotal = cfgController.price + (cfgPaddle?.price ?? 0);
    const shipping = shippingFor(subtotal);
    return { subtotal, shipping, total: subtotal + shipping };
  }, [cfgController, cfgPaddle]);

  const orderController = (p: Product) =>
    setOrder({
      title: `Order: ${p.name}`,
      img: p.img,
      lines: [{ label: `${p.name} controller`, amount: p.price }],
      subtotal: p.price,
      shipping: shippingFor(p.price),
      total: p.price + shippingFor(p.price),
    });

  const orderPaddle = (p: Paddle) =>
    setOrder({
      title: `Order: ${p.name} Back Paddle`,
      img: p.img,
      lines: [{ label: `${p.name} back paddle kit`, amount: p.price }],
      subtotal: p.price,
      shipping: shippingFor(p.price),
      total: p.price + shippingFor(p.price),
    });

  const orderBuild = () =>
    setOrder({
      title: "Order: Custom Build",
      lines: [
        { label: `${cfgController.name} controller`, amount: cfgController.price },
        { label: cfgPaddle ? `${cfgPaddle.name} back paddle` : "No backpaddle", amount: cfgPaddle?.price ?? null },
      ],
      subtotal: cfg.subtotal,
      shipping: cfg.shipping,
      total: cfg.total,
    });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      {paidBanner && (
        <div className="fixed top-20 inset-x-4 sm:inset-x-auto sm:right-6 z-[90] bg-green-500/15 border border-green-500/40 rounded-2xl p-5 max-w-sm shadow-xl">
          <div className="flex items-start gap-3">
            <Check className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-green-300">Payment successful!</p>
              <p className="text-sm text-white/60 mt-1">
                Thank you! Your payment has been received — your order now goes into production.
              </p>
            </div>
            <button onClick={() => setPaidBanner(false)} className="p-1 hover:bg-white/10 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <a href="#top" className="flex items-center gap-2 font-bold text-lg">
            <Gamepad2 className="w-6 h-6 text-violet-500" />
            Custom<span className="text-violet-500">PS</span>Controllers
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm text-white/70">
            <a href="#shop" className="hover:text-white transition">Controllers</a>
            <a href="#backpaddles" className="hover:text-white transition">Backpaddles</a>
            <a href="#configurator" className="hover:text-white transition">Build Yours</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
            <a
              href="#configurator"
              className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-full font-semibold transition"
            >
              Order Now
            </a>
          </nav>
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {menuOpen && (
          <nav className="md:hidden border-t border-white/10 bg-[#0a0a0f] px-4 py-4 flex flex-col gap-4 text-white/80">
            <a href="#shop" onClick={() => setMenuOpen(false)}>Controllers</a>
            <a href="#backpaddles" onClick={() => setMenuOpen(false)}>Backpaddles</a>
            <a href="#configurator" onClick={() => setMenuOpen(false)}>Build Yours</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          </nav>
        )}
      </header>

      {/* Hero */}
      <section id="top" className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.25),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-block bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            Hand-built in Belgium
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6">
            Custom PS5 Controllers
            <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              &amp; Pro Backpaddles
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
            Official DualSense controllers, rebuilt by hand with premium custom
            shells and remappable back buttons. Or upgrade your own controller
            with a backpaddle kit. Play faster. React quicker. Win more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#configurator"
              className="bg-violet-600 hover:bg-violet-500 px-8 py-4 rounded-full font-bold text-lg transition shadow-lg shadow-violet-600/30"
            >
              Build Your Controller
            </a>
            <a
              href="#backpaddles"
              className="border border-white/20 hover:border-white/40 px-8 py-4 rounded-full font-semibold text-lg transition"
            >
              Shop Backpaddles
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 mt-12 text-sm text-white/50 flex-wrap">
            <span className="flex items-center gap-2"><Truck className="w-4 h-4" /> Free shipping from €90</span>
            <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> 2-Month Warranty</span>
            <span className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> 4.9/5 from 200+ gamers</span>
          </div>
        </div>
      </section>

      {/* Controllers */}
      <section id="shop" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">Custom Controllers</h2>
          <p className="text-white/50 text-center mb-12 max-w-xl mx-auto">
            Hand-built controllers with custom shells — ready for your choice of backpaddle.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/50 hover:bg-white/[0.07] transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
                  {p.tag && (
                    <span className={`absolute top-3 left-3 z-10 bg-gradient-to-r ${p.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                      {p.tag}
                    </span>
                  )}
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                  <p className="text-white/50 text-sm mb-4 min-h-[2.5rem]">{p.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-extrabold">{fmt(p.price)}</span>
                    <button
                      onClick={() => orderController(p)}
                      className="bg-violet-600 hover:bg-violet-500 px-5 py-2.5 rounded-full text-sm font-bold transition"
                    >
                      Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Backpaddles */}
      <section id="backpaddles" className="py-20 px-4 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">Backpaddles</h2>
          <p className="text-white/50 text-center mb-12 max-w-xl mx-auto">
            Remappable 4-button back paddle kits for the PS5 DualSense — installed by us, or added to your custom controller.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paddles.map((p) => (
              <div
                key={p.id}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/50 hover:bg-white/[0.07] transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-square overflow-hidden">
                  {p.tag && (
                    <span className={`absolute top-3 left-3 z-10 bg-gradient-to-r ${p.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                      {p.tag}
                    </span>
                  )}
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold mb-3">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold">{fmt(p.price)}</span>
                    <button
                      onClick={() => orderPaddle(p)}
                      className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-full text-sm font-bold transition"
                    >
                      Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Configurator */}
      <section id="configurator" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Wrench className="w-10 h-10 text-violet-400 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Build Your Controller</h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Pick a controller, add a backpaddle of your choice and see your total instantly. Free shipping from €90.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-10">
              {/* Step 1 */}
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-extrabold">1</span>
                  Choose your controller
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setCfgController(p)}
                      className={`flex items-center gap-4 p-4 rounded-xl border text-left transition ${
                        cfgController.id === p.id
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/30"
                      }`}
                    >
                      <img src={p.img} alt={p.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-bold">{p.name}</p>
                        <p className="text-white/50 text-sm">{fmt(p.price)}</p>
                      </div>
                      {cfgController.id === p.id && <Check className="w-5 h-5 text-violet-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-extrabold">2</span>
                  Add a backpaddle <span className="text-white/40 text-sm font-normal">(optional)</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => setCfgPaddle(null)}
                    className={`p-4 rounded-xl border text-center transition ${
                      cfgPaddle === null
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    <p className="font-semibold text-sm">No backpaddle</p>
                    <p className="text-white/40 text-xs mt-1">+ €0</p>
                  </button>
                  {paddles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setCfgPaddle(p)}
                      className={`p-3 rounded-xl border text-center transition ${
                        cfgPaddle?.id === p.id
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/30"
                      }`}
                    >
                      <img src={p.img} alt={p.name} className="w-full aspect-square object-cover rounded-lg mb-2" />
                      <p className="font-semibold text-sm leading-tight">{p.name}</p>
                      <p className="text-white/40 text-xs mt-1">+ {fmt(p.price)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:sticky lg:top-24 h-fit bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-5">Your Build</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">{cfgController.name}</span>
                  <span>{fmt(cfgController.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">{cfgPaddle ? cfgPaddle.name : "No backpaddle"}</span>
                  <span>{cfgPaddle ? fmt(cfgPaddle.price) : "—"}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="text-white/60">Subtotal</span>
                  <span>{fmt(cfg.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Shipping</span>
                  <span className={cfg.shipping === 0 ? "text-green-400 font-semibold" : ""}>
                    {cfg.shipping === 0 ? "FREE" : fmt(cfg.shipping)}
                  </span>
                </div>
                {cfg.shipping > 0 && (
                  <p className="text-xs text-white/40">
                    Add {fmt(FREE_SHIPPING_FROM - cfg.subtotal)} more for free shipping.
                  </p>
                )}
                <div className="border-t border-white/10 pt-3 flex justify-between text-lg font-extrabold">
                  <span>Total</span>
                  <span>{fmt(cfg.total)}</span>
                </div>
              </div>
              <button
                onClick={orderBuild}
                className="mt-6 block w-full text-center bg-violet-600 hover:bg-violet-500 py-3.5 rounded-full font-bold transition"
              >
                Order This Build
              </button>
              <p className="text-center text-xs text-white/40 mt-3">
                Pay by bank transfer (Visa / Bancontact) after ordering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Why Back Buttons?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Faster Reactions",
                text: "Jump, slide or reload without ever moving your thumbs off the analog sticks. Milliseconds win gunfights.",
              },
              {
                icon: Gamepad2,
                title: "Fully Remappable",
                text: "Assign any button to the back paddles. Set it up once and it fits your playstyle — COD, Fortnite, FIFA, anything.",
              },
              {
                icon: Shield,
                title: "Built to Last",
                text: "Every back button is installed and stress-tested by hand. Covered by our 2-month warranty.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:border-violet-500/40 transition">
                <f.icon className="w-10 h-10 text-violet-400 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment banner */}
      <section className="py-14 px-4 bg-gradient-to-r from-violet-900/40 to-fuchsia-900/40 border-y border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <Landmark className="w-10 h-10 mx-auto mb-4 text-violet-300" />
          <h2 className="text-2xl font-bold mb-3">Secure Payment by Bank Transfer</h2>
          <p className="text-white/60 mb-6">
            After your order you receive our payment details — pay easily with Visa or Bancontact to:
          </p>
          <div className="inline-block bg-white/10 border border-white/20 px-8 py-4 rounded-2xl mb-6">
            <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Account number</p>
            <p className="font-mono font-extrabold text-xl tracking-wider">{BANK_ACCOUNT}</p>
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            {["Visa", "Bancontact"].map((m) => (
              <span key={m} className="bg-white/10 border border-white/20 px-6 py-2.5 rounded-full font-semibold text-sm">
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold hover:bg-white/5 transition"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {f.q}
                  <ChevronDown className={`w-5 h-5 shrink-0 ml-4 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <p className="px-6 pb-5 text-white/60 text-sm leading-relaxed">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center bg-[radial-gradient(ellipse_at_bottom,rgba(139,92,246,0.2),transparent_60%)]">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Level Up?</h2>
        <p className="text-white/50 mb-8">Limited stock — each controller is built by hand.</p>
        <a
          href="#configurator"
          className="inline-block bg-violet-600 hover:bg-violet-500 px-10 py-4 rounded-full font-bold text-lg transition shadow-lg shadow-violet-600/30"
        >
          Build Your Controller
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-4 text-center text-white/40 text-sm">
        <div className="flex items-center justify-center gap-2 font-bold text-white mb-3">
          <Gamepad2 className="w-5 h-5 text-violet-500" />
          Custom<span className="text-violet-500">PS</span>Controllers
        </div>
        <p className="mb-2 flex items-center justify-center gap-1">
          <Mail className="w-4 h-4" /> custom.pscontrollers@hotmail.com
        </p>
        <p>© {new Date().getFullYear()} CustomPSControllers. Not affiliated with Sony Interactive Entertainment.</p>
        <Link to="/admin" className="inline-block mt-4 text-xs text-white/25 hover:text-white/60 transition">
          Admin
        </Link>
      </footer>

      {order && <OrderModal order={order} onClose={() => setOrder(null)} />}
    </div>
  );
}

/* ---------- Admin page ---------- */
function Admin() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [keyInput, setKeyInput] = useState("");

  const ordersQuery = trpc.orders.list.useQuery(
    { key },
    { enabled: authed, retry: false }
  );
  const utils = trpc.useUtils();
  const updateStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => utils.orders.list.invalidate(),
  });

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    setKey(keyInput);
    setAuthed(true);
  };

  const cents = (c: number) => `€${(c / 100).toFixed(2).replace(".", ",")}`;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-lg mb-8">
          <ClipboardList className="w-6 h-6 text-violet-500" />
          Orders Admin
        </div>

        {!authed ? (
          <form onSubmit={login} className="max-w-sm mx-auto mt-24 bg-white/5 border border-white/10 rounded-2xl p-8">
            <h1 className="font-bold text-xl mb-4 text-center">Admin Login</h1>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-white/30 focus:border-violet-500 focus:outline-none mb-4"
            />
            <button className="w-full bg-violet-600 hover:bg-violet-500 py-3 rounded-xl font-bold transition">
              Log In
            </button>
          </form>
        ) : ordersQuery.isLoading ? (
          <p className="text-center text-white/50 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading orders…
          </p>
        ) : ordersQuery.isError ? (
          <div className="text-center">
            <p className="text-red-400 mb-4">Wrong password or server error.</p>
            <button onClick={() => setAuthed(false)} className="bg-white/10 px-6 py-2 rounded-full text-sm">Back</button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white/50 text-sm">{ordersQuery.data?.length ?? 0} order(s)</p>
            {(ordersQuery.data ?? []).map((o: NonNullable<typeof ordersQuery.data>[number]) => (
              <div key={o.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold">#{o.id} — {o.customerName}</p>
                    <p className="text-white/50 text-sm">{o.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-lg">{cents(o.total)}</span>
                    <select
                      value={o.status}
                      onChange={(e) =>
                        updateStatus.mutate({ key, id: Number(o.id), status: e.target.value as "new" | "paid" | "shipped" | "done" })
                      }
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm"
                    >
                      <option value="new">New</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-white/70 bg-white/5 rounded-xl p-3 mb-2 font-sans">{o.items}</pre>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-white/40">
                  <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {o.address}</span>
                  <span>Payment: {o.paymentMethod === "visa" ? "Visa" : "Bancontact"}</span>
                  <span>Shipping: {o.shipping === 0 ? "FREE" : cents(o.shipping)}</span>
                  <span>{new Date(o.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Shop />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Shop />} />
    </Routes>
  );
}
