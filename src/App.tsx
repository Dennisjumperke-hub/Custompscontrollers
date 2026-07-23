import { useState } from "react";
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
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  img: string;
  color: string;
  tag?: string;
  desc: string;
};

const products: Product[] = [
  {
    id: "crimson",
    name: "Crimson Strike",
    price: 129,
    img: "/images/controller-red.png",
    color: "from-red-500 to-orange-500",
    tag: "Best Seller",
    desc: "Matte black shell with neon red accents and 2 remappable back buttons.",
  },
  {
    id: "frost",
    name: "Midnight Frost",
    price: 129,
    img: "/images/controller-blue.png",
    color: "from-blue-500 to-cyan-400",
    desc: "Midnight blue shell with chrome silver details and 2 back buttons.",
  },
  {
    id: "royal",
    name: "Royal Gold",
    price: 149,
    img: "/images/controller-gold.png",
    color: "from-amber-400 to-yellow-600",
    tag: "Premium",
    desc: "Pure white shell with gold accents — the luxury edition.",
  },
  {
    id: "venom",
    name: "Venom Green",
    price: 129,
    img: "/images/controller-green.png",
    color: "from-lime-400 to-emerald-600",
    desc: "Neon green and black shell for players who want to stand out.",
  },
];

const faqs = [
  {
    q: "What are back buttons?",
    a: "Back buttons (paddles) are extra buttons on the rear of the controller. You can map them to any face button, so you never have to take your thumbs off the sticks — perfect for competitive shooters like Call of Duty and Fortnite.",
  },
  {
    q: "Are these official Sony controllers?",
    a: "Yes. Every build starts from a brand-new official Sony DualSense controller, which we then customize with a new shell and back buttons.",
  },
  {
    q: "How long does shipping take?",
    a: "Each controller is built to order. Production takes 3–5 business days, plus 2–4 business days shipping within Belgium and the EU.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept Visa, Bancontact and PayPal. You'll receive a secure payment link after placing your order.",
  },
  {
    q: "Is there a warranty?",
    a: "Every controller comes with a 6-month warranty on the back buttons and customization, on top of Sony's standard hardware warranty.",
  },
];

export default function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);

  const orderMail = (p: Product) =>
    `mailto:orders@custompscontrollers.com?subject=${encodeURIComponent(
      `Order: ${p.name} Controller`
    )}&body=${encodeURIComponent(
      `Hi,\n\nI would like to order the "${p.name}" custom PS5 controller (€${p.price}).\n\nName:\nAddress:\nPreferred payment method (Visa / Bancontact / PayPal):\n\nThanks!`
    )}`;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <a href="#top" className="flex items-center gap-2 font-bold text-lg">
            <Gamepad2 className="w-6 h-6 text-violet-500" />
            Custom<span className="text-violet-500">PS</span>Controllers
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#shop" className="hover:text-white transition">Shop</a>
            <a href="#features" className="hover:text-white transition">Why Back Buttons</a>
            <a href="#process" className="hover:text-white transition">How It Works</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
            <a
              href="#shop"
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
            <a href="#shop" onClick={() => setMenuOpen(false)}>Shop</a>
            <a href="#features" onClick={() => setMenuOpen(false)}>Why Back Buttons</a>
            <a href="#process" onClick={() => setMenuOpen(false)}>How It Works</a>
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
              With Pro Back Buttons
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
            Official DualSense controllers, rebuilt by hand with premium custom
            shells and remappable back buttons. Play faster. React quicker. Win more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#shop"
              className="bg-violet-600 hover:bg-violet-500 px-8 py-4 rounded-full font-bold text-lg transition shadow-lg shadow-violet-600/30"
            >
              Shop Controllers
            </a>
            <a
              href="#features"
              className="border border-white/20 hover:border-white/40 px-8 py-4 rounded-full font-semibold text-lg transition"
            >
              Why Back Buttons?
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 mt-12 text-sm text-white/50 flex-wrap">
            <span className="flex items-center gap-2"><Truck className="w-4 h-4" /> EU Shipping</span>
            <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> 6-Month Warranty</span>
            <span className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> 4.9/5 from 200+ gamers</span>
          </div>
        </div>
      </section>

      {/* Shop */}
      <section id="shop" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">The Collection</h2>
          <p className="text-white/50 text-center mb-12 max-w-xl mx-auto">
            Every controller includes 2 remappable back buttons, installed and tested by hand.
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
                  <p className="text-white/50 text-sm mb-4 min-h-[3rem]">{p.desc}</p>
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
                text: "Assign any button to the two back paddles. Set it up once and it fits your playstyle — COD, Fortnite, FIFA, anything.",
              },
              {
                icon: Shield,
                title: "Built to Last",
                text: "Every back button is installed and stress-tested by hand. Covered by our 6-month warranty.",
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

      {/* Process */}
      <section id="process" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "1", t: "Pick Your Design", d: "Choose your favorite shell from the collection." },
              { n: "2", t: "Place Your Order", d: "Send us your order and pay securely via Visa, Bancontact or PayPal." },
              { n: "3", t: "We Build It", d: "We install the back buttons and custom shell, then test everything." },
              { n: "4", t: "Delivered to You", d: "Shipped to your door within 5–9 business days." },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-2xl font-extrabold shadow-lg shadow-violet-600/30">
                  {s.n}
                </div>
                <h3 className="font-bold mb-1">{s.t}</h3>
                <p className="text-white/50 text-sm">{s.d}</p>
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
          href="#shop"
          className="inline-block bg-violet-600 hover:bg-violet-500 px-10 py-4 rounded-full font-bold text-lg transition shadow-lg shadow-violet-600/30"
        >
          Shop Now
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

      {/* Order modal */}
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
              <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> 2 remappable back buttons included</p>
              <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> 6-month warranty</p>
              <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Pay via Visa, Bancontact or PayPal</p>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-white/50">Total</span>
              <span className="text-3xl font-extrabold">€{orderProduct.price}</span>
            </div>
            <a
              href={orderMail(orderProduct)}
              className="block w-full text-center bg-violet-600 hover:bg-violet-500 py-3.5 rounded-full font-bold transition"
            >
              Place Order via Email
            </a>
            <p className="text-center text-xs text-white/40 mt-3">
              You'll receive a secure payment link after we confirm your order.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
