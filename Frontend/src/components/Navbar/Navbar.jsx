import { useState } from "react";
import { FileCheck2, Bell, ChevronDown } from "lucide-react";

const TABS = ["Analyze", "History", "Settings"];

export default function Navbar({
  appName = "ATS Resume Scorer",
  tabs = TABS,
  activeTab: initialTab = "Analyze",
  onTabChange,
  user = null, //come from center/app
  hasNotifications = false,
  isLoggedIn = false, // <-- new
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTab = (tab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Left: logo + tabs */}
        <div className="flex items-center gap-4 sm:gap-8">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <FileCheck2 className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <span className="hidden text-lg font-bold tracking-tight text-gray-900 sm:inline">
              {appName}
            </span>
          </a>

          <ul className="flex items-center gap-1">
            {tabs.map((tab) => {
              const active = tab === activeTab;
              return (
                <li key={tab}>
                  <button
                    type="button"
                    onClick={() => handleTab(tab)}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-lg px-4 py-2.5 text-[15px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      active
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {tab}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right: notifications + user -> if user is logedin , then display this */}
        {isLoggedIn && (
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Bell className="h-5 w-5" />
              {hasNotifications && (
                <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>

            <button
              type="button"
              className="flex items-center gap-3 rounded-lg p-1 text-left transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                  {initials}
                </span>
              )}
              <span className="hidden leading-tight md:block">
                <span className="block text-[15px] font-semibold text-gray-900">
                  {user.name}
                </span>
                <span className="block text-sm text-gray-500">{user.role}</span>
              </span>
              <ChevronDown className="hidden h-4 w-4 text-gray-400 md:block" />
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
