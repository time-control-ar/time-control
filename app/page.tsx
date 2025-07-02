import EventsListSearch from '@/components/events/events-list-search';
import { ModeToggle } from '@/components/mode-toggle';
import AnimatedLogo from "@/components/ui/animated-logo";
import { SignInButton } from '@/components/ui/sign-in-button';

export default function Home() {

  return (
    <div className="flex flex-col h-full font-[family-name:var(--font-geist-sans)] relative bg-white dark:bg-gray-950 overflow-y-auto">

      <div className="px-6 w-full flex justify-between items-center">
        <AnimatedLogo />


        <div className="flex items-center gap-2">
          <ModeToggle />
          <SignInButton />
        </div>
      </div>

      <EventsListSearch />

    </div>
  );
}
