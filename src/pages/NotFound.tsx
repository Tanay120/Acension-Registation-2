// src/pages/NotFound.tsx
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react"; // An icon to signify a warning or error

const NotFound = () => {
  return (
    <main className="container flex flex-col items-center justify-center min-h-[80vh] text-center py-10">
      <Helmet>
        <title>404 Not Found | Ascension</title>
        <meta name="description" content="The page you were looking for could not be found." />
      </Helmet>

      <div className="animate-enter">
        <AlertTriangle className="mx-auto h-16 w-16 text-primary mb-6" />
        <h1 className="text-5xl md:text-7xl font-display font-semibold">404</h1>
        <h2 className="text-2xl md:text-3xl font-display mt-2">Page Not Found</h2>
        <p className="mt-4 max-w-md text-muted-foreground">
          It seems you've taken a wrong turn on the battlefield. The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/">Return to Base</Link>
        </Button>
      </div>
    </main>
  );
};

export default NotFound;