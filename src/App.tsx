import { useMemo, useState } from "react";
import {
  Gamepad2,
  Zap,
  Shield,
  Truck,
  Star,
  ChevronDown,
  Check,
  Mail,
  CreditCard,
  Menu,
  X,
  Wrench,
} from "lucide-react";

/* ============================================================
   PRICES — easy to edit
   ============================================================ */
const SHIPPING_COST = 4.95; // shipping fee in EUR
const FREE_SHIPPING_FROM = 90; // free shipping from this subtotal

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
   Single color = €70 · Two or more colors = €90 */
const products: Product[] = [
  { id: "classic-white", name: "Classic White", price: 70, img: "/images/controllers/classic-white.jpg", color: "from-slate-300 to-slate-500", desc: "The timeless original DualSense look." },
  { id: "midnight-black", name: "Midnight Black", price: 70, img: "/images/controllers/midnight-black.jpg", color: "from-zinc-600 to-black", tag: "Best Seller", desc: "Sleek all-black official finish." },
  { id: "grey-camo", name: "Grey Camo", price: 90, img: "/images/controllers/grey-camo.jpg", color: "from-stone-500 to-stone-800", desc: "Urban camouflage for tactical players." },
  { id: "chameleon-blue", name: "Chameleon Blue", price: 90, img: "/images/controllers/chameleon-blue.jpg", color: "from-indigo-500 to-blue-700", desc: "Metallic blue-purple color-shifting shell." },
  { id: "pearl-white", name: "Pearl White", price: 90, img: "/images/controllers/pearl-white.jpg", color: "from-slate-200 to-purple-200", desc: "Iridescent pearl finish that shifts in the light." },
  { id: "chameleon-emerald", name: "Chameleon Emerald", price: 90, img: "/images/controllers/chameleon-emerald.jpg", color: "from-emerald-500 to-teal-700", desc: "Metallic green-teal color-shifting shell." },
  { id: "cobalt-blue", name: "Cobalt Blue", price: 70, img: "/images/controllers/cobalt-blue.jpg", color: "from-blue-600 to-indigo-800", desc: "Deep, rich metallic blue." },
  { id: "fortnite", name: "Fortnite Limited Edition", price: 90, img: "/images/controllers/fortnite-edition.jpg", color: "from-sky-400 to-blue-600", tag: "Limited", desc: "Official Fortnite limited edition design." },
  { id: "sky-blue", name: "Sky Blue", price: 70, img: "/images/controllers/sky-blue.jpg", color: "from-sky-400 to-cyan-600", desc: "Fresh and bright light blue." },
  { id: "tech-white", name: "Tech White Volt", price: 90, img: "/images/controllers/tech-white.jpg", color: "from-lime-300 to-slate-400", desc: "White shell with volt-green tech graphics." },
  { id: "nova-pink", name: "Nova Pink", price: 70, img: "/images/controllers/nova-pink.jpg", color: "from-pink-500 to-fuchsia-700", desc: "Bold, vibrant pink that stands out." },
  { id: "galaxy-purple", name: "Galaxy Purple", price: 70, img: "/images/controllers/galaxy-purple.jpg", color: "from-violet-500 to-purple-800", desc: "Rich metallic purple finish." },
  { id: "sterling-silver", name: "Sterling Silver", price: 70, img: "/images/controllers/sterling-silver.jpg", color: "from-gray-300 to-gray-500", desc: "Clean brushed silver look." },
  { id: "volcanic-red", name: "Volcanic Red", price: 90, img: "/images/controllers/volcanic-red.jpg", color: "from-red-500 to-red-800", desc: "Glossy red with black accents." },
  { id: "crimson-red", name: "Crimson Red", price: 70, img: "/images/controllers/crimson-red.jpg", color: "from-rose-500 to-red-800", desc: "Deep metallic crimson." },
  { id: "volt-green", name: "Volt Green", price: 90, img: "/images/controllers/volt-green.jpg", color: "from-lime-400 to-green-600", tag: "New", desc: "Electric lime green that pops." },
  { id: "electric-blue", name: "Electric Blue", price: 90, img: "/images/controllers/electric-blue.jpg", color: "from-cyan-400 to-blue-600", tag: "New", desc: "Bright electric blue with gloss finish." },
  { id: "spider-man", name: "Spider-Man Edition", price: 90, img: "/images/controllers/spider-man.jpg", color: "from-red-600 to-zinc-900", tag: "Limited", desc: "Black and red web design with spider emblem." },
];

/* Back paddles — prices are placeholders, easy to change */
const paddles: Paddle[] = [
  { id: "snow-rush", name: "Snow Rush", price: 54, img: "/images/paddles/snow-rush.jpg", color: "from-slate-300 to-slate-500" },
  { id: "chameleon-purple", name: "Chameleon Purple", price: 59, img: "/images/paddles/chameleon-purple.jpg", color: "from-purple-400 to-blue-500", tag: "Popular" },
  { id: "chameleon-green", name: "Chameleon Green", price: 59, img: "/images/paddles/chameleon-green.jpg", color: "from-teal-400 to-purple-500" },
  { id: "chrome-gold", name: "Chrome Gold", price: 64, img: "/images/paddles/chrome-gold.jpg", color: "from-amber-400 to-yellow-600", tag: "Premium" },
  { id: "carbon-fiber", name: "Carbon Fiber", price: 54, img: "/images/paddles/carbon-fiber.jpg", color: "from-zinc-500 to-zinc-800" },
  { id: "arctic-white", name: "Arctic White Grip", price: 54, img: "/images/paddles/arctic-white.jpg", color: "from-slate-200 to-slate-400" },
  { id: "wave-blue", name: "Wave Blue Grip", price: 54, img: "/images/paddles/wave-blue.jpg", color: "from-blue-500 to-indigo-700" },
  { id: "crimson-red", name: "Crimson Red Grip", price: 54, img: "/images/paddles/crimson-red.jpg", color: "from-red-500 to-rose-700" },
  { id: "venom-green", name: "Venom Green Grip", price: 54, img: "/images/paddles/venom-green.jpg", color: "from-lime-400 to-emerald-600" },
  { id: "dark-wood", name: "Dark Wood", price: 59, img: "/images/paddles/dark-wood.jpg", color: "from-amber-700 to-yellow-900" },
  { id: "stealth-black", name: "Stealth Black", price: 54, img: "/images/paddles/stealth-black.jpg", color: "from-zinc-600 to-black" },
  { id: "ruby-red", name: "Ruby Red Metallic", price: 59, img: "/images/paddles/ruby-red.jpg", color: "from-red-600 to-red-900" },
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
    q: "Which payment methods do you accept?",
    a: "We accept Visa, Bancontact and PayPal. You'll receive a secure payment link after placing your order.",
  },
  {
    q: "Is there a warranty?",
    a: "Every controller and back paddle comes with a 2-month warranty on the back buttons and customization, on top of Sony's standard hardware warranty.",
  },
];

export default function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);
  const [orderPaddle, setOrderPaddle] = useState<Paddle | null>(null);

  /* Configurator state */
  const [cfgController, setCfgController] = useState<Product>(products[0]);
  const [cfgPaddle, setCfgPaddle] = useState<Paddle | null>(null);

  const cfg = useMemo(() => {
    const subtotal = cfgController.price + (cfgPaddle?.price ?? 0);
    const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
    return { subtotal, shipping, total: subtotal + shipping };
  }, [cfgController, cfgPaddle]);

  const fmt = (n: number) => `€${n.toFixed(2).replace(".", ",")}`;

  const orderMail = (subject: string, body: string) =>
    `mailto:orders@custompscontrollers.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const productMail = (p: Product) =>
    orderMail(
      `Order: ${p.name} Controller`,
      `Hi,\n\nI would like to order the "${p.name}" custom PS5 controller (${fmt(p.price)}).\n\nName:\nAddress:\nPreferred payment method (Visa / Bancontact / PayPal):\n\nThanks!`
    );

  const paddleMail = (p: Paddle) => {
    const shipping = p.price >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
    return orderMail(
      `Order: ${p.name} Back Paddle`,
      `Hi,\n\nI would like to order the "${p.name}" back paddle kit.\n\nBack paddle: ${fmt(p.price)}\nShipping: ${shipping === 0 ? "FREE" : fmt(shipping)}\nTotal: ${fmt(p.price + shipping)}\n\nName:\nAddress:\nPreferred payment method (Visa / Bancontact / PayPal):\n\nThanks!`
    );
  };

  const configMail = () =>
    orderMail(
      `Order: ${cfgController.name} + ${cfgPaddle ? cfgPaddle.name : "no back paddle"}`,
      `Hi,\n\nI would like to order:\n\nController: ${cfgController.name} — ${fmt(cfgController.price)}\nBack paddle: ${cfgPaddle ? `${cfgPaddle.name} — ${fmt(cfgPaddle.price)}` : "None"}\n\nSubtotal: ${fmt(cfg.subtotal)}\nShipping: ${cfg.shipping === 0 ? "FREE" : fmt(cfg.shipping)}\nTotal: ${fmt(cfg.total)}\n\nName:\nAddress:\nPreferred payment method (Visa / Bancontact / PayPal):\n\nThanks!`
    );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
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
                    <span className="text-2xl font-extrabold">€{p.price}</span>
                    <button
                      onClick={() => setOrderProduct(p)}
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
                    <span className="text-xl font-extrabold">€{p.price}</span>
                    <button
                      onClick={() => setOrderPaddle(p)}
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
              <a
                href={configMail()}
                className="mt-6 block w-full text-center bg-violet-600 hover:bg-violet-500 py-3.5 rounded-full font-bold transition"
              >
                Order This Build
              </a>
              <p className="text-center text-xs text-white/40 mt-3">
                Pay securely via Visa, Bancontact or PayPal after confirmation.
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
          <CreditCard className="w-10 h-10 mx-auto mb-4 text-violet-300" />
          <h2 className="text-2xl font-bold mb-3">Secure Payment</h2>
          <p className="text-white/60 mb-6">Pay the way you like — safe and simple.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            {["Visa", "Bancontact", "PayPal"].map((m) => (
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
          <Mail className="w-4 h-4" /> orders@custompscontrollers.com
        </p>
        <p>© {new Date().getFullYear()} CustomPSControllers. Not affiliated with Sony Interactive Entertainment.</p>
      </footer>

      {/* Controller order modal */}
      {orderProduct && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOrderProduct(null)}>
          <div className="bg-[#14141c] border border-white/10 rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold">Order: {orderProduct.name}</h3>
              <button onClick={() => setOrderProduct(null)} className="p-1 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={orderProduct.img} alt={orderProduct.name} className="w-full aspect-square object-cover rounded-xl mb-4" />
            <div className="space-y-2 text-sm text-white/70 mb-6">
              <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Custom shell, hand-built</p>
              <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> 2-month warranty</p>
              <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Pay via Visa, Bancontact or PayPal</p>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/50">Controller</span>
              <span className="text-2xl font-extrabold">{fmt(orderProduct.price)}</span>
            </div>
            <p className="text-right text-xs text-white/40 mb-6">
              + {orderProduct.price >= FREE_SHIPPING_FROM ? "FREE shipping" : `${fmt(SHIPPING_COST)} shipping`}
            </p>
            <a
              href={productMail(orderProduct)}
              className="block w-full text-center bg-violet-600 hover:bg-violet-500 py-3.5 rounded-full font-bold transition"
            >
              Place Order via Email
            </a>
          </div>
        </div>
      )}

      {/* Paddle order modal */}
      {orderPaddle && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOrderPaddle(null)}>
          <div className="bg-[#14141c] border border-white/10 rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold">Order: {orderPaddle.name}</h3>
              <button onClick={() => setOrderPaddle(null)} className="p-1 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={orderPaddle.img} alt={orderPaddle.name} className="w-full aspect-square object-cover rounded-xl mb-4" />
            <div className="space-y-2 text-sm text-white/70 mb-6">
              <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> 4 remappable back buttons kit</p>
              <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> 2-month warranty</p>
              <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Pay via Visa, Bancontact or PayPal</p>
            </div>
            <div className="space-y-1.5 text-sm mb-6">
              <div className="flex justify-between"><span className="text-white/50">Back paddle</span><span className="font-bold">{fmt(orderPaddle.price)}</span></div>
              <div className="flex justify-between">
                <span className="text-white/50">Shipping</span>
                <span className={orderPaddle.price >= FREE_SHIPPING_FROM ? "text-green-400 font-semibold" : ""}>
                  {orderPaddle.price >= FREE_SHIPPING_FROM ? "FREE" : fmt(SHIPPING_COST)}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-lg font-extrabold">
                <span>Total</span>
                <span>{fmt(orderPaddle.price + (orderPaddle.price >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST))}</span>
              </div>
            </div>
            <a
              href={paddleMail(orderPaddle)}
              className="block w-full text-center bg-violet-600 hover:bg-violet-500 py-3.5 rounded-full font-bold transition"
            >
              Place Order via Email
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
