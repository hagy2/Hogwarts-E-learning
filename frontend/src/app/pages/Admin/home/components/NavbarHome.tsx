import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const NavbarHome = () => {
  const router = useRouter();

  const handleSignOut = () => {
    // Clear the token if needed
    router.push('/pages/auth/login');
  };

  return (
    <nav className="bg-[#1e1e1e] p-4 text-white">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Hogwarts-E-learning
        </Link>
        <ul className="flex gap-4">
        <li>
        <Link href="/pages/Admin/courses" className="hover:text-gray-300">
              courses
            </Link>
          </li>
          <li>
            <Link href="/pages/Admin/profile" className="hover:text-gray-300">
              Profile
            </Link>
          </li>
          
            
          <li>
            <a href="#" onClick={handleSignOut} className="hover:text-gray-300">
              Sign Out
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavbarHome;
