import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export default function OnboardingTour() {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('autocon_tour_completed');
    if (!hasSeenTour) {
      const tour = driver({
        showProgress: true,
        steps: [
          {
            element: '.db-sb-logo',
            popover: { title: 'Welcome to AutoCon', description: 'Your ultimate Web3 SaaS platform. Let’s show you around!', side: "right", align: 'start' }
          },
          {
            element: '.db-sb-nav',
            popover: { title: 'Navigation', description: 'Access smart contract generators, dashboard, and tools from here.', side: "right", align: 'start' }
          },
          {
            element: '.db-wallet-chip',
            popover: { title: 'Wallet & Network', description: 'Switch networks easily and see your active MetaMask connection.', side: "right", align: 'start' }
          },
          {
            popover: { title: 'Ready to build!', description: 'Go ahead and deploy your first smart contract.', align: 'center' }
          }
        ],
        onDestroyStarted: () => {
          if (!tour.hasNextStep() || confirm("Are you sure you want to skip the tour?")) {
            localStorage.setItem('autocon_tour_completed', 'true');
            tour.destroy();
          }
        },
      });
      
      // Give UI a moment to load before starting the tour
      setTimeout(() => tour.drive(), 500);
    }
  }, []);

  return null;
}
