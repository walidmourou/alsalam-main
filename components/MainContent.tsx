export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 min-h-0">
      {children}
    </main>
  );
}
