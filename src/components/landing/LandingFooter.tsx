
export function LandingFooter() {
  return (
    <footer className="bg-white/80 text-gray-500 text-center py-8 border-t">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="font-bold text-brand-700">Saaslyzer</span> &copy; {new Date().getFullYear()}
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-brand-700">Terms</a>
            <a href="#" className="text-gray-600 hover:text-brand-700">Privacy</a>
            <a href="mailto:support@saaslyzer.com" className="text-gray-600 hover:text-brand-700">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
