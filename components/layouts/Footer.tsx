import Image from 'next/image';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white py-6">
      <div className="container mx-auto px-4 text-center text-sm text-gray-600">
        <p>&copy; {new Date().getFullYear()} OphthalmoScan-AI. All rights reserved.</p>
      </div>
    </footer>
  );
}
