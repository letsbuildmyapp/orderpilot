export function Footer() {
  return (
    <footer className="border-t border-line mt-24 py-12">
      <div className="container-edit grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <p className="font-serif text-2xl">OrderPilot<span className="text-accent">.</span></p>
          <p className="text-ink-mute mt-2 max-w-xs">
            B2B coffee wholesale, configured. A portfolio demo by letsbuildmyapp.com — no real coffee, no real charges.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Roastery</p>
          <ul className="space-y-1 text-ink-soft">
            <li>Brooklyn, NY</li>
            <li>Mon–Fri 7a–4p</li>
            <li>hello@orderpilot.test</li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Demo</p>
          <ul className="space-y-1 text-ink-soft">
            <li>Test card: 4242 4242 4242 4242</li>
            <li>Sign in: <code className="text-xs">cafe@orderpilot.test / demo1234</code></li>
            <li>Admin: <code className="text-xs">admin@orderpilot.test / demo1234</code></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
