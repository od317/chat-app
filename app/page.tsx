import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Chat App</h1>
          <ThemeToggle />
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-highlights rounded-lg">
            <h2 className="text-xl font-semibold text-secondary">
              Theme Testing
            </h2>
            <p className="text-foreground">
              This is a test of your custom colors.
            </p>
            <button className="mt-2 px-4 py-2 bg-primary text-highlights rounded hover:bg-secondary transition-colors">
              Primary Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
