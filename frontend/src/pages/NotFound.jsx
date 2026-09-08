import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-basalt text-bone flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-sm text-bone-dim mb-3">404</p>
        <h1 className="font-display text-4xl mb-4">Page not found</h1>

        <Link
          to="/"
          className="text-ochre-bright underline underline-offset-4"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
