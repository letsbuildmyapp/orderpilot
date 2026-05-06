import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container-edit py-32 text-center">
      <p className="eyebrow text-accent mb-6">404 · Out of stock</p>
      <h1 className="display-xl mb-6">
        This <em className="italic">lot</em><br />has been roasted out.
      </h1>
      <p className="text-ink-mute max-w-md mx-auto mb-10">
        The page you're looking for is on its way back to the warehouse. Try the catalog instead.
      </p>
      <Link to="/" className="btn-primary">Back home</Link>
    </div>
  );
}
