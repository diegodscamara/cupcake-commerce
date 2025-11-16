export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-sm text-gray-600">
          Cupcakes @ {new Date().getFullYear()}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
